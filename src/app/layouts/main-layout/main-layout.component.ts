import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { HideIfClaimsNotMetDirective } from '../../shared/directives/hide-if-claims-not-met.directive';
import { claimReq } from '../../shared/utils/claimReq-utils';
import { DummyComponent } from "../../dummy/dummy.component";
import { CommonModule } from '@angular/common';
import { UserService } from '../../shared/services/user.service';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, RouterLink, HideIfClaimsNotMetDirective, CommonModule],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css',
})
export class MainLayoutComponent implements OnInit {
  constructor(private router: Router, private authService: AuthService, private userService: UserService) {}

  claimReq = claimReq;

  user = {
    email: "",
    name: ""
  }

  title = 'explore-world';
  showProfileMenu = false;
  

  toggleProfileMenu() {
    this.showProfileMenu = !this.showProfileMenu;
  }

  async onLogout() {
    console.log("delete");
    await this.authService.deleteToken();
    this.router.navigateByUrl('/signin');
  }

  email: string = '';

  ngOnInit(): void {
    this.userService.getUserProfile().subscribe({
      next: (res: any) => {
        this.user.name = res.fullName;
        this.user.email = res.email;
        this.userService.setUserDetails(res);
      },
      error: (err: any) =>
        console.log('error while retrieving user profile:\n', err),
    });
  }

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
