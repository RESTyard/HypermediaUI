import { Observable } from 'rxjs';

export class HypermediaAction {
  public name: string | undefined;
  public classes: string[] = new Array<string>();
  public method: HttpMethodTyes | undefined;
  public href: string | undefined;
  public title: string | undefined;
  public type: string | undefined;

  public isParameterLess: boolean | undefined;
  public waheActionParameterName: string | undefined;
  public waheActionParameterClasses: string[] | undefined;
  public waheActionParameterJsonSchema: Observable<object> | undefined;
  public parameters: string | undefined;
  public defaultValues: object | undefined;

  constructor() { }
}

export enum HttpMethodTyes {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH'
}
