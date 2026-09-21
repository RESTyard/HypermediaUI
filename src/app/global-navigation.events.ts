import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { Unit } from "./utils/unit";

@Injectable()
export class GlobalNavigationEvents {
    private gotoEntryPoint: Subject<Unit> = new Subject<Unit>();
    private gotoMainPage: Subject<Unit> = new Subject<Unit>();
    private gotoPreviousStep: Subject<Unit> = new Subject<Unit>();
    private exitApi : Subject<Unit> = new Subject<Unit>();

    public emitGotoEntryPoint() {
        this.gotoEntryPoint.next(Unit.NoThing);
    }

    public emitGotoMainPage() {
        this.gotoMainPage.next(Unit.NoThing);
    }

    public emitGotoPreviousStep() {
        this.gotoPreviousStep.next(Unit.NoThing);
    }

    public emitExitApi() {
      if (this.exitApi.observed) {
        this.exitApi.next(Unit.NoThing);
      } else {
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
