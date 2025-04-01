import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface UpdateTask {
  status: number;
  completedDate?: string; // Required only if status = 2
}

export interface TaskCompletion {
  EmployeeId: string;
  UserName: string;
  TaskId: string;
  TaskName: string;
  StartDate: string;
  CompletedDate: string;
  TotalHours: number;
  data: {
    TotalTasksCompleted: number;
    TotalHoursSpent: number;
  };
}

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

  updateTaskStatus(taskId: string, empId: string, updateTask: UpdateTask): Observable<any> {
    let params = new HttpParams()
      .set('taskId', taskId)
      .set('empId', empId);

    return this.http.put(`${this.baseURL}/tasks/update-task/status`, updateTask, { params });
  }

  // getCompletedTasks(months: number): Observable<TaskCompletion[]> {
  //   return this.http.get<TaskCompletion[]>(`${this.baseURL}/report/completed-tasks?months=${months}`);
  // }

  getCompletedTasks(months: number): Observable<TaskCompletion[]> {
    const params = new HttpParams()
      .set('months', months.toString())

    return this.http.get<TaskCompletion[]>(`${this.baseURL}/reports/completed-tasks`, { params });
  }
}
