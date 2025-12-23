import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, mergeMap, map, tap } from 'rxjs/operators';

import { of } from 'rxjs';
import { UserApiService } from 'src/app/core/services/user-api.service';
import {
    fetchuserlistData, fetchuserlistSuccess,
    fetchuserlistFail,
    adduserlistFailure,
    adduserlistSuccess,
    adduserlist,
    updateuserlistFailure,
    updateuserlistSuccess,
    updateuserlist,
    deleteuserlistFailure,
    deleteuserlistSuccess,
    deleteuserlist
} from './userlist.action';

@Injectable()
export class userslistEffects {
    fetchData$ = createEffect(() =>
        this.actions$.pipe(
            ofType(fetchuserlistData),
            mergeMap(() =>
                this.userApiService.getAllUsers().pipe(
                    map((UserListdata) => fetchuserlistSuccess({ UserListdata })),
                    catchError((error) => {
                        console.error('Error fetching users:', error);
                        return of(fetchuserlistFail({ error: error.message || 'Failed to fetch users' }));
                    })
                )
            ),
        ),
    );

    addData$ = createEffect(() =>
        this.actions$.pipe(
            ofType(adduserlist),
            mergeMap(({ newData }) =>
                this.userApiService.createUser(newData).pipe(
                    map((response) => {
                        // The backend returns the user with password, we'll use the user from response
                        return adduserlistSuccess({ newData: response.user });
                    }),
                    catchError((error) => {
                        console.error('Error creating user:', error);
                        return of(adduserlistFailure({ error: error.error?.error || error.message || 'Failed to create user' }));
                    })
                )
            )
        )
    );

    updateData$ = createEffect(() =>
        this.actions$.pipe(
            ofType(updateuserlist),
            mergeMap(({ updatedData }) => {
                if (!updatedData.id) {
                    return of(updateuserlistFailure({ error: 'User ID is required for update' }));
                }
                // Remove fields that shouldn't be updated
                const { id, password, created_on, created_by, ...updateFields } = updatedData;
                return this.userApiService.updateUser(id, updateFields).pipe(
                    map(() => updateuserlistSuccess({ updatedData })),
                    catchError((error) => {
                        console.error('Error updating user:', error);
                        return of(updateuserlistFailure({ error: error.error?.error || error.message || 'Failed to update user' }));
                    })
                );
            })
        )
    );

    deleteData$ = createEffect(() =>
        this.actions$.pipe(
            ofType(deleteuserlist),
            mergeMap(({ id }) =>
                this.userApiService.deleteUser(Number(id)).pipe(
                    map(() => deleteuserlistSuccess({ id })),
                    catchError((error) => {
                        console.error('Error deleting user:', error);
                        return of(deleteuserlistFailure({ error: error.error?.error || error.message || 'Failed to delete user' }));
                    })
                )
            )
        )
    );

    constructor(
        private actions$: Actions,
        private userApiService: UserApiService
    ) { }

}