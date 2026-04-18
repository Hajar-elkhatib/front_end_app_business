import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-marketplace',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './marketplace.html',
  styleUrls: ['./marketplace.css']
})
export class Marketplace {
  specialists = [
    { id: 1, name: 'Alex Rivera', expertise: 'Frontend Architect', rating: 4.9, reviews: 124, available: true, avatar: 'A' },
    { id: 2, name: 'Sophia Chen', expertise: 'AI Integration', rating: 5.0, reviews: 89, available: false, avatar: 'S' },
    { id: 3, name: 'Marcus Doe', expertise: 'UI/UX Designer', rating: 4.8, reviews: 204, available: true, avatar: 'M' },
    { id: 4, name: 'Elena Rostova', expertise: 'Backend Developer', rating: 4.7, reviews: 56, available: true, avatar: 'E' },
    { id: 5, name: 'Jayden Smith', expertise: 'DevOps Engineer', rating: 4.9, reviews: 112, available: false, avatar: 'J' },
    { id: 6, name: 'Olivia Jones', expertise: 'Product Manager', rating: 4.8, reviews: 93, available: true, avatar: 'O' }
  ];

  selectedSpecialist: any = null;

  openProfile(specialist: any) {
    this.selectedSpecialist = specialist;
  }

  closeProfile() {
    this.selectedSpecialist = null;
  }
}
