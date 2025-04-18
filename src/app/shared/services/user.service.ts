import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, Signal, signal } from '@angular/core';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';
import { UserEmployee } from '../../authorizeDemo/admin/employees/employees.component';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class UserService {

  constructor(private http: HttpClient,
    private authService: AuthService) { }

  // userDetails:any;
  private userDetails = signal(null);
  baseURL = environment.apiBaseUrl;


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

  getUserEmployees(): Observable<UserEmployee[]> {
    return this.http.get<UserEmployee[]>(`${this.baseURL}/user-employee/all-employees`);
  }

}
