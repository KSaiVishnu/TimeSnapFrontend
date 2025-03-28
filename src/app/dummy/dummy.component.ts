import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-dummy',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './dummy.component.html',
  styleUrls: ['./dummy.component.scss']
})
export class DummyComponent {
  title = 'explore-world';
  showProfileMenu = false;
  
  user = {
    name: 'John Doe',
    email: 'john.doe@example.com'
  };

  toggleProfileMenu() {
    this.showProfileMenu = !this.showProfileMenu;
  }
  
  signOut() {
    // Implement sign out logic here
    console.log('User signed out');
    this.showProfileMenu = false;
  }
}