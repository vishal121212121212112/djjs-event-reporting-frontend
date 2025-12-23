import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { User } from 'src/app/shared/models/common.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiUrl = `${environment.apiBaseUrl}/api/users`; 

  constructor(private http: HttpClient) { }

  // Create a new user
  createUser(user: { name: string; email: string; contact_number: string; role_id: number }): Observable<any> {
    return this.http.post(this.apiUrl, user).pipe(
      catchError(this.handleError)
    );
  }

  // Read all users
  getUsers(filter: string = ''): Observable<User[]> {
    let url = this.apiUrl;
    if (filter) {
      url = `${this.apiUrl}?search=${filter}`;  // Assuming the API supports filtering
    }
    return this.http.get<User[]>(url).pipe(
      catchError(this.handleError)
    );
  }

  // Get a specific user by ID
  getUserById(userId: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${userId}`).pipe(
      catchError(this.handleError)
    );
  }

  // Update a user
  updateUser(userId: string, updatedUser: User): Observable<any> {
    return this.http.put(`${this.apiUrl}/${userId}`, updatedUser).pipe(
      catchError(this.handleError)
    );
  }

  // Delete a user
  deleteUser(userId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${userId}`).pipe(
      catchError(this.handleError)
    );
  }

  // Handle HTTP errors
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error - extract error message from response
      if (error.error && error.error.error) {
        errorMessage = error.error.error;
      } else if (error.error && typeof error.error === 'string') {
        errorMessage = error.error;
      } else if (error.message) {
        errorMessage = error.message;
      } else {
        errorMessage = `Error Code: ${error.status || 'Unknown'}`;
      }
    }
    // Return the error object so component can access error.error
    return throwError(() => error);
  }
}
