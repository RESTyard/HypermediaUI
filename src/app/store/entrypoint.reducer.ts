import { createReducer, on } from "@ngrx/store";
import { updateEntryPoint } from "./entrypoint.actions";

export const initialState: CurrentEntryPoint = {};

export const entryPointReducer = createReducer(
    initialState,
    on(updateEntryPoint, (state, props) => props.newEntryPoint));

export interface CurrentEntryPoint {
    title?: string,
    path?: string,
    entryPoint?: string
}