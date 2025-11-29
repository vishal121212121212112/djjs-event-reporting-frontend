import { createReducer, on } from '@ngrx/store';
import { 
  Register, 
  RegisterFailure, 
  RegisterSuccess, 
  login, 
  loginFailure, 
  loginSuccess, 
  logout, 
  logoutSuccess,
  setToken,
  clearToken
} from './authentication.actions';
import { User, LoginResponse } from './auth.models';

export interface AuthenticationState {
    isLoggedIn: boolean;
    user: User | null;
    token: string | null;
    error: string | null;
    loading: boolean;
}

const initialState: AuthenticationState = {
    isLoggedIn: false,
    user: null,
    token: null,
    error: null,
    loading: false,
};

export const authenticationReducer = createReducer(
    initialState,
    on(Register, (state) => ({ ...state, error: null, loading: true })),
    on(RegisterSuccess, (state, { user }) => ({ 
      ...state, 
      isLoggedIn: true, 
      user, 
      error: null, 
      loading: false 
    })),
    on(RegisterFailure, (state, { error }) => ({ 
      ...state, 
      error, 
      loading: false 
    })),

    on(login, (state) => ({ 
      ...state, 
      error: null, 
      loading: true 
    })),
    on(loginSuccess, (state, { response, email }) => {
      // Decode JWT token to extract user information
      let userInfo: any = {};
      try {
        const base64Url = response.token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        userInfo = JSON.parse(jsonPayload);
      } catch (error) {
        console.error('Error decoding token:', error);
      }

      const user: User = {
        userId: userInfo.user_id?.toString() || userInfo.userId?.toString() || '',
        email: email,
        token: response.token,
        type: userInfo.role_id?.toString() || ''
      };
      
      return { 
        ...state, 
        isLoggedIn: true, 
        user, 
        token: response.token,
        error: null, 
        loading: false 
      };
    }),
    on(loginFailure, (state, { error }) => ({ 
      ...state, 
      error, 
      loading: false 
    })),
    
    on(logout, (state) => ({ 
      ...state, 
      loading: true 
    })),
    on(logoutSuccess, (state) => ({ 
      ...state, 
      isLoggedIn: false, 
      user: null, 
      token: null, 
      error: null,
      loading: false 
    })),

    on(setToken, (state, { token }) => ({ 
      ...state, 
      token 
    })),
    on(clearToken, (state) => ({ 
      ...state, 
      token: null 
    }))
);
