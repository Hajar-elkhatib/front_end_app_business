const fs = require('fs');
const path = require('path');

const writeComponent = (relPath, tsCode, htmlCode) => {
    const compDir = path.join(__dirname, 'projects/chatbox/src/app', relPath);
    const name = path.basename(relPath);
    const tsPath = path.join(compDir, \`\${name}.ts\`);
  
  if (!htmlCode) {
    fs.writeFileSync(tsPath, tsCode);
  } else {
    fs.writeFileSync(tsPath, tsCode);
    const htmlPath = path.join(compDir, \`\${name}.html\`);
    fs.writeFileSync(htmlPath, htmlCode);
  }
  console.log('Updated ' + name);
};

// 7. Market Research Page
const marketResearchTs = `import { Component } from '@angular/core';
    import { CommonModule } from '@angular/common';

    @Component({
        selector: 'app-market-research',
        standalone: true,
        imports: [CommonModule],
        template: \`
    <div class="container py-8">
      <h1 class="text-3xl font-bold mb-2">Market Research Analysis</h1>
      <p class="text-secondary mb-6">Basé sur les données macroéconomiques et les tendances du secteur.</p>
      
      <div class="grid grid-cols-4 gap-4 mb-6">
        <div class="card p-4">
          <div class="text-xs text-muted mb-1 uppercase font-semibold">Taille (Mds)</div>
          <div class="text-2xl font-bold">1.5</div>
        </div>
        <div class="card p-4">
          <div class="text-xs text-muted mb-1 uppercase font-semibold">Croissance</div>
          <div class="text-2xl font-bold text-success">+12%</div>
        </div>
        <div class="card p-4">
          <div class="text-xs text-muted mb-1 uppercase font-semibold">Concurrence</div>
          <div class="text-2xl font-bold text-warning">Medium</div>
        </div>
        <div class="card p-4">
          <div class="text-xs text-muted mb-1 uppercase font-semibold">Fit Géographique</div>
          <div class="text-2xl font-bold text-indigo">88/100</div>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-6 mt-8">
        <div class="card">
          <h3 class="font-semibold text-lg mb-4">Indicateurs Macro (World Bank)</h3>
          <table class="w-full text-sm text-left">
            <tr class="border-b"><th class="py-2 text-muted font-medium w-3/4">GDP (US$)</th><td class="font-bold">2.9T</td></tr>
            <tr class="border-b"><th class="py-2 text-muted font-medium w-3/4">GDP Growth</th><td class="font-bold text-success">2.1%</td></tr>
            <tr class="border-b"><th class="py-2 text-muted font-medium w-3/4">Population</th><td class="font-bold">67M</td></tr>
            <tr class="border-b"><th class="py-2 text-muted font-medium w-3/4">Internet Users (%)</th><td class="font-bold">85%</td></tr>
            <tr class="border-b"><th class="py-2 text-muted font-medium w-3/4">Services Value Added</th><td class="font-bold">70%</td></tr>
          </table>
          <div class="text-xs text-muted mt-4">Source: Banque Mondiale & Estimations croisées</div>
        </div>

        <div class="card">
          <h3 class="font-semibold text-lg mb-4">Tendances de recherche</h3>
          <div class="h-48 border border-gray-200 rounded flex items-end relative overflow-hidden bg-gray-50">
            <!-- Mock chart bars -->
            <div class="bg-indigo-200 w-1/6 h-1/4 absolute bottom-0 left-0"></div>
            <div class="bg-indigo-300 w-1/6 h-1/3 absolute bottom-0" style="left: 16%"></div>
            <div class="bg-indigo-400 w-1/6 h-1/2 absolute bottom-0" style="left: 32%"></div>
            <div class="bg-indigo-500 w-1/6 h-2/3 absolute bottom-0" style="left: 48%"></div>
            <div class="bg-indigo-600 w-1/6 h-5/6 absolute bottom-0" style="left: 64%"></div>
            <div class="bg-indigo-700 w-1/6 h-full absolute bottom-0" style="left: 80%"></div>
          </div>
          <div class="text-xs text-muted mt-4">Score tendance actuel: 85/100 (Google Trends simulé)</div>
        </div>
      </div>
    </div>
  \`
})
export class MarketResearch {}
`;

    // 8. Market Feedback
    const marketFeedbackTs = `import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-market-feedback',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: \`
    <div class="container py-8">
      <div class="flex justify-between items-end mb-6">
        <div>
          <h1 class="text-3xl font-bold mb-2">Opinions & Feedback</h1>
          <p class="text-secondary">Analysez les sentiments des retours du marché.</p>
        </div>
        <button class="btn btn-secondary">Copier Lien Formulaire Public</button>
      </div>

      <div class="grid grid-cols-3 gap-6 mb-8">
        <div class="card col-span-2">
          <h3 class="font-semibold text-lg mb-4">Ajouter des feedbacks</h3>
          <textarea rows="4" class="input mb-4" placeholder="Coller un feedback par ligne..."></textarea>
          <div class="flex justify-between items-center">
            <span class="text-sm text-muted">Ou importer un CSV type (feedback, source)</span>
            <button class="btn btn-indigo">Analyser les sentiments</button>
          </div>
        </div>

        <div class="card bg-gray-50 flex flex-col justify-center items-center">
          <div class="text-sm text-muted font-bold uppercase mb-2">Overall Sentiment</div>
          <div class="text-4xl font-bold mb-2 text-success">POS (80%)</div>
          <div class="flex gap-4 text-sm mt-2">
             <span class="text-success font-medium">12 Positifs</span>
             <span class="text-danger font-medium">3 Négatifs</span>
          </div>
        </div>
      </div>

      <div class="card">
        <h3 class="font-semibold text-lg mb-4">Liste des Feedbacks Analysés</h3>
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b text-sm text-muted">
              <th class="pb-2 font-semibold">Feedback Text</th>
              <th class="pb-2 font-semibold w-24">Sentiment</th>
              <th class="pb-2 font-semibold w-20 text-right">Score</th>
            </tr>
          </thead>
          <tbody class="text-sm">
            <tr class="border-b">
              <td class="py-3 pr-4">"C'est exactement la solution que je cherche depuis des mois pour mon agence!"</td>
              <td class="py-3"><span class="badge badge-success bg-success-bg text-success border-success">Positive</span></td>
              <td class="py-3 text-right font-bold">0.96</td>
            </tr>
            <tr class="border-b">
              <td class="py-3 pr-4">"Je trouve ça un peu cher par rapport aux concurrents actuels."</td>
              <td class="py-3"><span class="badge badge-danger bg-danger-bg text-danger border-danger">Negative</span></td>
              <td class="py-3 text-right font-bold">0.24</td>
            </tr>
            <tr>
              <td class="py-3 pr-4">"L'interface est claire, à voir en pratique si c'est robuste."</td>
              <td class="py-3"><span class="badge badge-warning bg-warning-bg text-warning border-warning">Neutral</span></td>
              <td class="py-3 text-right font-bold">0.65</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  \`
})
export class MarketFeedback {}
`;

    // 9. Public Feedback
    const publicFeedbackTs = `import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-public-feedback',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: \`
    <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div class="card w-full max-w-lg shadow-xl border-t-4 border-t-indigo-600">
        <div *ngIf="!submitted">
          <div class="text-center mb-6">
            <h2 class="text-2xl font-bold">Donnez votre avis</h2>
            <p class="text-secondary text-sm mt-1">Projet: NexTGen AI Dashboard</p>
          </div>
          
          <div class="space-y-4">
            <div>
              <label class="block font-medium text-sm mb-1">Êtes-vous concerné par cette problématique ?</label>
              <div class="flex gap-4">
                <label class="flex items-center gap-1 text-sm"><input type="radio" name="concern" value="yes"> Oui</label>
                <label class="flex items-center gap-1 text-sm"><input type="radio" name="concern" value="no"> Non</label>
              </div>
            </div>
            
            <div>
              <label class="block font-medium text-sm mb-1">Niveau d'intérêt (1 à 5)</label>
              <div class="flex justify-between w-full max-w-xs px-2">
                <span *ngFor="let i of [1,2,3,4,5]" class="flex flex-col items-center gap-1">
                  <input type="radio" name="interest" [value]="i">
                  <span class="text-xs text-muted">{{i}}</span>
                </span>
              </div>
            </div>

            <div>
              <label class="block font-medium text-sm mb-1">Votre profil</label>
              <select class="input text-sm">
                <option>Client potentiel</option>
                <option>Étudiant</option>
                <option>Entrepreneur</option>
                <option>Expert du domaine</option>
                <option>Autre</option>
              </select>
            </div>

            <div>
              <label class="block font-medium text-sm mb-1">Que pensez-vous de l'idée en général ?</label>
              <textarea class="input" rows="4" placeholder="C'est intéressant mais..."></textarea>
            </div>
            
            <button class="btn btn-indigo w-full mt-4" (click)="submit()">Envoyer mon avis</button>
          </div>
        </div>
        
        <div *ngIf="submitted" class="text-center py-10">
          <div class="text-6xl mb-4">🎉</div>
          <h2 class="text-2xl font-bold mb-2">Merci pour votre retour !</h2>
          <p class="text-secondary text-sm">Votre opinion est précieuse pour l'amélioration continue de ce projet.</p>
        </div>
      </div>
    </div>
  \`
})
export class PublicFeedback {
  submitted = false;
  submit() { this.submitted = true; }
}
`;

    // 10. Specialist Recommendation Page
    const specialistRecommendationTs = `import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-specialist-recommendation',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <div class="container py-8">
      <div class="flex justify-between items-start mb-8">
        <div>
          <h1 class="text-3xl font-bold mb-2">Trouver des Spécialistes</h1>
          <p class="text-secondary">L'IA vous recommande les meilleurs profils pour vos besoins actuels.</p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <!-- AI Form -->
        <div class="card md:col-span-1 h-fit">
          <h3 class="font-semibold mb-4 text-indigo">Critères de recherche</h3>
          <div class="space-y-4 text-sm">
            <div>
              <label class="block font-medium text-xs text-muted mb-1 uppercase">Besoins</label>
              <select class="input"><option>Marketing</option><option>Finance</option><option>Legal</option><option>Tech</option></select>
            </div>
            <div>
              <label class="block font-medium text-xs text-muted mb-1 uppercase">Budget max / hr ($)</label>
              <input type="number" class="input" value="100">
            </div>
            <div>
              <label class="block font-medium text-xs text-muted mb-1 uppercase">Langue</label>
              <input type="text" class="input" value="French">
            </div>
            <button class="btn btn-primary w-full mt-2">Recommander</button>
          </div>
        </div>

        <!-- Results -->
        <div class="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="card flex flex-col justify-between" *ngFor="let s of [1,2,3,4]">
            <div>
              <div class="flex justify-between items-start mb-3">
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-lg shadow-sm">SP</div>
                  <div>
                    <h3 class="font-bold text-lg leading-tight">Sarah Parker</h3>
                    <span class="text-xs text-indigo font-medium">Growth Marketing Expert</span>
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-success font-bold text-sm bg-success-bg px-2 py-1 rounded">MATCH: 98%</div>
                </div>
              </div>
              <p class="text-sm text-secondary mb-3 w-full">Spécialiste en acquisition client B2B et SaaS. Plus de 8 ans d'expérience.</p>
              <div class="flex gap-2 text-xs text-muted mb-4 font-medium flex-wrap">
                <span class="bg-gray-100 px-2 py-1 rounded-full border border-gray-200">SEO</span>
                <span class="bg-gray-100 px-2 py-1 rounded-full border border-gray-200">AdWords</span>
                <span class="bg-gray-100 px-2 py-1 rounded-full border border-gray-200">Hubspot</span>
              </div>
            </div>
            <div class="flex items-center justify-between border-t pt-4 mt-auto">
              <div>
                <span class="font-bold text-lg">$65</span><span class="text-xs text-muted">/hr</span>
                <span class="ml-2 text-xs">⭐ 4.9 (42)</span>
              </div>
              <div class="flex gap-2">
                <button class="btn btn-secondary text-sm h-8" routerLink="/specialists/123">Profil</button>
                <button class="btn btn-indigo text-sm h-8" routerLink="/conversations/chat1">Contacter</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  \`
})
export class SpecialistRecommendation {}
`;

    // 12. Chat with Specialist Page
    const chatConversationTs = `import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chat-conversation',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <div class="flex h-[calc(100vh-72px)] bg-white overflow-hidden">
      <!-- Conversation List -->
      <div class="w-80 border-r flex flex-col bg-gray-50 hidden md:flex">
        <div class="p-4 border-b bg-white">
          <input type="text" class="input w-full" placeholder="Rechercher...">
        </div>
        <div class="flex-1 overflow-y-auto">
          <div class="p-4 border-b bg-indigo-50 border-l-4 border-l-indigo-600 cursor-pointer">
            <div class="flex justify-between items-center mb-1">
              <span class="font-bold text-sm">Sarah Parker</span>
              <span class="text-xs text-muted">10:42 AM</span>
            </div>
            <div class="text-xs text-secondary truncate">Merci pour le business plan, je le...</div>
          </div>
          <div class="p-4 border-b cursor-pointer hover:bg-gray-100">
            <div class="flex justify-between items-center mb-1">
              <span class="font-bold text-sm">Max CTO</span>
              <span class="text-xs text-muted">Hier</span>
            </div>
            <div class="text-xs text-secondary truncate">Parlons du backend Spring Boot.</div>
          </div>
        </div>
      </div>

      <!-- Chat Area -->
      <div class="flex-1 flex flex-col relative w-full">
        <!-- Chat header -->
        <div class="h-16 border-b flex items-center justify-between px-6 bg-white shrink-0">
          <div class="flex items-center gap-3">
             <div class="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center font-bold text-indigo-700">SP</div>
             <div>
               <h3 class="font-bold text-sm">Sarah Parker</h3>
               <p class="text-xs text-success">En ligne</p>
             </div>
          </div>
          <div><button class="btn btn-secondary btn-sm text-xs">Infos Projet</button></div>
        </div>

        <!-- Messages -->
        <div class="flex-1 overflow-y-auto p-6 bg-gray-50 flex flex-col gap-4">
          <div class="self-start max-w-[80%] bg-white p-3 rounded-tr-xl rounded-b-xl shadow-sm border border-gray-100">
            <p class="text-sm">Bonjour ! J'ai bien reçu la demande pour votre projet NexTGen. Le budget me semble correct. Pouvons-nous prévoir un call ?</p>
            <span class="text-[10px] text-muted block mt-1 text-right">10:35 AM</span>
          </div>
          <div class="self-end max-w-[80%] bg-indigo-600 text-white p-3 rounded-tl-xl rounded-b-xl shadow-sm">
            <p class="text-sm">Bonjour Sarah, super ! J'allais vous proposer exactement la même chose. Seriez-vous dispo demain à 14h ?</p>
            <span class="text-[10px] text-indigo-200 block mt-1 text-right">10:40 AM</span>
          </div>
          <div class="self-start max-w-[80%] bg-white p-3 rounded-tr-xl rounded-b-xl shadow-sm border border-gray-100">
            <p class="text-sm">Merci pour le business plan, je le regarde ce soir et on en discute demain à 14h sans faute.</p>
            <span class="text-[10px] text-muted block mt-1 text-right">10:42 AM</span>
          </div>
        </div>

        <!-- Chat Input -->
        <div class="p-4 bg-white border-t flex gap-2 shrink-0">
          <button class="btn btn-secondary px-3 py-2 text-xl opacity-70">+</button>
          <input type="text" class="input flex-1" placeholder="Tapez votre message...">
          <button class="btn btn-indigo px-6">Envoyer</button>
        </div>
      </div>
    </div>
  \`
})
export class ChatConversation {}
`;

    // 13. AI Chatbot Advisor Page
    const aiChatbotTs = `import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ai-chatbot',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <div class="flex flex-col h-[calc(100vh-72px)] max-w-4xl mx-auto bg-white shadow-xl rounded-lg my-4 overflow-hidden border">
      <!-- Toolbar -->
      <div class="border-b p-4 flex justify-between items-center bg-gray-50">
        <div class="flex items-center gap-2">
          <span class="text-2xl">🤖</span>
          <h2 class="font-bold text-lg">IntelliVal Advisor</h2>
        </div>
        <div class="flex gap-4 items-center">
          <select class="input form-control text-sm w-48">
            <option>Projet: NexTGen AI</option>
            <option>Projet: BioHealth App</option>
          </select>
          <label class="flex items-center gap-1 text-sm font-medium text-secondary">
            <input type="checkbox" checked> Fast Mode
          </label>
        </div>
      </div>

      <!-- Messages area -->
      <div class="flex-1 overflow-y-auto p-6 bg-white space-y-6">
        <div class="flex items-start gap-4 max-w-[85%]">
           <div class="w-10 h-10 rounded bg-indigo flex items-center justify-center text-white text-xl shadow-sm shrink-0">🤖</div>
           <div class="mt-1">
             <div class="text-sm font-bold text-secondary mb-1">IntelliVal AI</div>
             <div class="text-sm bg-gray-50 border p-4 rounded-xl rounded-tl-none leading-relaxed text-gray-800">
               Bonjour ! Je suis assistante spécialisée en entrepreneuriat. Je vois que vous travaillez sur "NexTGen AI".<br><br>
               Voulez-vous que je :<br>
               • Génère un business plan court<br>
               • Propose une stratégie marketing<br>
               • Analyse pourquoi votre Market Opinion Score est faible
             </div>
           </div>
        </div>

        <div class="flex items-start gap-4 max-w-[85%] ml-auto flex-row-reverse">
           <div class="w-10 h-10 rounded bg-gray-800 flex items-center justify-center text-white font-bold shadow-sm shrink-0">J</div>
           <div class="mt-1">
             <div class="text-sm font-bold text-secondary mb-1 text-right">Vous</div>
             <div class="text-sm bg-indigo-600 text-white p-4 rounded-xl rounded-tr-none px-6">
               Propose une stratégie marketing.
             </div>
           </div>
        </div>
        
        <div class="flex items-start gap-4 max-w-[85%]">
           <div class="w-10 h-10 rounded bg-indigo flex items-center justify-center text-white text-xl shadow-sm shrink-0">🤖</div>
           <div class="mt-1">
             <div class="text-sm font-bold text-secondary mb-1">IntelliVal AI</div>
             <div class="text-sm bg-gray-50 border p-4 rounded-xl rounded-tl-none leading-relaxed text-gray-800">
               **Stratégie Marketing - NexTGen AI**<br><br>
               Basé sur l'analyse de votre projet et les pratiques du marché SaaS B2B, voici un plan recommandé :<br>
               1. **Inbound Marketing (SEO)** : Ciblez les mots-clés de "aide décisionnelle IA". Le search trend montre un fort intérêt (Score 85).<br>
               2. **Partnerships** : Associez-vous avec des ESN.<br><br>
               <div class="text-xs text-muted mt-4 p-2 bg-white rounded border border-gray-200">
                 <em>Sources RAG : Rapport McK 2025 B2B, Case Study Hubspot SaaS.</em><br>
                 <em>Intention: Strategy Generation | Confidence: 92%</em>
               </div>
             </div>
           </div>
        </div>
      </div>

      <!-- Input Area -->
      <div class="p-4 bg-gray-50 border-t shrink-0">
        <div class="flex gap-2 flex-wrap mb-2 px-2">
          <button class="text-xs bg-white border px-3 py-1 rounded-full text-indigo-700 hover:bg-indigo-50 transition-colors">Quels spécialistes recommandes-tu ?</button>
          <button class="text-xs bg-white border px-3 py-1 rounded-full text-indigo-700 hover:bg-indigo-50 transition-colors">Génère un business plan court</button>
          <button class="text-xs bg-white border px-3 py-1 rounded-full text-indigo-700 hover:bg-indigo-50 transition-colors">Comment améliorer mon idée ?</button>
        </div>
        <div class="flex relative shadow-sm">
          <input type="text" class="input flex-1 pr-24 py-4 rounded-xl border-gray-300" placeholder="Demandez moi n'importe quoi sur votre projet...">
          <button class="absolute right-2 top-2 bottom-2 bg-indigo-600 text-white rounded-lg px-4 font-bold hover:bg-indigo-700 transition">↑</button>
        </div>
      </div>
    </div>
  \`
})
export class AiChatbot {}
`;


    writeComponent('pages/market/market-research', marketResearchTs, '');
    writeComponent('pages/market/market-feedback', marketFeedbackTs, '');
    writeComponent('pages/market/public-feedback', publicFeedbackTs, '');
    writeComponent('pages/specialists/specialist-recommendation', specialistRecommendationTs, '');
    writeComponent('pages/chat/chat-conversation', chatConversationTs, '');
    writeComponent('pages/chatbot/ai-chatbot', aiChatbotTs, '');
