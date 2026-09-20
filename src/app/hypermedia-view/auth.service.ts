import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, distinctUntilChanged, filter, lastValueFrom } from 'rxjs';
import { Result, Success, Failure } from 'fnxt/result';
import { Unit } from '../utils/unit';
import { Store } from '@ngrx/store';
import { CurrentEntryPoint } from '../store/entrypoint.reducer';

export interface BffSession {
  isAuthenticated: boolean;
  name?: string;
}

@Injectable()
export class AuthService {
  private httpClient = inject(HttpClient);
  private store = inject<Store<{ currentEntryPoint: CurrentEntryPoint }>>(Store);

  readonly userName$ = new BehaviorSubject<string | undefined>(undefined);
  readonly isAuthenticated$ = new BehaviorSubject(false);

  constructor() {
    this.store.select(state => state.currentEntryPoint.entryPoint)
      .pipe(
        filter((entryPoint): entryPoint is string => entryPoint !== undefined),
        distinctUntilChanged(),
      )
      .subscribe(entryPoint => void this.getSession(entryPoint));
  }

  async getSession(entryPoint: string): Promise<Result<BffSession, string>> {
    try {
      const session = await lastValueFrom(this.httpClient.get<BffSession>(this.bffUrl(entryPoint, 'session').toString(), {
        withCredentials: true,
      }));

      if (typeof session?.isAuthenticated !== 'boolean') {
        return Failure('The BFF session endpoint returned an invalid response.');
      }

      this.userName$.next(session.isAuthenticated ? session.name : undefined);
      this.isAuthenticated$.next(session.isAuthenticated);
      return Success(session);
    } catch {
      return Failure('The backend does not support the BFF session endpoint.');
    }
  }

  redirectToLogin(url: string, redirectUri: string): void {
    const loginUrl = this.bffUrl(url, 'login');
    loginUrl.searchParams.set('redirectUri', redirectUri);
    window.location.assign(loginUrl.toString());
  }

  redirectToLogout(entryPoint: string, redirectUri: string): void {
    const logoutUrl = this.bffUrl(entryPoint, 'logout');
    logoutUrl.searchParams.set('redirectUri', redirectUri);
    window.location.assign(logoutUrl.toString());
  }

  private bffUrl(entryPoint: string, endpoint: 'session' | 'login' | 'logout'): URL {
    return new URL(`/bff/${endpoint}`, entryPoint);
  }
}
