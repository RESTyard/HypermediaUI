import {Observable} from 'rxjs';
import {FileUploadConfiguration} from "./file-upload-configuration";

export class HypermediaAction {
  public name: string | undefined;
  public classes: string[] = new Array<string>();
  public method: HttpMethodTypes = HttpMethodTypes.GET;
  public href: string = "";
  public title: string  = "";
  public type: string | undefined;
  public fieldType: string | undefined;

  public actionType: ActionType = ActionType.NoParameters;

  public waheActionParameterName: string | undefined;
  public waheActionParameterClasses: string[] | undefined;
  public waheActionParameterJsonSchema: Observable<object> | undefined;
  public parameters: string | undefined;
  public defaultValues: object | undefined;

  public files: File[] = [];
  public FileUploadConfiguration: FileUploadConfiguration = new FileUploadConfiguration();

  constructor() { }
}

export enum HttpMethodTypes {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH'
}

export enum ActionType {
  NoParameters = 'none',
  JsonObjectParameters = 'application/json',
  FileUpload = 'multipart/form-data'
}

