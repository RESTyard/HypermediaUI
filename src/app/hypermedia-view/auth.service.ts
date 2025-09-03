import { Injectable } from '@angular/core';
import { User, UserManager } from 'oidc-client-ts';
import { SettingsService } from '../settings/services/settings.service';
import { AuthenticationConfiguration, HeaderSetting } from '../settings/services/AppSettings';

@Injectable()
export class AuthService {
    private userManagers: Map<string, UserManager>;

    constructor(private settingsService: SettingsService) {
        this.userManagers = new Map();
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
            headers.Value = token;
        }
        siteSettings.AuthConfig = null;
        
        this.settingsService.SaveCurrentSettings();
        return true;
    }
}