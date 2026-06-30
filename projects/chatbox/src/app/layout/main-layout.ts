import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { HumChat } from '../services/hum-chat';

interface SearchSuggestion {
  label: string;
  description: string;
  route: string;
  query?: string;
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './main-layout.html',
  styleUrls: ['./main-layout.css']
})
export class MainLayout implements OnInit, OnDestroy {
  isDarkMode = false;
  conversationUnreadCount = 0;
  private conversationSubscription?: Subscription;

  ngOnInit() {
    const savedTheme = localStorage.getItem('theme');
    this.isDarkMode = savedTheme === 'dark' || document.documentElement.getAttribute('data-theme') === 'dark';

    if (this.isDarkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }

    this.initializeConversationBadge();
  }

  ngOnDestroy() {
    this.conversationSubscription?.unsubscribe();
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    if (this.isDarkMode) document.documentElement.setAttribute('data-theme', 'dark');
    else document.documentElement.removeAttribute('data-theme');
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
  }

  searchQuery = '';
  showSearchSuggestions = false;
  showNotifications = false;
  showUserMenu = false;
  private searchTimer: ReturnType<typeof setTimeout> | null = null;

  notifications: { text: string; time: string; read: boolean }[] = [];

  constructor(
    private router: Router,
    private authService: AuthService,
    private humChat: HumChat
  ) {}

  get currentUser() {
    return this.authService.currentUser;
  }

  get dashboardRoute(): string {
    return this.authService.getDashboardRoute();
  }

  get profileRoute(): string {
    if (this.authService.userRole === 'specialist') {
      return '/profile/specialist';
    }
    if (this.authService.userRole === 'admin') {
      return '/admin/dashboard';
    }
    return '/profile/entrepreneur';
  }

  get specialistRecommendationsRoute(): string {
    return '/dashboard/entrepreneur/specialist-recommendations';
  }

  get specialistsRoute(): string {
    return '/dashboard/entrepreneur/specialists';
  }

  get conversationsRoute(): string {
    if (this.isSpecialist) {
      return '/dashboard/specialist/conversations';
    }
    return '/dashboard/entrepreneur/conversations';
  }

  get isAdmin(): boolean {
    return this.authService.userRole === 'admin';
  }

  get isEntrepreneur(): boolean {
    return this.authService.userRole === 'entrepreneur';
  }

  get isSpecialist(): boolean {
    return this.authService.userRole === 'specialist';
  }

  get avatarInitial(): string {
    return (this.currentUser?.fullName || 'N').charAt(0).toUpperCase();
  }

