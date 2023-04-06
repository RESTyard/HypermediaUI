import { Observable } from 'rxjs';

export class HypermediaAction {
  public name: string | undefined;
  public classes: string[] = new Array<string>();
  public method: HttpMethodTypes = HttpMethodTypes.GET;
  public href: string = "";
  public title: string  = "";
  public type: string | undefined;

  //TODO: make it an enum of action types
  public isParameterLess: boolean | undefined;
  public waheActionParameterName: string | undefined;
  public waheActionParameterClasses: string[] | undefined;
  public waheActionParameterJsonSchema: Observable<object> | undefined;
  public parameters: string | undefined;
  public defaultValues: object | undefined;
  public formData: FormData | undefined;

  constructor() { }
}

export enum HttpMethodTypes {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH'
}
