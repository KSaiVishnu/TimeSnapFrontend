import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../shared/services/auth.service';
import { UserService } from '../shared/services/user.service';
import { DummyComponent } from "../dummy/dummy.component";
import { ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import ScrollReveal from 'scrollreveal';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
// const ScrollReveal = require('scrollreveal');

// declare module 'scrollreveal' {
//   const ScrollReveal: any;
//   export default ScrollReveal;
// }



@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})

export class DashboardComponent implements OnInit, AfterViewInit  {
  constructor(
    private router: Router,
    private authService: AuthService,
    private userService: UserService
  ) {}

  fullName: string = '';
  email:string = '';

  ngOnInit(): void {
    this.userService.getUserProfile().subscribe({
      next: (res: any) => {
        this.fullName = res.fullName;
        this.email = res.email;
        this.userService.setUserDetails(res);
      },
      error: (err: any) =>
        console.log('error while retrieving user profile:\n', err),
    });
  }


  @ViewChild('navLinks') navLinks!: ElementRef;
  @ViewChild('menuBtnIcon') menuBtnIcon!: ElementRef;

  // scrollRevealOptions = {
  //   distance: '50px',
  //   origin: 'bottom',
  //   duration: 1000,
  // };

  ngAfterViewInit() {

    const scrollRevealOption = {
      distance: '50px',
      origin: 'bottom',
      duration: 1000,
    };
    

    ScrollReveal().reveal('.container__left h1', { ...scrollRevealOption });
    ScrollReveal().reveal('.container__left .container__btn', { ...scrollRevealOption, delay: 500 });
    ScrollReveal().reveal('.container__right h4', { ...scrollRevealOption, delay: 0 });
    ScrollReveal().reveal('.container__right h2', { ...scrollRevealOption, delay: 500 });
    ScrollReveal().reveal('.container__right h3', { ...scrollRevealOption, delay: 1000 });
    ScrollReveal().reveal('.container__right p', { ...scrollRevealOption, delay: 1500 });
    ScrollReveal().reveal('.container__right .tent-1', { duration: 1000, delay: 2000 });
    ScrollReveal().reveal('.container__right .tent-2', { duration: 1000, delay: 2500 });
    // ScrollReveal().reveal('.location', { ...scrollRevealOption, origin: 'left', delay: 5000 });
    // ScrollReveal().reveal('.socials span', { ...scrollRevealOption, origin: 'top', delay: 5500, interval: 500 });


    // ScrollReveal().reveal(".header__image img", { ...this.scrollRevealOptions, origin: "right" });
    // ScrollReveal().reveal(".header__content h1", { ...this.scrollRevealOptions, delay: 500 });
    // ScrollReveal().reveal(".header__content p", { ...this.scrollRevealOptions, delay: 1000 });
    // ScrollReveal().reveal(".header__content form", { ...this.scrollRevealOptions, delay: 1500 });
    // ScrollReveal().reveal(".header__content .bar", { ...this.scrollRevealOptions, delay: 2000 });
    // ScrollReveal().reveal(".header__image__card", { duration: 1000, interval: 500, delay: 2500 });
  }

  // toggleMenu() {
  //   const isOpen = this.navLinks.nativeElement.classList.toggle('open');
  //   this.menuBtnIcon.nativeElement.className = isOpen ? 'ri-close-line' : 'ri-menu-line';
  // }

  // closeMenu() {
  //   this.navLinks.nativeElement.classList.remove('open');
  //   this.menuBtnIcon.nativeElement.className = 'ri-menu-line';
  // }

    
  headerCards = [
    { icon: 'ri-key-line', text: 'Hotel Booking' },
    { icon: 'ri-passport-line', text: 'Flight Tickets' },
    { icon: 'ri-map-2-line', text: 'Local Events' },
    { icon: 'ri-guide-line', text: 'Tour Guide' }
  ];

  isMenuOpen = false;
  menuIcon = 'ri-menu-line';
  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    this.menuIcon = this.isMenuOpen ? 'ri-close-line' : 'ri-menu-line';
  }

  closeMenu() {
    this.isMenuOpen = false;
    this.menuIcon = 'ri-menu-line';
  }
  
}
