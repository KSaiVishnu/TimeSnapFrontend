import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TimesheetService {
  baseURL = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  getTimesheets(
    billingType: string,
    startDate: string,
    endDate: string,
    pageNumber: number,
    pageSize: number = 5
  ): Observable<any> {
    let params = new HttpParams()
      .set('billingType', billingType)
      .set('startDate', startDate)
      .set('endDate', endDate)
      .set('pageNumber', pageNumber)
      .set('pageSize', pageSize);

    return this.http.get(`${this.baseURL}/timesheet/filtered-timesheets`, {
      params,
    });
  }

  getUserTimesheets(pageNumber: number, pageSize: number, empId: string, startDate: string, endDate: string): Observable<any> {
    const params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString())
      .set('startDate', startDate)
      .set('endDate', endDate);
  
    return this.http.get(`${this.baseURL}/timesheet/my-timesheets/${empId}`, {
      params,
    });
  }

    getAllEmployees(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseURL}/user-employee`);
  }

  getTasksByEmpId(empId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseURL}/tasks/${empId}`);
  }

  addLogForUser(payload: any): Observable<any> {
    return this.http.post(`${this.baseURL}/timelogs`, payload);
  }
  
}
