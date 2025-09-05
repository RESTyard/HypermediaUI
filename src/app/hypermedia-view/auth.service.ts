import { Injectable } from '@angular/core';
import { User, UserManager } from 'oidc-client-ts';
import { SettingsService } from '../settings/services/settings.service';
import { AuthenticationConfiguration, HeaderSetting } from '../settings/services/AppSettings';

@Injectable()
export class AuthService {
    private userManagers: Map<string, UserManager>;
    private tokenRecentlyAquired: Map<string, boolean>;

    constructor(private settingsService: SettingsService) {
        this.userManagers = new Map();
        this.tokenRecentlyAquired = new Map();
    }

    async login(entryPoint: string, authority: string, client_id: string, redirect_uri: string, scope: string): Promise<void> {
        let userManager = new UserManager({
            authority: authority,
            client_id: client_id,
            redirect_uri: redirect_uri,
            response_type: 'code',
            scope: scope})
        
        this.userManagers.set(entryPoint, userManager)

        let siteSettings = this.settingsService.getSettingsForSite(new URL(entryPoint).host);
        if(siteSettings.AuthConfig !== null) {
            return;
        }
        
        siteSettings.AuthConfig = new AuthenticationConfiguration(authority, client_id, redirect_uri, scope);

        
        this.settingsService.saveSettingsForSite(siteSettings);

        await userManager.signinRedirect();
    }

    async tryGetToken(entryPoint: string): Promise<string | null> {
        let userManager = this.userManagers.get(entryPoint);

        if(userManager === undefined) {
            return null;
        }

        let user = await userManager.getUser();

        let access_token = user?.access_token;

        if(access_token === undefined) {
            return null;
        }

        return access_token;
    }

    isTokenRecentlyAquired(entryPoint: string) : boolean {
        return this.tokenRecentlyAquired.has(entryPoint);
    }

    authSuccessfulWithTokenFor(entryPoint: string) {
        this.tokenRecentlyAquired.delete(entryPoint);
    }

    async handleCallback(entryPoint: string): Promise<boolean> {
        
        let siteSettings = this.settingsService.getSettingsForSite(new URL(entryPoint).host);

        if(!siteSettings.AuthConfig) {
            return false;
        }

        let authConfig = siteSettings.AuthConfig;

        const userManager = new UserManager({
            authority: authConfig.authority,
            client_id: authConfig.client_id,
            redirect_uri: authConfig.redirect_uri,
            response_type: 'code',
            scope: authConfig.scope
        });

        if(userManager === undefined) {
            return false;
        }

        let user = await userManager.signinCallback();

        if(!user) {
            return false;
        }

        const token = user.access_token;

        let headers = siteSettings.Headers.find(h => h.Key === "Authorization");    
        if(!headers) {
           siteSettings.Headers.push(new HeaderSetting("Authorization", "Bearer " + token))
        } else {
            headers.Value = "Bearer " + token;
        }
        this.tokenRecentlyAquired.set(entryPoint, true);
        siteSettings.AuthConfig = null;
        
        this.settingsService.SaveCurrentSettings();
        return true;
    }
}