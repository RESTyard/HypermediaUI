import {Injectable} from '@angular/core';
import {User, UserManager} from 'oidc-client-ts';
import {SettingsService} from '../settings/services/settings.service';
import {Result, Unit} from "../utils/result";
import {Store} from "@ngrx/store";
import {AppSettings, AuthenticationConfiguration, SiteSetting} from "../settings/app-settings";
import {Map as ImmutableMap} from "immutable";
import {addHeader, addSite, setAuthConfig, updateHeader} from "../store/appsettings.actions";

@Injectable()
export class AuthService {
  private tokenRecentlyAcquired: Set<string>;

  private siteSpecificSettings: ImmutableMap<string, SiteSetting> = ImmutableMap();

  constructor(private settingsService: SettingsService, private store: Store<{ appSettings: AppSettings }>) {
    this.tokenRecentlyAcquired = new Set();

    this.store
      .select(s => s.appSettings.siteSettings.siteSpecificSettings)
      .subscribe(settings => this.siteSpecificSettings = settings);
  }

  async login({entryPoint, authority, client_id, redirect_uri, scope}: {
    entryPoint: string,
    authority: string,
    client_id: string,
    redirect_uri: string,
    scope: string
  }): Promise<Result<Unit>> {
    const siteUrl = new URL(entryPoint).host;

    const userManager = new UserManager({
      authority: authority,
      client_id: client_id,
      redirect_uri: redirect_uri,
      response_type: 'code',
      scope: scope
    })

    const siteSettings = this.getOrCreateSiteSpecificSettings(siteUrl);

    if (siteSettings.authConfig !== undefined) {
      this.store.dispatch(setAuthConfig({siteUrl: siteUrl, authConfig: undefined}));
      this.settingsService.SaveCurrentSettings();
      return Result.error("Different login is already in progress");
    }
    this.store.dispatch(setAuthConfig({
      siteUrl: siteUrl,
      authConfig: new AuthenticationConfiguration({authority, client_id, redirect_uri, scope})
    }));
    this.settingsService.SaveCurrentSettings();

    try {
      await userManager.signinRedirect();
      return Result.ok(Unit.NoThing);
    } catch {
      return Result.error("Error during authentication");
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

  authSuccessfulWithTokenFor(entryPoint: string) {
    this.tokenRecentlyAcquired.delete(entryPoint);
  }

  async handleCallback(entryPoint: string): Promise<Result<Unit>> {

    const siteUrl = new URL(entryPoint).host;
    const siteSettings = this.getOrCreateSiteSpecificSettings(siteUrl);

    if (!siteSettings.authConfig) {
      return Result.error("OAuth config was not found for entryPoint: " + entryPoint + ", siteUrl: " + siteUrl);
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
      return Result.error("Error handling response from OAuth Provider.");
    }

    if (!user) {
      return Result.error("User could not be Authenticated.");
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
    this.store.dispatch(setAuthConfig({siteUrl: siteUrl, authConfig: undefined}))
    this.settingsService.SaveCurrentSettings();
    return Result.ok(Unit.NoThing);
  }
}
