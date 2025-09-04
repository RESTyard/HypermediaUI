import { HttpHeaders } from "@angular/common/http";
import { BehaviorSubject } from "rxjs";
import { ProblemDetailsError } from "../error-dialog/problem-details-error";
import { ApiPath } from "../hypermedia-view/api-path";
import { ActionResults, HypermediaClientService, IHypermediaClientService } from "../hypermedia-view/hypermedia-client.service";
import { HypermediaAction } from "../hypermedia-view/siren-parser/hypermedia-action";
import { SirenClientObject } from "../hypermedia-view/siren-parser/siren-client-object";
import { ClassProvider } from "@angular/core";

export function provideHypermediaClientServiceMock(): ClassProvider {
    return {
        provide: HypermediaClientService,
        useClass: HypermediaClientServiceMock,
    }
};

export class HypermediaClientServiceMock implements IHypermediaClientService {
    public isBusy$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    public getHypermediaObjectStream = (): BehaviorSubject<SirenClientObject> => {
        return new BehaviorSubject<SirenClientObject>(new SirenClientObject());
    }
    public getHypermediaObjectRawStream = (): BehaviorSubject<object> => {
        return new BehaviorSubject<object>({});
    }
    public getNavPathsStream = (): BehaviorSubject<Array<string>> => {
        return new BehaviorSubject<Array<string>>([]);
    }
    public navigateToEntryPoint = (): void => {
        throw new Error("Method not implemented.");
    }
    public NavigateToApiPath = (apiPath: ApiPath): void => {
        throw new Error("Method not implemented.");
    }
    get currentApiPath(): ApiPath {
        throw new Error("Method not implemented.");
    }
    public Navigate = (url: string): void => {
        throw new Error("Method not implemented.");
    }
    public DownloadAsFile = (downloadUrl: string): void => {
        throw new Error("Method not implemented.");
    }
    public navigateToMainPage = (): void => {
        throw new Error("Method not implemented.");
    }
    public createHeaders = (withContentType: string | null): HttpHeaders => {
        throw new Error("Method not implemented.");
    }
    public createWaheStyleActionParameters = (action: HypermediaAction) => {
        throw new Error("Method not implemented.");
    }
    public executeAction = (action: HypermediaAction, actionResult: (actionResults: ActionResults, resultLocation: string | null, content: any, problemDetailsError: ProblemDetailsError | null) => void) => {
        throw new Error("Method not implemented.");
    }
}