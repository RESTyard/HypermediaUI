import { ModuleWithProviders } from "@angular/core";
import { StoreModule, StoreRootModule } from "@ngrx/store";
import { appSettingsReducer } from "./appsettings.reducer";
import { appConfigReducer } from "./appconfig.reducer";
import { entryPointReducer } from "./entrypoint.reducer";


export function importStore() : ModuleWithProviders<StoreRootModule> {
    return StoreModule.forRoot({
        appSettings: appSettingsReducer,
        appConfig: appConfigReducer,
        currentEntryPoint: entryPointReducer,
    });
}
