import { createAction, props } from "@ngrx/store";
import {CurrentUser} from "./user.reducer";

export const setCurrentUser = createAction(
  '[User] Update logged in User',
  props<{ currentUser: CurrentUser }>());
