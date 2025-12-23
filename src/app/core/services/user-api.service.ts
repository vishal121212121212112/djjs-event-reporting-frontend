import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface User {
  id?: number;
  name: string;
  email: string;
  contact_number?: string;
  role_id: number;
  role?: Role;
  password?: string;
  token?: string;
  expired_on?: string;
  last_login_on?: string;
  first_login_on?: string;
  is_deleted?: boolean;
  created_on?: string;
  updated_on?: string;
  created_by?: string;
  updated_by?: string;
}

export interface Role {
  id: number;
  name: string;
  description?: string;
  created_on?: string;
  updated_on?: string;
}

export interface CreateUserResponse {
  message: string;
  user: User;
  password: string;
}

export interface ResetPasswordResponse {
  message: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserApiService {
  private apiBaseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) { }

  /**
   * Get all users
   */
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiBaseUrl}/api/users`);
  }

  /**
   * Get user by ID
   */
  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiBaseUrl}/api/users/${id}`);
  }

  /**
   * Search users by email or contact number
   */
  searchUsers(email?: string, contactNumber?: string): Observable<User[]> {
    let params = new HttpParams();
    if (email) {
      params = params.set('email', email);
    }
    if (contactNumber) {
      params = params.set('contact_number', contactNumber);
    }
    return this.http.get<User[]>(`${this.apiBaseUrl}/api/users/search`, { params });
  }

  /**
   * Create a new user
   */
  createUser(user: Partial<User>): Observable<CreateUserResponse> {
    return this.http.post<CreateUserResponse>(`${this.apiBaseUrl}/api/users`, user);
  }

  /**
   * Update user
   */
  updateUser(id: number, userData: Partial<User>): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiBaseUrl}/api/users/${id}`, userData);
  }

  /**
   * Delete user (soft delete)
   */
  deleteUser(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiBaseUrl}/api/users/${id}`);
  }

  /**
   * Change user password
   */
  changePassword(id: number, oldPassword: string, newPassword: string, confirmPassword: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiBaseUrl}/api/users/${id}/change-password`, {
      old_password: oldPassword,
      new_password: newPassword,
      confirm_password: confirmPassword
    });
  }

  /**
   * Reset user password (admin only)
   */
  resetPassword(id: number): Observable<ResetPasswordResponse> {
    return this.http.post<ResetPasswordResponse>(`${this.apiBaseUrl}/api/users/${id}/reset-password`, {});
  }

  /**
   * Get all roles
   */
  getAllRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.apiBaseUrl}/api/roles`);
  }
}

