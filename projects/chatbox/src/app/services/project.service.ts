import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'active' | 'completed';
}

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private projects: Project[] = [
    { id: '1', name: 'Nexus E-commerce', description: 'Next-gen online store platform.', status: 'active' },
    { id: '2', name: 'AI Marketing Tool', description: 'Automated ad campaign generator.', status: 'planning' }
  ];

  getProjects(): Observable<Project[]> {
    return of(this.projects).pipe(delay(500));
  }
}
