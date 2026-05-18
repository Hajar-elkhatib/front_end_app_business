import { Injectable, inject } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { Project } from '../models/project.model';
import { SpecialistService } from './specialist.service';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private specialistService = inject(SpecialistService);

  private mockProjects: Project[] = [
    {
      id: '1',
      title: 'Nexus E-commerce Integration',
      description: 'Next-gen online store platform integration featuring reactive catalog, smooth shopping cart, checkout microservices, and AI-powered product recommendation block.',
      budget: 15000,
      deadline: '2026-08-15',
      category: 'Frontend Architecture',
      status: 'active',
      assignedSpecialistId: '2',
      analysisSummary: 'The project frontend architecture is 80% configured. Redux state setup is pending cart optimization. Core responsive components are active. E-commerce metrics show standard load times under 1.2s.',
      progress: 75,
      createdAt: '2026-04-10',
      updatedAt: '2026-05-14',
      priority: 'high',
      tags: ['Angular 21', 'RxJS', 'NgRx', 'TailwindCSS', 'Stripe API'],
      aiScores: {
        marketScore: 88,
        successProbability: 92,
        competitionLevel: 'Medium',
        sentimentScore: 84
      }
    },
    {
      id: '2',
      title: 'AI Marketing Tool & NLP Parser',
      description: 'Automated ad campaign generator using custom-trained LLMs, parsing user specifications and outputting high-performing copywriting variants across social networks.',
      budget: 28000,
      deadline: '2026-10-30',
      category: 'AI Engineering',
      status: 'planning',
      assignedSpecialistId: '1',
      analysisSummary: 'System architecture definition in progress. Model fine-tuning parameters selected. Pending initial API keys structure.',
      progress: 15,
      createdAt: '2026-05-02',
      updatedAt: '2026-05-18',
      priority: 'critical',
      tags: ['Python', 'OpenAI API', 'FastAPI', 'LangChain', 'PostgreSQL'],
      aiScores: {
        marketScore: 95,
        successProbability: 85,
        competitionLevel: 'High',
        sentimentScore: 91
      }
    },
    {
      id: '3',
      title: 'Cloud Orchestration & CI/CD pipeline',
      description: 'High-availability infrastructure setup leveraging AWS Elastic Kubernetes Service (EKS), complete with Terraform scripts, auto-scaling groups, and custom Prometheus dashboards.',
      budget: 12000,
      deadline: '2026-06-20',
      category: 'Cloud DevOps',
      status: 'completed',
      assignedSpecialistId: '3',
      analysisSummary: 'Infrastructure deployed successfully. Pipeline automated. Core alerts configured. Final audit confirms 99.99% simulated uptime.',
      progress: 100,
      createdAt: '2026-03-15',
      updatedAt: '2026-05-05',
      priority: 'medium',
      tags: ['AWS EKS', 'Kubernetes', 'Terraform', 'GitHub Actions', 'Prometheus'],
      aiScores: {
        marketScore: 78,
        successProbability: 98,
        competitionLevel: 'Low',
        sentimentScore: 80
      }
    },
    {
      id: '4',
      title: 'Smart Contract Auditor',
      description: 'Decentralized finance security analysis protocol that screens Solidity contracts for standard reentrancy vulnerabilities and generates cryptographic audit reports.',
      budget: 22000,
      deadline: '2026-09-01',
      category: 'Backend Development',
      status: 'pending',
      analysisSummary: 'Awaiting expert allocation. Initial contract documentation received and compiled.',
      progress: 0,
      createdAt: '2026-05-12',
      updatedAt: '2026-05-12',
      priority: 'high',
      tags: ['Solidity', 'Rust', 'Web3.js', 'Ethereum', 'Docker'],
      aiScores: {
        marketScore: 82,
        successProbability: 76,
        competitionLevel: 'Medium',
        sentimentScore: 70
      }
    }
  ];

  private projectsSubject = new BehaviorSubject<Project[]>(this.mockProjects);
  public projects$ = this.projectsSubject.asObservable();

  getProjects(): Observable<Project[]> {
    return this.projects$.pipe(
      map(projects => projects.map(p => this.populateSpecialist(p))),
      delay(500)
    );
  }

  getProjectById(id: string): Observable<Project | undefined> {
    return this.projects$.pipe(
      map(projects => {
        const found = projects.find(p => p.id === id);
        return found ? this.populateSpecialist(found) : undefined;
      }),
      delay(300)
    );
  }

  createProject(project: Omit<Project, 'id' | 'createdAt' | 'progress' | 'updatedAt' | 'priority' | 'tags' | 'aiScores'>): Observable<Project> {
    const today = new Date().toISOString().split('T')[0];
    const newProject: Project = {
      ...project,
      id: Date.now().toString(),
      progress: 0,
      createdAt: today,
      updatedAt: today,
      priority: 'medium',
      tags: [project.category, 'NexusAI Bootstrapped'],
      aiScores: {
        marketScore: 75,
        successProbability: 80,
        competitionLevel: 'Medium',
        sentimentScore: 75
      },
      analysisSummary: 'Project container successfully initialized. Awaiting specialist interactions and milestone configurations.'
    };
    const current = this.projectsSubject.value;
    this.projectsSubject.next([...current, newProject]);
    return of(newProject).pipe(delay(600));
  }

  updateProject(id: string, updates: Partial<Project>): Observable<Project | undefined> {
    let updatedProj: Project | undefined;
    const current = this.projectsSubject.value.map(p => {
      if (p.id === id) {
        updatedProj = { 
          ...p, 
          ...updates,
          updatedAt: new Date().toISOString().split('T')[0]
        };
        return updatedProj;
      }
      return p;
    });
    this.projectsSubject.next(current);
    return of(updatedProj ? this.populateSpecialist(updatedProj) : undefined).pipe(delay(500));
  }

  deleteProject(id: string): Observable<boolean> {
    const current = this.projectsSubject.value;
    this.projectsSubject.next(current.filter(p => p.id !== id));
    return of(true).pipe(delay(400));
  }

  private populateSpecialist(project: Project): Project {
    if (project.assignedSpecialistId) {
      const specs = [
        { id: '1', fullName: 'Sarah Jenkins', expertiseDomain: 'AI Engineering', avatarUrl: 'S', hourlyRate: 120, averageRating: 4.9, available: true, skills: [], location: '', languages: [], bio: '', yearsExperience: 5 },
        { id: '2', fullName: 'David Chen', expertiseDomain: 'Frontend Architecture', avatarUrl: 'D', hourlyRate: 95, averageRating: 4.8, available: true, skills: [], location: '', languages: [], bio: '', yearsExperience: 6 },
        { id: '3', fullName: 'Elena Rodriguez', expertiseDomain: 'Cloud DevOps', avatarUrl: 'E', hourlyRate: 110, averageRating: 5.0, available: false, skills: [], location: '', languages: [], bio: '', yearsExperience: 7 },
        { id: '4', fullName: 'Marcus Williams', expertiseDomain: 'Backend Development', avatarUrl: 'M', hourlyRate: 105, averageRating: 4.7, available: true, skills: [], location: '', languages: [], bio: '', yearsExperience: 4 },
        { id: '5', fullName: 'Yuki Tanaka', expertiseDomain: 'UI/UX Design', avatarUrl: 'Y', hourlyRate: 90, averageRating: 4.9, available: true, skills: [], location: '', languages: [], bio: '', yearsExperience: 5 },
        { id: '6', fullName: 'Omar Hassan', expertiseDomain: 'AI Engineering', avatarUrl: 'O', hourlyRate: 130, averageRating: 4.9, available: true, skills: [], location: '', languages: [], bio: '', yearsExperience: 8 }
      ];
      const found = specs.find(s => s.id === project.assignedSpecialistId);
      if (found) {
        project.assignedSpecialist = found as any;
      }
    }
    return project;
  }
}
