import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Project } from '../models/project.model';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';
import { countryCodeFor } from '../data/location-options';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private baseUrl = `${environment.apiUrl}/projects`;

  private projectsSubject = new BehaviorSubject<Project[]>([]);
  public projects$ = this.projectsSubject.asObservable();
  private loadedProjectsUserId: string | null = null;

  private mapResponseToProject(res: any): Project {
    return {
      ...res,
      id: res.id,
      entrepreneurId: res.entrepreneurId || '',
      title: res.title || '',
      summary: res.summary || res.description || '',
      description: res.description || res.summary || '',
      projectStage: res.projectStage || this.inferProjectStage(res),
      problem: res.problem || '',
      solution: res.solution || '',
      projectStatus: res.projectStatus || 'DRAFT',
      sector: res.sector || '',
      country: res.country || '',
      countryCode: res.countryCode || '',
      region: res.region || '',
      city: res.city || res.region || '',
      targetMarketScope: res.targetMarketScope || 'Local',
      targetCustomers: res.targetCustomers || '',
      keyword: res.keyword || '',
      founderExperienceYears: res.founderExperienceYears || 0,
      fundingRounds: res.fundingRounds || 0,
      teamSize: res.teamSize || 0,
      marketSizeBillion: res.marketSizeBillion || 0,
      marketGrowthRatePercent: res.marketGrowthRatePercent || 0,
      productTractionUsers: res.productTractionUsers || 0,
      burnRateMillion: res.burnRateMillion || 0,
      revenueMillion: res.revenueMillion || 0,
      runwayMonths: res.runwayMonths || 0,
      founderBackground: res.founderBackground || '',
      competitionLevel: res.competitionLevel || '',
      searchTrendScore: res.searchTrendScore || 0,
      viewsWorldRank: res.viewsWorldRank || 0,
      opinions: res.opinions || '',
      hasPrototype: !!res.hasPrototype,
      estimatedInitialBudget: res.estimatedInitialBudget || 0,
      expectedMonthlyExpenses: res.expectedMonthlyExpenses || 0,
      currency: res.currency || 'MAD',
      usersOrCustomers: res.usersOrCustomers || res.productTractionUsers || 0,
      monthlyRevenue: res.monthlyRevenue || 0,
      monthlyExpenses: res.monthlyExpenses || 0,
      fundingStatus: res.fundingStatus || 'NO_FUNDING',
      mainChallenges: res.mainChallenges || '',
      expectedSupportNeeds: res.expectedSupportNeeds || '',
      customerFeedbacks: res.customerFeedbacks || res.opinions || '',
      createdAt: res.createdAt || ''
    };
  }

  getProjects(): Observable<Project[]> {
    const currentUser = this.authService.currentUser;
    if (!currentUser || !currentUser.id) {
      return of([]);
    }

    if (this.loadedProjectsUserId === currentUser.id) {
      return of(this.projectsSubject.value);
    }

    if (currentUser.role === 'specialist') {
      // TODO backend: expose assigned/recommended projects for a specialist.
      this.loadedProjectsUserId = currentUser.id;
      this.projectsSubject.next([]);
      return of([]);
    }

    return this.refreshProjects();
  }

  refreshProjects(): Observable<Project[]> {
    const currentUser = this.authService.currentUser;
    if (!currentUser || !currentUser.id) {
      return of([]);
    }

    if (currentUser.role === 'specialist') {
      this.loadedProjectsUserId = currentUser.id;
      this.projectsSubject.next([]);
      return of([]);
    }

    return this.http.get<any[]>(`${this.baseUrl}/entrepreneur/${currentUser.id}`).pipe(
      map(list => list.map(p => this.mapResponseToProject(p))),
      tap(projects => {
        this.loadedProjectsUserId = currentUser.id;
        this.projectsSubject.next(projects);
      })
    );
  }

  getProjectById(id: string): Observable<Project | undefined> {
    return this.http.get<any>(`${`${this.baseUrl}/${id}`}`).pipe(
      map(res => {
        if (!res) return undefined;
        return this.mapResponseToProject(res);
      })
    );
  }

  createProject(projectData: any): Observable<Project> {
    const currentUser = this.authService.currentUser;
    const entrepreneurId = currentUser?.id || 'unknown';

    const payload = this.toProjectPayload(projectData, entrepreneurId);

    return this.http.post<any>(`${this.baseUrl}/${entrepreneurId}`, payload).pipe(
      map(res => this.mapResponseToProject(res)),
      tap(newProj => {
        const current = this.projectsSubject.value;
        this.projectsSubject.next([...current, newProj]);
      })
    );
  }

  updateProject(id: string, updates: any): Observable<Project | undefined> {
    const payload = this.toProjectPayload(updates);

    return this.http.put<any>(`${this.baseUrl}/${id}`, payload).pipe(
      map(res => this.mapResponseToProject(res)),
      tap(updatedProj => {
        const current = this.projectsSubject.value.map(p => p.id === id ? updatedProj : p);
        this.projectsSubject.next(current);
      })
    );
  }

  private toProjectPayload(projectData: any, entrepreneurId?: string): any {
    const stage = projectData.projectStage || 'IDEA_ONLY';
    const currency = projectData.currency || 'MAD';
    const monthlyRevenue = stage === 'ALREADY_LAUNCHED' ? Number(projectData.monthlyRevenue || 0) : 0;
    const monthlyExpenses = stage === 'ALREADY_LAUNCHED'
      ? Number(projectData.monthlyExpenses || 0)
      : Number(projectData.expectedMonthlyExpenses || 0);
    const usersOrCustomers = stage === 'ALREADY_LAUNCHED' ? Number(projectData.usersOrCustomers || 0) : 0;
    const funding = this.fundingToLegacy(projectData.fundingStatus || 'NO_FUNDING');
    const city = String(projectData.city || projectData.region || '').trim();
    const realSector = String(projectData.sector || '').trim();
    const normalizedSectorForML = this.normalizeSectorForML(realSector);

    // User amounts are collected in real-world currency and normalized internally for ML compatibility.
    return {
      entrepreneurId,
      title: String(projectData.title || '').trim(),
      description: String(projectData.description || projectData.summary || '').trim(),
      projectStage: stage,
      problem: String(projectData.problem || '').trim(),
      solution: String(projectData.solution || '').trim(),
      sector: realSector,
      country: projectData.country || 'Morocco',
      countryCode: this.countryToCode(projectData.country || 'Morocco'),
      region: city,
      city,
      targetMarketScope: projectData.targetMarketScope || 'Local',
      targetCustomers: String(projectData.targetCustomers || '').trim(),
      founderExperienceYears: Number(projectData.founderExperienceYears || 0),
      fundingRounds: funding.fundingRounds,
      teamSize: Number(projectData.teamSize || 1),
      marketSizeBillion: this.estimateMarketSize(projectData.targetMarketScope),
      marketGrowthRatePercent: this.estimateMarketGrowth(normalizedSectorForML),
      productTractionUsers: usersOrCustomers,
      burnRateMillion: this.amountToMillions(monthlyExpenses, currency),
      revenueMillion: this.amountToMillions(monthlyRevenue, currency),
      investorType: funding.investorType,
      competitionLevel: projectData.competitionLevel || 'Medium',
      searchTrendScore: this.estimateSearchTrend(normalizedSectorForML),
      userWordBank: false,
      hasPrototype: !!projectData.hasPrototype,
      estimatedInitialBudget: Number(projectData.estimatedInitialBudget || 0),
      expectedMonthlyExpenses: Number(projectData.expectedMonthlyExpenses || 0),
      currency,
      usersOrCustomers,
      monthlyRevenue,
      monthlyExpenses,
      fundingStatus: projectData.fundingStatus || 'NO_FUNDING',
      mainChallenges: String(projectData.mainChallenges || '').trim(),
      expectedSupportNeeds: String(projectData.expectedSupportNeeds || '').trim(),
      customerFeedbacks: String(projectData.customerFeedbacks || '').trim(),
      opinions: String(projectData.customerFeedbacks || projectData.opinions || '').trim()
    };
  }

  private amountToMillions(amount: number, currency: string): number {
    const usd = Number(amount || 0) * this.currencyToUsdRate(currency);
    return Math.max(usd / 1_000_000, 0);
  }

  private currencyToUsdRate(currency: string): number {
    const rates: Record<string, number> = {
      MAD: 0.10,
      EUR: 1.08,
      USD: 1
    };
    return rates[currency] || 1;
  }

  private fundingToLegacy(status: string): { investorType: string; fundingRounds: number } {
    const mapping: Record<string, { investorType: string; fundingRounds: number }> = {
      NO_FUNDING: { investorType: 'none', fundingRounds: 0 },
      SELF_FUNDED: { investorType: 'none', fundingRounds: 0 },
      FAMILY_FRIENDS: { investorType: 'angel', fundingRounds: 0 },
      ANGEL_INVESTOR: { investorType: 'angel', fundingRounds: 1 },
      INCUBATOR_GRANT: { investorType: 'angel', fundingRounds: 1 },
      VENTURE_CAPITAL: { investorType: 'tier2_vc', fundingRounds: 1 },
      BANK_LOAN: { investorType: 'none', fundingRounds: 1 }
    };
    return mapping[status] || mapping['NO_FUNDING'];
  }

  private countryToCode(country: string): string {
    return countryCodeFor(country);
  }

  private normalizeSectorForML(sector: string): string {
    const mapping: Record<string, string> = {
      'SaaS / Software': 'SaaS',
      'Artificial Intelligence': 'SaaS',
      'Education / EdTech': 'Education',
      'Health / MedTech': 'Health',
      FinTech: 'Finance',
      'Agriculture / AgriTech': 'Agriculture',
      'Food & Beverage': 'Food',
      'Tourism / Travel': 'Travel',
      'Logistics / Delivery': 'Logistics',
      'Real Estate / PropTech': 'Real Estate',
      'Fashion / Beauty': 'Retail',
      'Energy / CleanTech': 'Energy',
      'Environment / Recycling': 'Energy',
      LegalTech: 'Legal',
      'HR / Recruitment': 'Services',
      'Marketing / Advertising': 'Marketing',
      'Media / Content': 'Media',
      'Sports / Fitness': 'Health',
      'Non-profit / Association': 'Social Impact',
      'Handmade / Crafts': 'Retail',
      'Local Services': 'Services'
    };
    return mapping[sector] || sector || 'SaaS';
  }

  private estimateMarketSize(scope: string): number {
    const mapping: Record<string, number> = {
      Local: 0.05,
      Regional: 0.2,
      National: 1,
      International: 8
    };
    return mapping[scope] ?? 0.2;
  }

  private estimateMarketGrowth(sector: string): number {
    const mapping: Record<string, number> = {
      Education: 6,
      SaaS: 10,
      Finance: 7,
      Health: 6,
      Retail: 4,
      'E-commerce': 8,
      Food: 4,
      'Real Estate': 5,
      Agriculture: 5,
      Energy: 8,
      Marketplace: 7,
      Travel: 5,
      Logistics: 6,
      Transportation: 5,
      Manufacturing: 4,
      Construction: 4,
      Cybersecurity: 9,
      Legal: 5,
      Services: 4,
      Marketing: 6,
      Media: 5,
      Gaming: 7,
      'Social Impact': 4
    };
    return mapping[sector] ?? 5;
  }

  private estimateSearchTrend(sector: string): number {
    const mapping: Record<string, number> = {
      Education: 58,
      SaaS: 68,
      Finance: 62,
      Health: 60,
      Retail: 52,
      'E-commerce': 64,
      Food: 50,
      'Real Estate': 55,
      Agriculture: 48,
      Energy: 63,
      Marketplace: 58,
      Travel: 54,
      Logistics: 56,
      Transportation: 53,
      Manufacturing: 46,
      Construction: 45,
      Cybersecurity: 66,
      Legal: 48,
      Services: 50,
      Marketing: 57,
      Media: 55,
      Gaming: 60,
      'Social Impact': 49
    };
    return mapping[sector] ?? 50;
  }

  private inferProjectStage(project: any): string {
    return Number(project.monthlyRevenue || project.revenueMillion || 0) > 0
      || Number(project.usersOrCustomers || project.productTractionUsers || 0) > 0
      ? 'ALREADY_LAUNCHED'
      : 'IDEA_ONLY';
  }

  submitProject(id: string): Observable<Project> {
    return this.http.put<any>(`${this.baseUrl}/${id}/submit`, {}).pipe(
      map(res => this.mapResponseToProject(res)),
      tap(updatedProj => {
        const current = this.projectsSubject.value.map(p => p.id === id ? updatedProj : p);
        this.projectsSubject.next(current);
      })
    );
  }

  deleteProject(id: string): Observable<boolean> {
    return this.http.delete(`${this.baseUrl}/${id}`, { responseType: 'text' }).pipe(
      map(() => true),
      tap(() => {
        const current = this.projectsSubject.value;
        this.projectsSubject.next(current.filter(p => p.id !== id));
      })
    );
  }

}



