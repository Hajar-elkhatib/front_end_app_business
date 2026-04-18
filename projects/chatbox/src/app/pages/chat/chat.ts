import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chat.html',
  styleUrls: ['./chat.css']
})
export class Chat {
  conversations = [
    { id: 1, name: 'Alex Rivera', lastMessage: 'The new UI looks great!', unread: 2, time: '10:42 AM', active: true, avatar: 'A' },
    { id: 2, name: 'Project: Nexus E-commerce', lastMessage: 'Are we launching today?', unread: 0, time: '09:15 AM', active: false, avatar: 'N' },
    { id: 3, name: 'Sophia Chen', lastMessage: 'I sent the API keys over.', unread: 0, time: 'Yesterday', active: false, avatar: 'S' }
  ];

  messages = [
    { id: 1, sender: 'Alex Rivera', isMe: false, text: 'Hey there! I just reviewed the latest mockups for the dashboard.', time: '10:30 AM', avatar: 'A' },
    { id: 2, sender: 'Me', isMe: true, text: 'Awesome! Did you like the new layout with the AI recommendations?', time: '10:35 AM' },
    { id: 3, sender: 'Alex Rivera', isMe: false, text: 'Yes, it flows much better. The new UI looks great!', time: '10:42 AM', avatar: 'A' }
  ];
}
