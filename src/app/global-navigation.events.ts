import { Injectable, inject } from "@angular/core";
import { Subject } from "rxjs";
import { Unit } from "./utils/unit";
import { AuthService } from "./hypermedia-view/auth.service";
import { Store } from "@ngrx/store";
import { CurrentEntryPoint } from "./store/entrypoint.reducer";

@Injectable()
export class GlobalNavigationEvents {
    private authService = inject(AuthService);
    private store = inject<Store<{ currentEntryPoint: CurrentEntryPoint }>>(Store);
    private gotoEntryPoint: Subject<Unit> = new Subject<Unit>();
    private gotoMainPage: Subject<Unit> = new Subject<Unit>();
    private gotoPreviousStep: Subject<Unit> = new Subject<Unit>();
    private exitApi : Subject<Unit> = new Subject<Unit>();
    private currentEntryPoint: string | undefined;

    constructor() {
      this.store.select(state => state.currentEntryPoint.entryPoint)
        .subscribe(entryPoint => this.currentEntryPoint = entryPoint);
    }

    public emitGotoEntryPoint() {
        this.gotoEntryPoint.next(Unit.NoThing);
    }

    public emitGotoMainPage() {
        this.gotoMainPage.next(Unit.NoThing);
    }

    public emitGotoPreviousStep() {
        this.gotoPreviousStep.next(Unit.NoThing);
    }

    public async emitExitApi() {
      if (this.exitApi.observed) {
        this.exitApi.next(Unit.NoThing);
      } else {
        if (await this.authService.redirectToLogoutIfSessionSupported(this.currentEntryPoint, window.location.origin)) {
          return;
        }
        this.emitGotoMainPage();
      }
    }

    public get onGotoEntryPoint() {
        return this.gotoEntryPoint.asObservable();
    }

    public get onGotoMainPage() {
        return this.gotoMainPage.asObservable();
    }

    public get onGotoPreviousStep() {
        return this.gotoPreviousStep.asObservable();
    }

    public get onExitApi() {
      return this.exitApi.asObservable();
    }
}
