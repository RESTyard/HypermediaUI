import { Component, OnInit, inject } from '@angular/core';
import { HypermediaClientService } from '../hypermedia-view/hypermedia-client.service';
import { AppConfig } from 'src/app.config.service';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { HypermediaViewModule } from "../hypermedia-view/hypermedia-view.module";
import { combineLatest } from 'rxjs';
import { CurrentEntryPoint } from '../store/entrypoint.reducer';
import { ApiPath } from '../hypermedia-view/api-path';
import { redirectToHuiPage } from '../utils/redirect';

@Component({
  selector: 'app-alias-page',
  imports: [HypermediaViewModule],
  templateUrl: './alias-page.component.html',
  styleUrl: './alias-page.component.css'
})
export class AliasPageComponent implements OnInit {
  private hypermediaClientService = inject(HypermediaClientService);
  private store = inject<Store<{
    appConfig: AppConfig;
    currentEntryPoint: CurrentEntryPoint;
}>>(Store);
  private activatedRoute = inject(ActivatedRoute);

  error: string | undefined = undefined;

  ngOnInit() {
    combineLatest(
        [
          this.store.select(state => state.appConfig.configuredEntryPoints),
          this.activatedRoute.url,
          this.activatedRoute.queryParams,
        ])
        .subscribe({
          next: tuple => {
            const [configuredEntryPoints, urlSegments, queryParams] = tuple;
            if (configuredEntryPoints !== undefined && urlSegments !== undefined && queryParams !== undefined) {
              const path = urlSegments[urlSegments.length - 1].path;
              const config = configuredEntryPoints.find(e => e.alias == path);
              if (config) {
                const apiPath = new ApiPath();
                apiPath.initFromRouterParams(queryParams);
                apiPath.insert(config.entryPointUri, 0);
                redirectToHuiPage(
                  config.title,
                  path,
                  apiPath,
                  this.store,
                  this.hypermediaClientService,
                  { inplace: true });
              } else {
                this.error = "Error";
              }
            }
          }
        });
  }
}
