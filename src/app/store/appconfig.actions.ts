import { createAction, props } from "@ngrx/store";
import { AppConfig } from "src/app.config.service";

export const updateAppConfig = createAction('[AppConfig] Update', props<{ newConfig: AppConfig}>());