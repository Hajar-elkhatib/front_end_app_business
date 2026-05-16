import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { Specialist, SpecialistReview } from '../models/specialist.model';

@Injectable({
  providedIn: 'root'
})
export class SpecialistService {
  private mockSpecialists: Specialist[] = [
    {
      id: '1', fullName: 'Sarah Jenkins', expertiseDomain: 'AI Engineering',
      skills: ['Python', 'TensorFlow', 'NLP', 'PyTorch', 'Computer Vision'],
      hourlyRate: 120, location: 'San Francisco, CA', languages: ['English', 'Spanish'],
      bio: 'Senior AI Engineer with 8 years of experience building scalable machine learning models and NLP pipelines. Former tech lead at a FAANG company. Passionate about bringing cutting-edge AI research into production systems.',
      yearsExperience: 8, averageRating: 4.9, avatarUrl: 'S', available: true, completedProjects: 34, responseRate: 98
    },
    {
      id: '2', fullName: 'David Chen', expertiseDomain: 'Frontend Architecture',
      skills: ['Angular', 'TypeScript', 'RxJS', 'Tailwind CSS', 'Next.js'],
      hourlyRate: 95, location: 'Remote', languages: ['English', 'Mandarin'],
      bio: 'Expert UI developer specializing in high-performance SaaS applications and complex state management. Built enterprise dashboards used by 500k+ users daily.',
      yearsExperience: 6, averageRating: 4.7, avatarUrl: 'D', available: true, completedProjects: 28, responseRate: 95
    },
    {
      id: '3', fullName: 'Elena Rodriguez', expertiseDomain: 'Cloud DevOps',
      skills: ['AWS', 'Kubernetes', 'CI/CD', 'Terraform', 'Docker'],
      hourlyRate: 110, location: 'New York, NY', languages: ['English', 'Portuguese'],
      bio: 'DevOps specialist helping startups automate deployments and secure cloud infrastructure. Certified AWS Solutions Architect with a passion for zero-downtime deployments.',
      yearsExperience: 10, averageRating: 5.0, avatarUrl: 'E', available: false, completedProjects: 52, responseRate: 100
    },
    {
      id: '4', fullName: 'Marcus Williams', expertiseDomain: 'Backend Development',
      skills: ['Node.js', 'PostgreSQL', 'GraphQL', 'Redis', 'Go'],
      hourlyRate: 105, location: 'London, UK', languages: ['English', 'French'],
      bio: 'Full-stack backend engineer with deep expertise in microservices architecture, event-driven systems, and high-throughput APIs.',
      yearsExperience: 7, averageRating: 4.8, avatarUrl: 'M', available: true, completedProjects: 41, responseRate: 97
    },
    {
      id: '5', fullName: 'Yuki Tanaka', expertiseDomain: 'UI/UX Design',
      skills: ['Figma', 'Design Systems', 'Prototyping', 'User Research', 'Motion Design'],
      hourlyRate: 90, location: 'Tokyo, Japan', languages: ['English', 'Japanese'],
      bio: 'Product designer crafting intuitive and delightful digital experiences. 5+ years of experience designing SaaS products for global audiences.',
      yearsExperience: 5, averageRating: 4.6, avatarUrl: 'Y', available: true, completedProjects: 19, responseRate: 92
    },
    {
      id: '6', fullName: 'Omar Hassan', expertiseDomain: 'AI Engineering',
      skills: ['Python', 'LLMs', 'Langchain', 'RAG', 'FastAPI'],
      hourlyRate: 130, location: 'Dubai, UAE', languages: ['English', 'Arabic'],
      bio: 'AI/ML specialist focused on building LLM-powered applications. Early contributor to open-source AI frameworks. Expert in retrieval-augmented generation.',
      yearsExperience: 4, averageRating: 4.5, avatarUrl: 'O', available: true, completedProjects: 15, responseRate: 88
    }
  ];

  private mockReviews: Record<string, SpecialistReview[]> = {
    '1': [
      { id: 'r1', author: 'John Smith', rating: 5, comment: 'Sarah delivered an incredible ML pipeline. Highly recommended!', date: '2 weeks ago' },
      { id: 'r2', author: 'Lisa Park', rating: 5, comment: 'Exceptional work on our NLP classification system. Very professional.', date: '1 month ago' },
      { id: 'r3', author: 'Mike Torres', rating: 4, comment: 'Great communication and solid technical skills.', date: '2 months ago' },
    ],
    '2': [
      { id: 'r4', author: 'Anna Lee', rating: 5, comment: 'David rebuilt our entire frontend. Blazing fast and beautiful.', date: '3 weeks ago' },
      { id: 'r5', author: 'Carlos Ruiz', rating: 4, comment: 'Very skilled Angular developer with great attention to detail.', date: '1 month ago' },
    ]
  };

  private specialistsSubject = new BehaviorSubject<Specialist[]>(this.mockSpecialists);
  public specialists$ = this.specialistsSubject.asObservable();

  getSpecialists(): Observable<Specialist[]> {
    return this.specialists$.pipe(delay(500));
  }

  getSpecialistById(id: string): Observable<Specialist | undefined> {
    return this.specialists$.pipe(
      map(specs => specs.find(s => s.id === id)),
      delay(300)
    );
  }

  getReviews(specialistId: string): Observable<SpecialistReview[]> {
    return of(this.mockReviews[specialistId] || []).pipe(delay(300));
  }

  createSpecialist(specialist: Omit<Specialist, 'id'>): Observable<Specialist> {
    const newSpec = { ...specialist, id: Date.now().toString() };
    const current = this.specialistsSubject.value;
    this.specialistsSubject.next([...current, newSpec]);
    return of(newSpec).pipe(delay(600));
  }

  updateSpecialist(id: string, updates: Partial<Specialist>): Observable<Specialist | undefined> {
    let updatedSpec: Specialist | undefined;
    const current = this.specialistsSubject.value.map(s => {
      if (s.id === id) {
        updatedSpec = { ...s, ...updates };
        return updatedSpec;
      }
      return s;
    });
    this.specialistsSubject.next(current);
    return of(updatedSpec).pipe(delay(400));
  }

  deleteSpecialist(id: string): Observable<boolean> {
    const current = this.specialistsSubject.value;
    this.specialistsSubject.next(current.filter(s => s.id !== id));
    return of(true).pipe(delay(400));
  }

  searchSpecialists(query: string): Observable<Specialist[]> {
    query = query.toLowerCase();
    return this.specialists$.pipe(
      map(specs => specs.filter(s =>
        s.fullName.toLowerCase().includes(query) ||
        s.expertiseDomain.toLowerCase().includes(query) ||
        s.skills.some(skill => skill.toLowerCase().includes(query))
      )),
      delay(300)
    );
  }
}
