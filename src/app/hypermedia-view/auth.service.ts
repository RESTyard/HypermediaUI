import {Injectable} from '@angular/core';
import {User, UserManager} from 'oidc-client-ts';
import {SettingsService} from '../settings/services/settings.service';
import {Unit} from "../utils/unit";
import {Result, Success, Failure} from 'fnxt/result';
import {Store} from "@ngrx/store";
import {AppSettings, AuthenticationConfiguration, SiteSetting} from "../settings/app-settings";
import {Map as ImmutableMap} from "immutable";
import {
  addHeader,
  addSite, removeHeader, setAuthConfig,
  setAuthenticationInProgress,
  updateHeader
} from "../store/appsettings.actions";
import {CurrentEntryPoint} from "../store/entrypoint.reducer";

@Injectable()
export class AuthService {
  private tokenRecentlyAcquired: Set<string>;

  private siteSpecificSettings: ImmutableMap<string, SiteSetting> = ImmutableMap();
  private currentEntryPoint: CurrentEntryPoint = {};

  constructor(private settingsService: SettingsService, private store: Store<{ appSettings: AppSettings, currentEntryPoint: CurrentEntryPoint }>) {
    this.tokenRecentlyAcquired = new Set();

    this.store
      .select(s => s.appSettings.siteSettings.siteSpecificSettings)
      .subscribe(settings => this.siteSpecificSettings = settings);
    this.store
      .select(s => s.currentEntryPoint)
      .subscribe({ next: entryPoint => this.currentEntryPoint = entryPoint})
  }

  async login({entryPoint, authority, client_id, redirect_uri, scope}: {
    entryPoint: string,
    authority: string,
    client_id: string,
    redirect_uri: string,
    scope: string
  }): Promise<Result<Unit, string>> {
    const siteUrl = new URL(entryPoint).host;

    const userManager = new UserManager({
      authority: authority,
      client_id: client_id,
      redirect_uri: redirect_uri,
      response_type: 'code',
      scope: scope
    })

    const siteSettings = this.getOrCreateSiteSpecificSettings(siteUrl);

    if (siteSettings.authenticationInProgress) {
      this.store.dispatch(setAuthConfig({siteUrl: siteUrl, authConfig: undefined}));
      this.settingsService.SaveCurrentSettings();
      return Failure("Different login is already in progress");
    }
    this.store.dispatch(setAuthConfig({
      siteUrl: siteUrl,
      authConfig: new AuthenticationConfiguration({authority, client_id, redirect_uri, scope})
    }));
    this.store.dispatch(setAuthenticationInProgress({siteUrl: siteUrl, authenticationInProgress: true}))
    this.settingsService.SaveCurrentSettings();

    try {
      await userManager.signinRedirect();
      return Success(Unit.NoThing);
    } catch {
      return Failure("Error during authentication");
    }
  }

  private getOrCreateSiteSpecificSettings(siteUrl: string) {
    let siteSettings = this.siteSpecificSettings.get(siteUrl)

    if (!siteSettings) {
      this.store.dispatch(addSite({siteUrl: siteUrl}));
      siteSettings = new SiteSetting({siteUrl: siteUrl});
    }
    return siteSettings;
  }

  isTokenRecentlyAcquired(entryPoint: string): boolean {
    return this.tokenRecentlyAcquired.has(entryPoint);
  }

  requestSuccessfulFor(entryPoint: string) {
    this.tokenRecentlyAcquired.delete(entryPoint);
  }

  async handleCallback(entryPoint: string): Promise<Result<Unit, string>> {

    const siteUrl = new URL(entryPoint).host;
    const siteSettings = this.getOrCreateSiteSpecificSettings(siteUrl);

    if (!siteSettings.authConfig) {
      return Failure("OAuth config was not found for entryPoint: " + entryPoint + ", siteUrl: " + siteUrl);
    }

    const authConfig = siteSettings.authConfig;

    const userManager = new UserManager({
      authority: authConfig.authority,
      client_id: authConfig.client_id,
      redirect_uri: authConfig.redirect_uri,
      response_type: 'code',
      scope: authConfig.scope
    });

    let user: User | undefined = undefined

    try {
      user = await userManager.signinCallback();
    } catch {
      return Failure("Error handling response from OAuth Provider.");
    }

    if (!user) {
      return Failure("User could not be Authenticated.");
    }

    const token = user.access_token;

    const authorizationHeaderKey = "Authorization";
    const newTokenHeader = "Bearer " + token;

    if (siteSettings.headers.has(authorizationHeaderKey)) {
      this.store.dispatch(updateHeader({
        siteUrl: siteUrl,
        previousKey: authorizationHeaderKey,
        newKey: authorizationHeaderKey,
        newValue: newTokenHeader
      }));
    } else {
      this.store.dispatch(addHeader({
        siteUrl: siteUrl,
        key: authorizationHeaderKey,
        value: newTokenHeader
      }));
    }
    this.tokenRecentlyAcquired.add(entryPoint);
    this.store.dispatch(setAuthenticationInProgress({siteUrl: siteUrl, authenticationInProgress: false}))
    this.settingsService.SaveCurrentSettings();
    return Success(Unit.NoThing);
  }

  async handleLogout(): Promise<Result<Unit, string>> {
    const entryPoint = this.currentEntryPoint.entryPoint;
    if(!entryPoint) {
      return Failure("Logout without entryPoint");
    }

    const siteUrl = new URL(entryPoint).host;
    const siteSettings = this.getOrCreateSiteSpecificSettings(siteUrl);

    if (!siteSettings.authConfig) {
      return Failure("OAuth config was not found for entryPoint: " + entryPoint + ", siteUrl: " + siteUrl);
    }

    const authConfig = siteSettings.authConfig;

    let redirectUri = window.location.origin + '/logout-redirect?entrypoint_uri=' + entryPoint;
    if(this.currentEntryPoint.path !== undefined && this.currentEntryPoint.path !== 'hui') {
      redirectUri += '&path=' + this.currentEntryPoint.path;
    }

    const userManager = new UserManager({
      authority: authConfig.authority,
      client_id: authConfig.client_id,
      redirect_uri: authConfig.redirect_uri,
      post_logout_redirect_uri: redirectUri,
      response_type: 'code',
      scope: authConfig.scope
    });

    this.store.dispatch(removeHeader({siteUrl: siteUrl, key: "Authorization"}));
    this.settingsService.SaveCurrentSettings();

    try {
      await userManager.signoutRedirect();
      return Success(Unit.NoThing);
    } catch {
      return Failure("Error redirecting to OAuth Provider for signout.");
    }
  }

  async handleLogoutCallback(entryPoint: string): Promise<Result<Unit, string>> {
    const siteUrl = new URL(entryPoint).host;
    const siteSettings = this.getOrCreateSiteSpecificSettings(siteUrl);

    if (!siteSettings.authConfig) {
      return Failure("OAuth config was not found for entryPoint: " + entryPoint + ", siteUrl: " + siteUrl);
    }

    const authConfig = siteSettings.authConfig;

    const userManager = new UserManager({
      authority: authConfig.authority,
      client_id: authConfig.client_id,
      redirect_uri: authConfig.redirect_uri,
      response_type: 'code',
      scope: authConfig.scope
    });

    try {
      await userManager.signoutCallback();
      this.store.dispatch(setAuthConfig({siteUrl: siteUrl, authConfig: undefined}))
      return Success(Unit.NoThing);
    } catch(err) {
      return Failure("Error handling response from OAuth provider.");
    }
  }
}
