import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Project } from '../models/project.model';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

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
      projectStatus: res.projectStatus || 'DRAFT',
      sector: res.sector || '',
      country: res.country || '',
      countryCode: res.countryCode || '',
      region: res.region || '',
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

    const payload = {
      entrepreneurId,
      title: String(projectData.title || '').trim(),
      summary: String(projectData.summary || projectData.description || '').trim(),
      sector: String(projectData.sector || '').trim(),
      country: projectData.country || '',
      countryCode: projectData.countryCode || '',
      region: projectData.region || '',
      keyword: projectData.keyword || '',
      founderExperienceYears: Number(projectData.founderExperienceYears || 0),
      fundingRounds: Number(projectData.fundingRounds || 0),
      teamSize: Number(projectData.teamSize || 0),
      marketSizeBillion: Number(projectData.marketSizeBillion || 0),
      marketGrowthRatePercent: Number(projectData.marketGrowthRatePercent || 0),
      productTractionUsers: Number(projectData.productTractionUsers || 0),
      burnRateMillion: Number(projectData.burnRateMillion || 0),
      revenueMillion: Number(projectData.revenueMillion || 0),
      runwayMonths: Number(projectData.runwayMonths || 0),
      founderBackground: projectData.founderBackground || '',
      competitionLevel: projectData.competitionLevel || '',
      searchTrendScore: Number(projectData.searchTrendScore || 0),
      viewsWorldRank: Number(projectData.viewsWorldRank || 0),
      opinions: projectData.opinions || ''
    };

    return this.http.post<any>(this.baseUrl, payload).pipe(
      map(res => this.mapResponseToProject(res)),
      tap(newProj => {
        const current = this.projectsSubject.value;
        this.projectsSubject.next([...current, newProj]);
      })
    );
  }

  updateProject(id: string, updates: any): Observable<Project | undefined> {
    const payload = {
      title: updates.title,
      summary: updates.summary || updates.description,
      sector: updates.sector,
      country: updates.country || '',
      countryCode: updates.countryCode || '',
      region: updates.region || '',
      keyword: updates.keyword || '',
      founderExperienceYears: Number(updates.founderExperienceYears || 0),
      fundingRounds: Number(updates.fundingRounds || 0),
      teamSize: Number(updates.teamSize || 0),
      marketSizeBillion: Number(updates.marketSizeBillion || 0),
      marketGrowthRatePercent: Number(updates.marketGrowthRatePercent || 0),
      productTractionUsers: Number(updates.productTractionUsers || 0),
      burnRateMillion: Number(updates.burnRateMillion || 0),
      revenueMillion: Number(updates.revenueMillion || 0),
      runwayMonths: Number(updates.runwayMonths || 0),
      founderBackground: updates.founderBackground || '',
      competitionLevel: updates.competitionLevel || '',
      searchTrendScore: Number(updates.searchTrendScore || 0),
      viewsWorldRank: Number(updates.viewsWorldRank || 0),
      opinions: updates.opinions || ''
    };

    return this.http.put<any>(`${this.baseUrl}/${id}`, payload).pipe(
      map(res => this.mapResponseToProject(res)),
      tap(updatedProj => {
        const current = this.projectsSubject.value.map(p => p.id === id ? updatedProj : p);
        this.projectsSubject.next(current);
      })
    );
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



