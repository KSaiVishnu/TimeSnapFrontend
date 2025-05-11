import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Injectable, Signal, signal } from '@angular/core';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';
import { UserEmployee } from '../../authorizeDemo/admin/employees/employees.component';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private http: HttpClient, private authService: AuthService) {}

  // userDetails:any;
  private userDetails = signal(null);
  baseURL = environment.apiBaseUrl;

  getUserProfile() {
    return this.http.get(environment.apiBaseUrl + '/UserProfile');
  }

  setUserDetails(user: any) {
    this.userDetails.set(user);
  }

  getUserDetails(): Signal<any> {
    return this.userDetails;
  }

  clearUserDetails() {
    this.userDetails.set(null); // Reset on logout
  }

  getUserEmployees(): Observable<UserEmployee[]> {
    return this.http.get<UserEmployee[]>(
      `${this.baseURL}/user-employee/all-employees`
    );
  }

  updateFullName(fullName: string): Observable<any> {
    return this.http.put(this.baseURL + '/UpdateFullName', { fullName }).pipe(
      catchError((error: HttpErrorResponse) => {
        console.log(error);
        const errorMsg = error.error || 'Failed to update name';
        return throwError(() => new Error(errorMsg));
      })
    );
  }

  // uploadAvatar(file: File): Observable<string> {
  //   const formData = new FormData();
  //   formData.append('file', file);

  //   return this.http.post( this.baseURL + '/upload-avatar', formData, {
  //     responseType: 'text'
  //   });
  // }

  uploadAvatar(base64Image: string) {
    return this.http.post<string>(this.baseURL + '/upload-avatar', {
      base64Image,
    });
  }

  validateCurrentPassword(currentPassword: string) {
    return this.http.post<boolean>(this.baseURL + '/validate-password', {
      currentPassword,
    });
  }

  changePassword(currentPassword: string, newPassword: string) {
    return this.http.post(this.baseURL + '/change-password', {
      currentPassword,
      newPassword,
    });
  }


    // Reset employee password (Admin only)
    resetEmployeePassword(employeeEmail: string, newPassword: string): Observable<any> {
      const body = { employeeEmail, newPassword };
      return this.http.post(`${this.baseURL}/reset-employee-password`, body);
    }

  deleteAccount() {  
    return this.http.delete(this.baseURL + '/delete-account');
  }
  

  deleteUserByEmployeeId(employeeId: string) {
    return this.http.delete(`${this.baseURL}/DeleteUser/${employeeId}`);
  }


}
