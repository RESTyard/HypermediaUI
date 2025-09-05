import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { map, Observable, tap } from "rxjs";
import { Store } from "@ngrx/store";
import { updateAppConfig } from "./app/store/appconfig.actions";
import { Record } from "immutable";

@Injectable({
    providedIn: 'root'
})
export class AppConfigService {
    private disableDeveloperControls: boolean = false;

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
                    const newConfig = new AppConfig({
                        disableDeveloperControls: this.disableDeveloperControls,
                    });
                    this.store.dispatch(updateAppConfig({ newConfig: newConfig}))
            }));
    }
}

export class AppConfig extends Record({
    disableDeveloperControls: true,
}) {}