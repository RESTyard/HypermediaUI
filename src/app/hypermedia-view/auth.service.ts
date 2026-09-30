import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, lastValueFrom } from 'rxjs';
import { Result, Success, Failure, isSuccess } from 'fnxt/result';
import { BffOriginsService } from './bff-origins.service';

export interface BffSession {
  isAuthenticated: boolean;
  name?: string;
}

@Injectable()
export class AuthService {
  private httpClient = inject(HttpClient);
  private bffOrigins = inject(BffOriginsService);
  private readonly sessionProbes = new Map<string, Promise<Result<BffSession, string>>>();

  readonly userName$ = new BehaviorSubject<string | undefined>(undefined);

  async getSession(entryPoint: string): Promise<Result<BffSession, string>> {
    try {
      const session = await lastValueFrom(this.httpClient.get<BffSession>(this.bffUrl(entryPoint, 'session').toString(), {
        withCredentials: true,
      }));

      if (typeof session?.isAuthenticated !== 'boolean') {
        return Failure('The BFF session endpoint returned an invalid response.');
      }

      this.bffOrigins.add(entryPoint);
      this.userName$.next(session.isAuthenticated ? session.name : undefined);
      return Success(session);
    } catch {
      return Failure('The backend does not support the BFF session endpoint.');
    }
  }

  /** Probes the BFF session endpoint once per origin, so later requests know whether to send credentials. */
  async probeSessionOnce(url: string): Promise<void> {
    if (!URL.canParse(url)) {
      return;
    }

    const origin = new URL(url).origin;
    if (!this.sessionProbes.has(origin)) {
      this.sessionProbes.set(origin, this.getSession(url));
    }
    await this.sessionProbes.get(origin);
  }

  refreshSession(entryPoint: string): void {
    if (this.bffOrigins.has(entryPoint)) {
      void this.getSession(entryPoint);
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

  async redirectToLogoutIfSessionSupported(entryPoint: string | undefined, redirectUri: string): Promise<boolean> {
    if (!entryPoint) {
      return false;
    }

    const session = await this.getSession(entryPoint);
    if (!isSuccess(session)) {
      return false;
    }

    this.redirectToLogout(entryPoint, redirectUri);
    return true;
  }

  private bffUrl(entryPoint: string, endpoint: 'session' | 'login' | 'logout'): URL {
    return new URL(`/bff/${endpoint}`, entryPoint);
  }
}
