import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { map, Observable, tap } from "rxjs";
import { Store } from "@ngrx/store";
import { updateAppConfig } from "./app/store/appconfig.actions";
import { Record } from "immutable";

@Injectable({
    providedIn: 'root'
})
export class AppConfigService implements HypermediaUI.IAppConfig {
    public disableDeveloperControls: boolean = false;
    public configuredEntryPoints: ConfiguredEntryPoint[] = [];
    public onlyAllowConfiguredEntryPoints: boolean = false;

    constructor(
        private http: HttpClient,
        private store: Store<{ appConfig: AppConfig }>) {
    }

    load = (): Observable<any> => {
        return this.http
            .get('app.config.json')
            .pipe(
                tap(value => {
                    Object.assign(this, value);
                    const mapped: Partial<AppConfig> & HypermediaUI.IAppConfig = {
                        disableDeveloperControls: this.disableDeveloperControls,
                        configuredEntryPoints: this.configuredEntryPoints,
                        onlyAllowConfiguredEntryPoints: this.onlyAllowConfiguredEntryPoints,
                    }
                    const newConfig = new AppConfig(mapped);
                    this.store.dispatch(updateAppConfig({ newConfig: newConfig }))
            }));
    }
}

export class AppConfig extends Record({
    disableDeveloperControls: true,
    configuredEntryPoints: <ConfiguredEntryPoint[] | undefined> undefined,
    onlyAllowConfiguredEntryPoints: false,
}) {}

export class ConfiguredEntryPoint extends Record({
    alias: "",
    title: "",
    entryPointUri: "",
}) {}