import { ApiPath } from "../hypermedia-view/api-path";
import { Store } from "@ngrx/store";
import { HypermediaClientService } from "../hypermedia-view/hypermedia-client.service";
import { updateEntryPoint } from "../store/entrypoint.actions";

export function redirectToHuiPage(
  title: string,
  path: string,
  apiPath: ApiPath,
  store: Store,
  hypermediaClientService: HypermediaClientService,
  options: { inplace: boolean }) {
  store.dispatch(updateEntryPoint({ newEntryPoint: { title: title, path: path, entryPoint: apiPath.fullPath[0] }}));
  hypermediaClientService.NavigateToApiPath(apiPath, options);
}