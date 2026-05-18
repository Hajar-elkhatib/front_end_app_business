import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './main-layout.html',
  styleUrls: ['./main-layout.css']
})
export class MainLayout {
  searchQuery = '';
  showNotifications = false;
  showUserMenu = false;

  notifications = [
    { text: 'New specialist matched your project', time: '2 min ago', read: false },
    { text: 'Payment of $2,400 processed', time: '1 hr ago', read: false },
    { text: 'Project "Nexus E-commerce" deployed', time: '3 hrs ago', read: true },
  ];

  constructor(private router: Router) {}

  get unreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
    this.showUserMenu = false;
  }

  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
    this.showNotifications = false;
  }

  markAllRead() {
    this.notifications.forEach(n => n.read = true);
  }

  deployProject() {
    this.router.navigate(['/projects/create']);
  }

  onSearch() {
    if (this.searchQuery.trim()) {
      // For now navigate to specialists with a search hint
      this.router.navigate(['/specialists']);
    }
  }

  logout() {
    this.router.navigate(['/']);
  }

  closeDropdowns() {
    this.showNotifications = false;
    this.showUserMenu = false;
  }
}
