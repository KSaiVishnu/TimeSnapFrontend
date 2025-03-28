import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
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

    return this.http.get(`${this.baseURL}/timesheet/filtered-timesheets`, { params });
  }

}
