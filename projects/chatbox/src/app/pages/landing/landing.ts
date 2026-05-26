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
      icon: 'AI',
      title: 'Startup Success Prediction',
      description: 'AI analysis of your entrepreneurial project success probability'
    },
    {
      icon: 'MK',
      title: 'Market Analysis',
      description: 'Study your market, competition, and global trends'
    },
    {
      icon: 'FB',
      title: 'Feedback Analysis',
      description: 'Collect and analyze market feedback with AI'
    },
    {
      icon: 'CH',
      title: 'AI Chatbot',
      description: 'Chat with our AI assistant specialized in entrepreneurship'
    },
    {
      icon: 'SP',
      title: 'Specialist Recommendation',
      description: 'Find the best specialists for your project'
    },
    {
      icon: 'RP',
      title: 'PDF Reports',
      description: 'Generate and download professional reports'
    }
  ];

  steps = [
    {
      number: 1,
      title: 'Create your project',
      description: 'Fill in the core information about your business idea'
    },
    {
      number: 2,
      title: 'Run AI analysis',
      description: 'Our AI models analyze your project in depth'
    },
    {
      number: 3,
      title: 'Receive recommendations',
      description: 'Get insights, recommendations, and detailed reports'
    }
  ];

  testimonials = [
    {
      name: 'Alice Martin',
      role: 'Founder - TechStart',
      text: 'This platform helped me validate my idea before investing. The AI analyses are precise and actionable.',
      rating: 5
    },
    {
      name: 'Jean Dupont',
      role: 'Entrepreneur - InnovateLabs',
      text: 'Access to recommended specialists made all the difference. Highly recommended!',
      rating: 5
    },
    {
      name: 'Sophie Bernard',
      role: 'CEO - GrowthHub',
      text: 'The generated reports are professional and complete. Perfect for investor presentations.',
      rating: 5
    }
  ];

  pricing = [
    {
      name: 'Starter',
      price: '29',
      description: 'To get started',
      features: [
        '5 projects per month',
        'Basic analyses',
        'Limited AI chatbot',
        'Email support'
      ],
      cta: 'Get Started'
    },
    {
      name: 'Professional',
      price: '99',
      description: 'Most popular',
      features: [
        'Unlimited projects',
        'All analyses',
        'Unlimited AI chatbot',
        'Specialist recommendations',
        'Premium reports',
        'Priority support'
      ],
      cta: 'Choose Plan',
      highlighted: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      description: 'For organizations',
      features: [
        'Everything in Professional',
        'API access',
        'Custom integrations',
        'Dedicated account manager',
        '24/7 support'
      ],
      cta: 'Contact Us'
    }
  ];
}