  get notificationUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  get searchSuggestions(): SearchSuggestion[] {
    const query = this.searchQuery.trim();
    const lowerQuery = query.toLowerCase();
    const currentRoute = this.router.url.split('?')[0] || this.dashboardRoute;
    const suggestions: SearchSuggestion[] = [];

    if (query) {
      suggestions.push({
        label: `Search current page for "${query}"`,
        description: 'Filter the page you are viewing',
        route: currentRoute,
        query
      });
    }

    const roleLinks = this.getSearchableLinks();
    const matchingLinks = roleLinks.filter(link => {
      if (!query) return true;
      return `${link.label} ${link.description}`.toLowerCase().includes(lowerQuery);
    });

    suggestions.push(...matchingLinks.slice(0, query ? 5 : 7));

    if (query && this.isEntrepreneur) {
      suggestions.push(
        { label: `Search projects for "${query}"`, description: 'Open project search results', route: '/projects', query },
        { label: `Search specialists for "${query}"`, description: 'Open specialist search results', route: '/specialists', query },
        { label: `Search complaints for "${query}"`, description: 'Open complaint search results', route: '/complaints', query }
      );
    }

    if (query && this.isAdmin) {
      suggestions.push(
        { label: `Search users for "${query}"`, description: 'Open admin users search', route: '/admin/users', query },
        { label: `Search projects for "${query}"`, description: 'Open admin project monitoring search', route: '/admin/projects', query },
        { label: `Search complaints for "${query}"`, description: 'Open admin complaints search', route: '/admin/complaints', query }
      );
    }

    const unique = new Map<string, SearchSuggestion>();
    suggestions.forEach(suggestion => unique.set(`${suggestion.route}:${suggestion.query || ''}:${suggestion.label}`, suggestion));
    return [...unique.values()].slice(0, 8);
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
    this.showUserMenu = false;
    this.showSearchSuggestions = false;
  }

  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
    this.showNotifications = false;
    this.showSearchSuggestions = false;
  }

  markAllRead() {
    this.notifications.forEach(n => n.read = true);
  }

  deployProject() {
    this.router.navigate([this.isAdmin ? '/admin' : '/projects/create']);
  }

  onSearch() {
    const query = this.searchQuery.trim();
    this.router.navigate([], {
      queryParams: { search: query || null },
      queryParamsHandling: 'merge'
    });
    this.showSearchSuggestions = !!query;
  }

  onSearchChange() {
    this.showSearchSuggestions = true;
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
    }
    this.searchTimer = setTimeout(() => this.onSearch(), 250);
  }

  clearSearch() {
    this.searchQuery = '';
    this.showSearchSuggestions = false;
    this.onSearch();
  }

  onSearchFocus() {
    this.showSearchSuggestions = true;
    this.showNotifications = false;
    this.showUserMenu = false;
  }

  selectSuggestion(suggestion: SearchSuggestion) {
    this.searchQuery = suggestion.query || '';
    this.showSearchSuggestions = false;
    this.router.navigate([suggestion.route], {
      queryParams: { search: suggestion.query || null }
    });
  }

  navigateTo(route: string, event?: Event) {
    event?.preventDefault();
    event?.stopPropagation();
    this.closeDropdowns();
    void this.router.navigateByUrl(route);
  }

  isRouteActive(route: string): boolean {
    const current = this.router.url.split('?')[0];
    return current === route || this.sameNavigationGroup(current, route);
  }

  @HostListener('document:keydown.control.k', ['$event'])
  focusSearch(event: Event) {
    event.preventDefault();
    const input = document.querySelector<HTMLInputElement>('.search-input');
    input?.focus();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  closeDropdowns() {
    this.showNotifications = false;
    this.showUserMenu = false;
    this.showSearchSuggestions = false;
  }

  private initializeConversationBadge(): void {
    const currentUser = this.authService.currentUser;
    if (!currentUser?.id || this.isAdmin) {
      this.conversationUnreadCount = 0;
      return;
    }

    this.conversationSubscription = this.humChat.conversations$.subscribe(conversations => {
      this.conversationUnreadCount = conversations.reduce((total, conversation) => total + Number(conversation.unreadCount || 0), 0);
    });

    if (this.isSpecialist) {
      const savedSpecialistId = localStorage.getItem('specialistId') || localStorage.getItem('specialist_id');
      if (savedSpecialistId) {
        this.loadConversationBadge(savedSpecialistId, currentUser.role);
        return;
      }

      this.authService.getSpecialistProfile(currentUser.id).subscribe({
        next: specialist => {
          const specialistId = String(specialist?.id || specialist?._id || specialist?.specialistId || specialist?.mongoId || currentUser.id);
          if (specialistId) {
            localStorage.setItem('specialistId', specialistId);
          }
          this.loadConversationBadge(specialistId, currentUser.role);
        },
        error: () => this.loadConversationBadge(currentUser.id, currentUser.role)
      });
      return;
    }

    this.loadConversationBadge(currentUser.id, currentUser.role);
  }

  private loadConversationBadge(userId: string, role: string): void {
    if (!userId) {
      this.conversationUnreadCount = 0;
      return;
    }

    this.humChat.setCurrentUser(userId, role);
    this.humChat.getConversations().subscribe({
      next: conversations => {
        this.conversationUnreadCount = conversations.reduce((total, conversation) => total + Number(conversation.unreadCount || 0), 0);
      },
      error: () => {
        this.conversationUnreadCount = 0;
      }
    });
  }

  private getSearchableLinks(): SearchSuggestion[] {
    if (this.isAdmin) {
      return [
        { label: 'Admin dashboard', description: 'Platform monitoring workspace', route: '/admin/dashboard' },
        { label: 'Users', description: 'Manage users', route: '/admin/users' },
        { label: 'Specialists', description: 'Manage specialists', route: '/admin/specialists' },
        { label: 'Support requests', description: 'Match projects with specialists', route: '/admin/support-requests' },
        { label: 'Project monitoring', description: 'Review all projects', route: '/admin/projects' },
        { label: 'Reports', description: 'Manage reports', route: '/admin/reports' },
        { label: 'AI models', description: 'Monitor ML models', route: '/admin/ai-models' }
      ];
    }

    if (this.isSpecialist) {
      return [
        { label: 'Specialist dashboard', description: 'Your specialist workspace', route: '/dashboard/specialist' },
        { label: 'Assigned projects', description: 'Recommended and assigned work', route: '/specialist/assigned-projects' },
        { label: 'Availability', description: 'Manage available time slots', route: '/specialist/availability' },
        { label: 'Conversations', description: 'Messages with entrepreneurs', route: '/dashboard/specialist/conversations' },
        { label: 'Evaluations', description: 'Reviews and scores', route: '/specialist/evaluations' },
        { label: 'Profile', description: 'Specialist profile', route: '/profile/specialist' }
      ];
    }

    return [
      { label: 'Entrepreneur dashboard', description: 'Your project workspace', route: '/dashboard/entrepreneur' },
      { label: 'Projects', description: 'Create and manage projects', route: '/projects' },
      { label: 'Business idea analysis', description: 'AI success prediction', route: '/analysis/business-idea' },
      { label: 'Market analysis', description: 'Market size and competition', route: '/analysis/market' },
      { label: 'Competitor analysis', description: 'Competitor research', route: '/analysis/competitors' },
      { label: 'Sentiment analysis', description: 'Opinion and review analysis', route: '/analysis/sentiment' },
      { label: 'Reports', description: 'Generated project reports', route: '/reports' },
      { label: 'AI assistant', description: 'Chatbot and RAG', route: '/chatbot' },
      { label: 'Specialists', description: 'Browse specialists', route: '/dashboard/entrepreneur/specialists' },
      { label: 'Specialist recommendations', description: 'Matched specialists', route: '/dashboard/entrepreneur/specialist-recommendations' },
      { label: 'Conversations', description: 'Messages with specialists', route: '/dashboard/entrepreneur/conversations' },
      { label: 'Complaints', description: 'Create and track complaints', route: '/complaints' },
      { label: 'Profile', description: 'Entrepreneur profile', route: '/profile/entrepreneur' }
    ];
  }

  private sameNavigationGroup(current: string, route: string): boolean {
    const aliases: Record<string, string[]> = {
      '/dashboard/entrepreneur/specialist-recommendations': ['/specialist-recommendations'],
      '/dashboard/entrepreneur/specialists': ['/specialists'],
      '/dashboard/entrepreneur/conversations': ['/conversations', '/entrepreneur/conversations'],
      '/dashboard/specialist/conversations': ['/conversations', '/specialist/conversations']
    };

    const routeAliases = aliases[route] || [];
    return routeAliases.some(alias => current === alias || current.startsWith(`${alias}/`))
      || (route === '/dashboard/entrepreneur/specialists' && current.startsWith('/dashboard/entrepreneur/specialists/'))
      || (route === '/dashboard/entrepreneur/conversations' && current.startsWith('/dashboard/entrepreneur/conversations/'))
      || (route === '/dashboard/specialist/conversations' && current.startsWith('/dashboard/specialist/conversations/'));
  }
}
