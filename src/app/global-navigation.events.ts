import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { Unit } from "./utils/result";

@Injectable()
export class GlobalNavigationEvents {
    private gotoEntryPoint: Subject<Unit> = new Subject();
    private gotoMainPage: Subject<Unit> = new Subject();

    public emitGotoEntryPoint() {
        this.gotoEntryPoint.next(Unit.NoThing);
    }

    public emitGotoMainPage() {
        this.gotoMainPage.next(Unit.NoThing);
    }

    public get onGotoEntryPoint() {
        return this.gotoEntryPoint.asObservable();
    }

    public get onGotoMainPage() {
        return this.gotoMainPage.asObservable();
    }
}