import { Component } from '@angular/core';
import { HypermediaClientService } from '../hypermedia-view/hypermedia-client.service';
import { AppConfig } from 'src/app.config.service';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { HypermediaViewModule } from "../hypermedia-view/hypermedia-view.module";
import { combineLatest } from 'rxjs';
import { CurrentEntryPoint } from '../store/entrypoint.reducer';
import { updateEntryPoint } from '../store/entrypoint.actions';
import { ApiPath } from '../hypermedia-view/api-path';

@Component({
  selector: 'app-alias-page',
  imports: [HypermediaViewModule],
  templateUrl: './alias-page.component.html',
  styleUrl: './alias-page.component.css'
})
export class AliasPageComponent {
  showHypermediaControl: boolean = false;
  error: string | undefined = undefined;

  constructor(
    hypermediaClientService: HypermediaClientService,
    store: Store<{ appConfig: AppConfig, currentEntryPoint: CurrentEntryPoint }>,
    activatedRoute: ActivatedRoute) {
      combineLatest(
        [
          store.select(state => state.appConfig.configuredEntryPoints),
          activatedRoute.url,
          activatedRoute.queryParams,
        ])
        .subscribe({
          next: tuple => {
            const [configuredEntryPoints, urlSegments, queryParams] = tuple;
            if (configuredEntryPoints !== undefined && urlSegments !== undefined && queryParams !== undefined) {
              const path = urlSegments[urlSegments.length - 1].path;
              var config = configuredEntryPoints.find(e => e.alias == path);
              if (config) {
                const apiPath = new ApiPath();
                apiPath.initFromRouterParams(queryParams);
                apiPath.insert(config.entryPointUri, 0);
                store.dispatch(updateEntryPoint({ newEntryPoint: { title: config.title, path: config.alias, entryPoint: config.entryPointUri }}));
                hypermediaClientService.NavigateToApiPath(apiPath);
              } else {
                this.error = "Error";
              }
            }
          }
        });
    }
}
