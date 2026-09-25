import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import {map, Observable, tap} from "rxjs";
import { Store } from "@ngrx/store";
import { updateAppConfig } from "./app/store/appconfig.actions";
import { Record as ImmutableJsRecord } from "immutable";
import { updateMappingsIconMappings } from "./app/hypermedia-view/icon-mapping";
import IConfiguredEntryPointsItem = HypermediaUI.IConfiguredEntryPointsItem;
import {Unit} from "./app/utils/unit";

@Injectable({
    providedIn: 'root'
})
export class AppConfigService implements HypermediaUI.IAppConfig {
    private http = inject(HttpClient);
    private store = inject<Store<{ appConfig: AppConfig }>>(Store);

    public disableDeveloperControls: boolean = false;
    public reduceUiElements: boolean = false;
    public autoFollowActionLocationOnSuccess: boolean = false;
    public configuredEntryPoints: ConfiguredEntryPoint[] = [];
    public onlyAllowConfiguredEntryPoints: boolean = false;
    public relationIconMapping?: Record<string, string>;
    public httpMethodIconMapping?: Record<string, string>;
    public actionPopupWarningConfigurations: HypermediaUI.IActionClassConfiguration[] = [];

    load = (): Observable<Unit> => {
        return this.http
            .get('app.config.json')
            .pipe(
                tap(value => {
                    Object.assign(this, value);
                    this.configuredEntryPoints ??= [];
                    this.actionPopupWarningConfigurations ??= [];
                    updateMappingsIconMappings(this.relationIconMapping, this.httpMethodIconMapping);
                    const mapped: Partial<AppConfig> & HypermediaUI.IAppConfig = {
                        disableDeveloperControls: this.disableDeveloperControls,
                        reduceUiElements: this.reduceUiElements,
                        autoFollowActionLocationOnSuccess: this.autoFollowActionLocationOnSuccess,
                        configuredEntryPoints: this.configuredEntryPoints,
                        onlyAllowConfiguredEntryPoints: this.onlyAllowConfiguredEntryPoints,
                        relationIconMapping: this.relationIconMapping,
                        httpMethodIconMapping: this.httpMethodIconMapping,
                        actionPopupWarningConfigurations: this.actionPopupWarningConfigurations,
                    }
                    const newConfig = new AppConfig(mapped);
                    this.store.dispatch(updateAppConfig({ newConfig: newConfig }))
                }),
                map((_, __) => Unit.NoThing)
            );
    }
}

export class AppConfig extends ImmutableJsRecord({
    disableDeveloperControls: true,
    reduceUiElements: true,
    autoFollowActionLocationOnSuccess: false,
    configuredEntryPoints: [] as ConfiguredEntryPoint[],
    onlyAllowConfiguredEntryPoints : false,
    relationIconMapping: undefined as Record<string, string> | undefined,
    httpMethodIconMapping: undefined as Record<string, string> | undefined,
    actionPopupWarningConfigurations: [] as HypermediaUI.IActionClassConfiguration[],
}) {}

export class ConfiguredEntryPoint extends ImmutableJsRecord({
    alias: "",
    title: "",
    entryPointUri: "",
}) implements IConfiguredEntryPointsItem {}
