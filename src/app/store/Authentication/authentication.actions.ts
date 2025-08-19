import { createAction, props } from '@ngrx/store';
import { User, LoginRequest, LoginResponse } from './auth.models';

// Register action
export const Register = createAction('[Authentication] Register', props<{ email: string, username: string, password: string }>());
export const RegisterSuccess = createAction('[Authentication] Register Success', props<{ user: User }>());
export const RegisterFailure = createAction('[Authentication] Register Failure', props<{ error: string }>());

// Login actions
export const login = createAction('[Authentication] Login', props<{ credentials: LoginRequest }>());
export const loginSuccess = createAction('[Authentication] Login Success', props<{ response: LoginResponse }>());
export const loginFailure = createAction('[Authentication] Login Failure', props<{ error: string }>());

// Logout actions
export const logout = createAction('[Authentication] Logout');
export const logoutSuccess = createAction('[Auth] Logout Success');

// Token management
export const setToken = createAction('[Authentication] Set Token', props<{ token: string }>());
export const clearToken = createAction('[Authentication] Clear Token');


