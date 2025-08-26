import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { AuthenticationService } from '../../core/services/auth.service';
import { 
  login, 
  loginSuccess, 
  loginFailure,
  logout,
  logoutSuccess
} from './authentication.actions';

@Injectable()
export class AuthenticationEffects {

  constructor(
    private actions$: Actions,
    private authService: AuthenticationService
  ) {}

  // Login effect - this is handled directly in the service now
  // but we can add additional side effects here if needed
  
  // Logout effect
  logout$ = createEffect(() => this.actions$.pipe(
    ofType(logout),
    switchMap(() => {
      // Perform any cleanup actions here
      return of(logoutSuccess());
    })
  ));

  // Add any other side effects here as needed
  // For example: token refresh, session management, etc.
}