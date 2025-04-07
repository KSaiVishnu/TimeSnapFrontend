import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TOKEN_KEY } from '../constants';
import { environment } from '../../../environments/environment';
import { CookieService } from 'ngx-cookie-service';
import { Observable } from 'rxjs/internal/Observable';

// interface FormObject  {
//   email: string,
//   fullName:string,
//   password: string,
//   role:string,
//   confirmPassword:string
// }

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient, private cookieService: CookieService) {}

  baseURL = environment.apiBaseUrl;
  form: any = {
    fullName: '',
    password: '',
    email: '',
    confirmPassword: '',
    role: '',
  };

  private resetEmail: string = '';

  setResetEmail(email: string) {
    this.resetEmail = email;
  }

  getResetEmail(): string {
    return this.resetEmail;
  }

  clearResetEmail() {
    this.resetEmail = '';
  }

  setForm(formData: any) {
    // email: string, fullName:string,password:string,role:string,confirmPassword:string
    this.form = formData;
    console.log(this.form);
  }

  getForm() {
    return this.form;
  }

  getEmail(): string {
    return this.form.email;
  }

  sendOtp(email: string): Observable<any> {
    console.log(email);
    return this.http.post(
      `${this.baseURL}/send-otp`,
      { email: email },
      { withCredentials: true }
    );
  }

  verifyOtp(email: string, otp: string) {
    let verificationDetails = {
      email: email,
      otp: otp,
    };
    return this.http.post(`${this.baseURL}/verify-otp`, verificationDetails);
  }

  createUser(formData: any) {
    formData = { ...formData, role: 'Employee' };
    console.log(formData);
    return this.http.post(this.baseURL + '/signup', formData);
  }

  preRegister(email: string): Observable<any> {
    return this.http.post(
      this.baseURL + '/pre-register',
      { email },
      { withCredentials: true }
    );
  }

  verifyAndCreateUser(formData: any) {
    return this.http.post(this.baseURL + '/verify-and-create', formData, {
      withCredentials: true,
    });
  }

  // auth.service.ts
  sendResetOtp(email: string) {
    return this.http.post(
      this.baseURL + '/send-reset-otp',
      { email },
      { withCredentials: true }
    );
  }

  verifyResetOtp(email: string, otp: string) {
    const data = { email: email, otp: otp };
    console.log(data);
    return this.http.post(this.baseURL + '/verify-reset-otp', data, {
      withCredentials: true,
    });
  }

  setNewPassword(email: string, newPassword: string) {
    return this.http.post(
      this.baseURL + '/set-new-password',
      { email, newPassword },
      { withCredentials: true }
    );
  }

  signin(formData: any) {
    return this.http.post(this.baseURL + '/signin', formData, {
      withCredentials: true,
    });
  }

  // googleSignin(formData:any){
  //   formData = {...formData, role:'Employee'}
  //   console.log(formData);
  //   return this.http.post(this.baseURL + '/google-signin', formData);
  // }

  googleVerification() {
    return this.http.get(this.baseURL + '/google-signin');
  }
  isLoggedIn() {
    return this.getToken() != null ? true : false;
  }

  saveToken(token: string) {
    this.cookieService.set(TOKEN_KEY, token);
  }

  // googleLogin(key: boolean) {
  //   const value = key ? 'Yes' : 'No';
  //   localStorage.setItem('google_login', value);
  // }

  googleLogin(data: { token: string }): Observable<any> {
    return this.http.post(`${this.baseURL}/google-login`, data);
  }

  getToken() {
    // console.log(this.cookieService.get(TOKEN_KEY));
    return this.cookieService.get(TOKEN_KEY);
  }

  // deleteToken() {
  //   console.log("Check 2");
  //   this.cookieService.delete(TOKEN_KEY);
  // }

  deleteToken(): Promise<void> {
    return new Promise((resolve) => {
      console.log('Check 2');
      this.cookieService.delete(TOKEN_KEY);
      resolve(); // Ensures the function behaves like an async function
    });
  }

  findUserByEmail(email: string) {
    console.log(email);
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(
      this.baseURL + '/find-user',
      { email },
      { headers, responseType: 'text' }
    );
  }

  removeUser(email: string) {
    console.log(email);
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(
      this.baseURL + '/remove-user',
      { email },
      { headers, responseType: 'text' }
    );
  }

  getClaims() {
    return JSON.parse(window.atob(this.getToken()!.split('.')[1]));
  }
}
