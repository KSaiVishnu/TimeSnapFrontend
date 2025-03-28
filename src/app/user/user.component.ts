import { Component } from '@angular/core';
import { RegistrationComponent } from './registration/registration.component';
import { ChildrenOutletContexts, RouterOutlet } from '@angular/router';
import { trigger, style, animate, transition, query } from "@angular/animations";

import { LogoComponent } from '../logo/logo.component';
import { LoadingComponent } from '../loading/loading.component';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-user',
  standalone: true,
  imports: [RouterOutlet, LoadingComponent, LogoComponent, CommonModule],
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss',
  animations: [
    trigger('routerFadeIn', [
      transition('* <=> *', [
        query(':enter', [
          style({ opacity: 0 }),
          animate('1s ease-in-out', style({ opacity: 1 }))
        ], { optional: true }),
      ])
    ])
  ]
})
export class UserComponent {
  loading: boolean = false;

  constructor(private context: ChildrenOutletContexts) { }

  getRouteUrl() {
    return this.context.getContext('primary')?.route?.url;
  }

    // Method to show/hide loading animation
    showLoading(show: boolean): void {
      this.loading = show
    }

}
