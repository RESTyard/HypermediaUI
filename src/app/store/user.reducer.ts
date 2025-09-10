import {createReducer, on} from "@ngrx/store";
import {setCurrentUser} from "./user.actions";

export const initialState: CurrentUser = {};

export const userReducer = createReducer(
  initialState,
  on(setCurrentUser, (state, props) => props.currentUser));

export interface CurrentUser {
  name?: string;
}
