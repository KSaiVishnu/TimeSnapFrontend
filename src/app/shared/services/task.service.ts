import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  constructor(private http: HttpClient) {}

  baseURL = environment.apiBaseUrl;

  getTasks(
    empId: string,
    search: string = '',
    dateRange: string = '',
    type: string = ''
  ): Observable<any[]> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    if (dateRange) params = params.set('dateRange', dateRange);
    if (type) params = params.set('type', type);

    console.log(search, dateRange, type, empId);

    return this.http.get<any[]>(`${this.baseURL}/tasks/${empId}`);
  }
}
