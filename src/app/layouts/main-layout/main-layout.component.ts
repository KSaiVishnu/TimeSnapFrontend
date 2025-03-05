import { Component } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { HideIfClaimsNotMetDirective } from '../../shared/directives/hide-if-claims-not-met.directive';
import { claimReq } from '../../shared/utils/claimReq-utils';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, RouterLink, HideIfClaimsNotMetDirective],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css',
})
export class MainLayoutComponent {
  constructor(private router: Router, private authService: AuthService) {}

  claimReq = claimReq;

  onLogout() {
    console.log("delete");
    this.authService.deleteToken();
    this.router.navigateByUrl('/signin');
  }

  email: string = '';

  // onLogout() {
  //   // console.log(this.authService.getClaims());
  //   console.log(localStorage.getItem('google_login'));
  //   if (localStorage.getItem('google_login') == "Yes") {
  //     this.authService.removeUser(this.email).subscribe({
  //       next: (res: any) => {
  //         console.log(res);
  //         this.authService.deleteToken();
  //         this.router.navigateByUrl('/signin');
  //       },
  //       error: (err: any) => console.log('error while deleting user :\n', err),
  //     });
  //   } else {
  //     this.authService.deleteToken();
  //     this.router.navigateByUrl('/signin');
  //   }
  // }
}
