import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  constructor(private router: Router, private titleService: Title) {}

  ngOnInit() {
    this.router.events.pipe(
      filter((event: any) => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      const url = event.urlAfterRedirects;

      if (url === '/' || url === '') {
        this.titleService.setTitle('ToolSikt');  // root => dashboard
        this.updateFavicon('main-logo.png');
      }
      // } else if (url.startsWith('/signin')) {
      //   this.titleService.setTitle('Timesheet'); // time tracker page
      // } 
      else {
        this.titleService.setTitle('TimeSikt'); // fallback
        this.updateFavicon('logo.png');
      }
    });
  }

    updateFavicon(faviconPath: string) {
    const favicon = document.getElementById('appFavicon') as HTMLLinkElement;
    if (favicon) {
      favicon.href = faviconPath;
    }
  }
}
