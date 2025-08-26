import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { User } from 'src/app/shared/models/common.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiUrl = 'http://localhost:3000/api/users'; 

  constructor(private http: HttpClient) { }

  // Create a new user
  createUser(user: User): Observable<any> {
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
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(errorMessage);
  }
}
