import { ModuleWithProviders } from "@angular/core";
import { StoreModule, StoreRootModule } from "@ngrx/store";
import { appSettingsReducer } from "../store/appsettings.reducer";
import { appConfigReducer } from "../store/appconfig.reducer";


export function importStore() : ModuleWithProviders<StoreRootModule> {
    return StoreModule.forRoot({
        appSettings: appSettingsReducer,
        appConfig: appConfigReducer,
    });
}