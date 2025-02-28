import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, Signal, signal } from '@angular/core';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})

export class UserService {

  constructor(private http: HttpClient,
    private authService: AuthService) { }

  // userDetails:any;
  private userDetails = signal(null);


  getUserProfile() {
    return this.http.get(environment.apiBaseUrl + '/UserProfile')
  }

  setUserDetails(user: any){
    this.userDetails.set(user);
  }

  getUserDetails(): Signal<any>{
    return this.userDetails;
  }

  clearUserDetails() {
    this.userDetails.set(null); // Reset on logout
  }

}
