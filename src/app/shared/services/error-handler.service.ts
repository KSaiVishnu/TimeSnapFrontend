import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {

  constructor() { }

  
  getErrorMessage(error: HttpErrorResponse): { status: number | null, message: string } {
    let errorMessage = 'An error occurred while fetching data.';
    let errorStatus = error.status;

    if (!navigator.onLine) {
      errorMessage = 'No internet connection. Please check your network.';
    } else {
      switch (error.status) {
        case 400:
          errorMessage = 'Invalid request. Please check your input.';
          break;
        case 401:
          errorMessage = 'Unauthorized access. Please log in.';
          break;
        case 403:
          errorMessage = 'You do not have permission to access this data.';
          break;
        case 404:
          errorMessage = 'Requested Data not found.';
          break;
        case 500:
        case 501:
        case 502:
        case 503:
          errorMessage = 'Server error. Please try again later.';
          break;
      }
    }

    return { status: errorStatus, message: errorMessage };

  }
}
