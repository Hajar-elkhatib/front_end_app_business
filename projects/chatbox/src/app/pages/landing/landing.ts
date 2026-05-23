import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './landing.html',
  styleUrls: ['./landing.css']
})
export class LandingPage {
  isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    if (this.isDarkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
  }

  features = [
    {
      icon: '🎯',
      title: 'Prédiction Succès Startup',
      description: 'Analyse IA de la probabilité de succès de votre projet entrepreneurial'
    },
    {
      icon: '📊',
      title: 'Analyse Marché',
      description: 'Étudiez votre marché, la concurrence et les tendances globales'
    },
    {
      icon: '💬',
      title: 'Analyse des Opinions',
      description: 'Collectez et analysez les feedbacks du marché avec l\'IA'
    },
    {
      icon: '🤖',
      title: 'Chatbot IA',
      description: 'Discutez avec notre assistant IA spécialisé en entrepreneuriat'
    },
    {
      icon: '👥',
      title: 'Recommandation Spécialistes',
      description: 'Trouvez les meilleurs spécialistes adaptés à votre projet'
    },
    {
      icon: '📄',
      title: 'Rapports PDF',
      description: 'Générez des rapports professionnels et téléchargez-les'
    }
  ];

  steps = [
    {
      number: 1,
      title: 'Créez votre projet',
      description: 'Remplissez les informations de base de votre idée entrepreneuriale'
    },
    {
      number: 2,
      title: 'Lancez l\'analyse IA',
      description: 'Nos modèles d\'IA analysent votre projet en profondeur'
    },
    {
      number: 3,
      title: 'Recevez recommandations',
      description: 'Obtenez des insights, recommandations et rapports détaillés'
    }
  ];

  testimonials = [
    {
      name: 'Alice Martin',
      role: 'Fondatrice - TechStart',
      text: 'Cette plateforme m\'a aidée à valider mon idée avant d\'investir. Les analyses IA sont précises et actionables.',
      rating: 5
    },
    {
      name: 'Jean Dupont',
      role: 'Entrepreneur - InnovateLabs',
      text: 'L\'accès aux spécialistes recommandés a fait toute la différence. Vraiment recommandé!',
      rating: 5
    },
    {
      name: 'Sophie Bernard',
      role: 'CEO - GrowthHub',
      text: 'Les rapports générés sont professionnels et complets. Parfait pour les présentations investisseurs.',
      rating: 5
    }
  ];

  pricing = [
    {
      name: 'Starter',
      price: '29',
      description: 'Pour commencer',
      features: [
        '5 projets par mois',
        'Analyses de base',
        'Chatbot IA limité',
        'Support email'
      ],
      cta: 'Commencer'
    },
    {
      name: 'Professionnel',
      price: '99',
      description: 'Le plus populaire',
      features: [
        'Projets illimités',
        'Toutes les analyses',
        'Chatbot IA illimité',
        'Recommandations spécialistes',
        'Rapports premium',
        'Support prioritaire'
      ],
      cta: 'Choisir ce plan',
      highlighted: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      description: 'Pour les organisations',
      features: [
        'Tout de Professionnel',
        'API access',
        'Intégrations custom',
        'Compte manager dédié',
        'Support 24/7'
      ],
      cta: 'Contacter'
    }
  ];
}
