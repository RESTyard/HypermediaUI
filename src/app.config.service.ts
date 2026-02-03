import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { map, Observable, tap } from "rxjs";
import { Store } from "@ngrx/store";
import { updateAppConfig } from "./app/store/appconfig.actions";
import { Record } from "immutable";
import { updateMappingsIconMappings } from "./app/hypermedia-view/icon-mapping";

@Injectable({
    providedIn: 'root'
})
export class AppConfigService implements HypermediaUI.IAppConfig {
    public disableDeveloperControls: boolean = false;
    public configuredEntryPoints: ConfiguredEntryPoint[] = [];
    public onlyAllowConfiguredEntryPoints: boolean = false;
    public relationIconMapping?: { [key: string]: string };
    public httpMethodIconMapping?: { [key: string]: string };
    public actionPopupWarningConfigurations: HypermediaUI.IActionClassConfiguration[] = [];

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
                    updateMappingsIconMappings(this.relationIconMapping, this.httpMethodIconMapping);
                    const mapped: Partial<AppConfig> & HypermediaUI.IAppConfig = {
                        disableDeveloperControls: this.disableDeveloperControls,
                        configuredEntryPoints: this.configuredEntryPoints,
                        onlyAllowConfiguredEntryPoints: this.onlyAllowConfiguredEntryPoints,
                        relationIconMapping: this.relationIconMapping,
                        httpMethodIconMapping: this.httpMethodIconMapping,
                        actionPopupWarningConfigurations: this.actionPopupWarningConfigurations,
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
    relationIconMapping: <{ [key: string]: string } | undefined> undefined,
    httpMethodIconMapping: <{ [key: string]: string } | undefined> undefined,
    actionPopupWarningConfigurations: <HypermediaUI.IActionClassConfiguration[] | undefined> undefined,
}) {}

export class ConfiguredEntryPoint extends Record({
    alias: "",
    title: "",
    entryPointUri: "",
}) {}
