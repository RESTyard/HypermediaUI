import { createAction, props } from "@ngrx/store";
import { CurrentEntryPoint } from "./entrypoint.reducer";

export const updateEntryPoint = createAction(
    '[EntryPoint] Update',
    props<{ newEntryPoint: CurrentEntryPoint }>());