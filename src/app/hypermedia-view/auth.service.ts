import {Injectable} from '@angular/core';
import {User, UserManager} from 'oidc-client-ts';
import {SettingsService} from '../settings/services/settings.service';
import {AuthenticationConfiguration, HeaderSetting} from '../settings/services/AppSettings';
import {Result, Unit} from "../utils/result";

@Injectable()
export class AuthService {
  private userManagers: Map<string, UserManager>;
  private tokenRecentlyAquired: Map<string, boolean>;

  constructor(private settingsService: SettingsService) {
    this.userManagers = new Map();
    this.tokenRecentlyAquired = new Map();
  }

  async login({entryPoint, authority, client_id, redirect_uri, scope}: {
    entryPoint: string,
    authority: string,
    client_id: string,
    redirect_uri: string,
    scope: string
  }): Promise<Result<Unit>> {
    let userManager = new UserManager({
      authority: authority,
      client_id: client_id,
      redirect_uri: redirect_uri,
      response_type: 'code',
      scope: scope
    })

    this.userManagers.set(entryPoint, userManager)

    let siteSettings = this.settingsService.getSettingsForSite(new URL(entryPoint).host);
    if (siteSettings.AuthConfig !== null) {
      return Result.error("Different login is already in progress");
    }

    siteSettings.AuthConfig = new AuthenticationConfiguration(authority, client_id, redirect_uri, scope);

    this.settingsService.saveSettingsForSite(siteSettings);
    try {
      await userManager.signinRedirect();
      return Result.ok(Unit.NoThing);
    } catch {
      return Result.error("Error during authentication");
    }
  }

  isTokenRecentlyAcquired(entryPoint: string): boolean {
    return this.tokenRecentlyAquired.has(entryPoint);
  }

  authSuccessfulWithTokenFor(entryPoint: string) {
    this.tokenRecentlyAquired.delete(entryPoint);
  }

  async handleCallback(entryPoint: string): Promise<Result<Unit>> {

    let siteSettings = this.settingsService.getSettingsForSite(new URL(entryPoint).host);

    if (!siteSettings.AuthConfig) {
      return Result.error("OAuth config was not found.");
    }

    let authConfig = siteSettings.AuthConfig;

    const userManager = new UserManager({
      authority: authConfig.authority,
      client_id: authConfig.client_id,
      redirect_uri: authConfig.redirect_uri,
      response_type: 'code',
      scope: authConfig.scope
    });

    if (userManager === undefined) {
      return Result.error("UserManager could not be created.");
    }

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

    let headers = siteSettings.Headers.find(h => h.Key === "Authorization");
    if (!headers) {
      siteSettings.Headers.push(new HeaderSetting("Authorization", "Bearer " + token))
    } else {
      headers.Value = "Bearer " + token;
    }
    this.tokenRecentlyAquired.set(entryPoint, true);
    siteSettings.AuthConfig = null;

    this.settingsService.SaveCurrentSettings();
    return Result.ok(Unit.NoThing);
  }
}
