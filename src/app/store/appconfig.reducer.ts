import { createReducer, on } from "@ngrx/store";
import { updateAppConfig } from "./appconfig.actions";
import { AppConfig } from "src/app.config.service";

export const initialState: AppConfig = new AppConfig();

export const appConfigReducer = createReducer(
    initialState,
    on(updateAppConfig, (state, props) => props.newConfig)
);