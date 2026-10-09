import {Component, ElementRef, HostListener, OnInit, inject, OnDestroy, viewChild} from '@angular/core';
import {HypermediaClientService} from '../hypermedia-client.service';
import {SirenClientObject} from '../siren-parser/siren-client-object';
import {ActivatedRoute, Router} from '@angular/router';
import {ApiPath} from '../api-path';
import {AppSettings, GeneralSettings} from 'src/app/settings/app-settings';
import {Store} from '@ngrx/store';
import {AppConfig} from 'src/app.config.service';
import {selectEffectiveGeneralSettings} from 'src/app/store/selectors';
import {combineLatest, Subscription} from 'rxjs';
import {CurrentEntryPoint} from 'src/app/store/entrypoint.reducer';
import {AuthService} from "../auth.service";
import {updateGeneralAppSettings} from 'src/app/store/appsettings.actions';
import {MediaTypes} from "../MediaTypes";
import {GlobalNavigationEvents} from "../../global-navigation.events";
import {EntitySearchService} from "../search/entity-search.service";
import {SearchOptions} from "../search/entity-search";
import {SettingsService} from "../../settings/services/settings.service";
import {EmbeddedNavigationService} from "../page-navigation/embedded-navigation.service";
import {keyHandlingElements} from "../page-navigation/page-navigation.component";

interface SearchOptionDefinition {
  key: keyof SearchOptions;
  label: string;
  // has no effect on the plain text search of the raw view
  entityOnly: boolean;
}

@Component({
  selector: 'app-hypermedia-control',
  templateUrl: './hypermedia-control.component.html',
  styleUrls: ['./hypermedia-control.component.scss'],
  standalone: false
})
export class HypermediaControlComponent implements OnInit, OnDestroy {
  private hypermediaClient = inject(HypermediaClientService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);
  protected search = inject(EntitySearchService);
  private settingsService = inject(SettingsService);
  private embeddedNavigation = inject(EmbeddedNavigationService);
  private searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');
  private store = inject<Store<{
    appSettings: AppSettings;
    appConfig: AppConfig;
    currentEntryPoint: CurrentEntryPoint;
}>>(Store);

  private onExitEventSubscription: Subscription;

  public rawResponse: object | null = null;
  public contentType: string | undefined = undefined;
  public hto: SirenClientObject = new SirenClientObject();
  public navPaths: string[] = [];
  public isBusy: boolean = false;
  public CurrentHost: string = "";
  public CurrentEntryPoint: string = "";
  public readonly MediaTypes = MediaTypes;
  GeneralSettings: GeneralSettings = new GeneralSettings();
  showSettingsIcon: boolean = true;
  userName: string | undefined = "";
  allowOnlyConfiguredEntryPoints: boolean = true
  IsInsecureConnection: boolean = false;
  title: string = "";
  public showRaw: boolean = false;
  // the user's own settings, unlike GeneralSettings not narrowed by the app config
  private userGeneralSettings: GeneralSettings = new GeneralSettings();

  protected readonly searchScopeOptions: SearchOptionDefinition[] = [
    { key: 'propertyValues', label: 'Property values', entityOnly: true },
    { key: 'propertyNames', label: 'Property names', entityOnly: true },
    { key: 'titles', label: 'Titles & classes', entityOnly: true },
    { key: 'linkRelations', label: 'Link relations', entityOnly: true },
    { key: 'embeddedRelations', label: 'Embedded entity relations', entityOnly: true },
    { key: 'actions', label: 'Actions', entityOnly: true },
  ];
  protected readonly searchModifierOptions: SearchOptionDefinition[] = [
    { key: 'caseSensitive', label: 'Case sensitive', entityOnly: false },
    { key: 'regex', label: 'Regular expression', entityOnly: false },
  ];

  constructor() {
    const router = this.router;
    const globalNavigationEvents = inject(GlobalNavigationEvents);
    const store = this.store;

    store
      .select(selectEffectiveGeneralSettings)
      .subscribe({
        next: generalSettings => {
          this.GeneralSettings = generalSettings;
          this.search.showClasses.set(generalSettings.showClasses);
          this.search.setOptions(generalSettings.searchOptions);
          this.updateSearchMode();
          this.updateEmbeddedNavigation();
        },
      });
    store
      .select(state => state.appSettings.generalSettings)
      .subscribe({
        next: generalSettings => this.userGeneralSettings = generalSettings,
      });
    store
      .select(state => state.appConfig)
      .subscribe({
        next: appConfig => {
          this.showSettingsIcon = !appConfig.disableDeveloperControls;
          this.allowOnlyConfiguredEntryPoints = !appConfig.onlyAllowConfiguredEntryPoints;
        }
      });
    store
      .select(state => state.currentEntryPoint)
      .subscribe({
        next: entryPoint => {
          this.title = entryPoint.title ?? "Hypermedia UI";
        }
      });

    this.authService.userName$
      .subscribe({
        next: user => {
          this.userName = user;
        }
      });

    this.onExitEventSubscription = globalNavigationEvents.onExitApi.subscribe({
      next: _ => this.exitApi(),
    });

    combineLatest(
      [
        store.select(state => state.appConfig),
        store.select(state => state.currentEntryPoint),
      ])
      .subscribe({
        next: tuple => {
          const [appConfig, currentEntryPoint] = tuple;
          if (appConfig.onlyAllowConfiguredEntryPoints && (currentEntryPoint.path === undefined || currentEntryPoint.path === 'hui')) {
            router.navigate(['']);
          }
        }
      });
  }

  ngOnInit() {
    this.hypermediaClient.getHypermediaObjectStream().subscribe((hto) => {
      this.hto = hto;
      this.search.setEntity(hto);
      this.embeddedNavigation.reset();
      this.updateEmbeddedNavigation();
    });

    this.hypermediaClient.getHypermediaObjectRawStream().subscribe((rawResponse) => {
      this.rawResponse = rawResponse;
      this.search.setRawObject(rawResponse);
    });

    this.hypermediaClient.getContentTypeStream().subscribe((contentType) => {
      this.contentType = contentType;
      this.updateEmbeddedNavigation();
    });

    this.hypermediaClient.getNavPathsStream().subscribe((navPaths) => {
      this.navPaths = navPaths;
      this.SetHostInfo(navPaths);
    });
    this.hypermediaClient.isBusy$.subscribe(isBusy => {
      this.isBusy = isBusy;
    });

    this.route.queryParams.subscribe(params => {
      const apiPath = new ApiPath();
      apiPath.initFromRouterParams(params);

      if (!this.hypermediaClient.currentApiPath.isEqual(apiPath)) {
        this.hypermediaClient.NavigateToApiPath(apiPath);
      }
    });
  }

  ngOnDestroy() {
    this.onExitEventSubscription.unsubscribe();
  }

  private SetHostInfo(navPaths: string[]) {
    if (!navPaths || navPaths.length < 1) {
      this.CurrentHost = '';
      this.CurrentEntryPoint = '';
      this.IsInsecureConnection = false;
      return;
    }

    this.CurrentEntryPoint = navPaths[0];
    const url = new URL(this.CurrentEntryPoint);
    this.CurrentHost = url.host;
    if (url.protocol === "http:") {
      this.IsInsecureConnection = true;
    } else {
      this.IsInsecureConnection = false;
    }
  }

  public getUrlShortName(url: string): string {
    const index = url.lastIndexOf('/');
    if (index === -1) {
      return url;
    }

    const lastSegment = url.substring(index + 1);
    const queryStartIndex = lastSegment.indexOf('?');

    let shortName: string;
    if (queryStartIndex !== -1) {
      shortName = lastSegment.substring(0, queryStartIndex);
    } else {
      shortName = lastSegment;
    }

    const decoded = decodeURIComponent(shortName);
    return decoded;
  }

  public getBrowserUrl(url: string) {
    return this.hypermediaClient.getBrowserUrl(url);
  }

  public navigateLink(url: string) {
    this.hypermediaClient.Navigate(url);
  }

  /**
   * A clicked toggle would keep the focus and handle the arrow keys itself, so the page shortcuts
   * would not work until the user clicks into the page. Toggles used by keyboard (detail 0) keep it.
   */
  public releaseToggleFocus(event: MouseEvent) {
    if (event.detail > 0 && document.activeElement instanceof HTMLElement) document.activeElement.blur();
  }

  /**
   * Jumping to a hit leaves the search box, so the page navigation keys continue from the hit.
   * All other keys, e.g. Home and End, keep editing the query.
   */
  public onSearchKeydown(event: KeyboardEvent) {
    if (event.ctrlKey || event.altKey || event.metaKey) return;
    switch (event.key) {
      case 'Enter':
        if (event.shiftKey) this.search.previous(); else this.search.next();
        break;
      case 'PageDown':
        this.search.next();
        break;
      case 'PageUp':
        this.search.previous();
        break;
      case 'Escape':
        this.searchInput()?.nativeElement.blur();
        event.preventDefault();
        return;
      default:
        return;
    }
    event.preventDefault();
    // stay in the box while there is nothing to jump to, e.g. to fix the query
    if (this.search.hits().length > 0) this.searchInput()?.nativeElement.blur();
  }

  @HostListener('document:keydown', ['$event'])
  public onDocumentKeydown(event: KeyboardEvent) {
    if (!this.isSearchAvailable) return;
    if (event.defaultPrevented || event.ctrlKey || event.altKey || event.metaKey) return;
    if (event.target instanceof Element && event.target.closest(keyHandlingElements)) return;
    // / needs Shift on some layouts, e.g. German
    if (event.shiftKey && event.key !== '/') return;
    switch (event.key) {
      case '/':
        this.searchInput()?.nativeElement.focus();
        this.searchInput()?.nativeElement.select();
        break;
      // without an active search the browser scrolls by a page as usual
      case 'PageDown':
        if (!this.search.isActive()) return;
        this.search.next();
        break;
      case 'PageUp':
        if (!this.search.isActive()) return;
        this.search.previous();
        break;
      default:
        return;
    }
    event.preventDefault();
  }

  public setShowRaw(showRaw: boolean) {
    this.showRaw = showRaw;
    this.updateSearchMode();
    this.updateEmbeddedNavigation();
  }

  private updateEmbeddedNavigation() {
    const isEntityViewShown = !(this.GeneralSettings.showRawTab && this.showRaw)
      && (!this.contentType || this.contentType.toLowerCase() === MediaTypes.Siren.toLowerCase());
    const itemCount = isEntityViewShown
      ? this.hto.embeddedEntities.length + this.hto.embeddedLinkEntities.length
      : 0;
    this.embeddedNavigation.setItemCount(itemCount);
  }

  private updateSearchMode() {
    this.search.rawMode.set(this.GeneralSettings.showRawTab && this.showRaw);
  }

  public get isSearchAvailable(): boolean {
    if (!this.GeneralSettings.showSearch) return false;
    if (this.GeneralSettings.showRawTab && this.showRaw) return true;
    return !this.contentType || this.contentType.toLowerCase() === MediaTypes.Siren.toLowerCase();
  }

  public setSearchOption(key: keyof SearchOptions, value: boolean) {
    const searchOptions = { ...this.userGeneralSettings.searchOptions, [key]: value };
    this.store.dispatch(updateGeneralAppSettings({
      newGeneralSettings: this.userGeneralSettings.set("searchOptions", searchOptions)
    }));
    this.settingsService.SaveCurrentSettings();
  }

  public async exitApi() {
    if (await this.authService.redirectToLogoutIfSessionSupported(this.CurrentEntryPoint, window.location.origin)) {
      return;
    }

    if (this.allowOnlyConfiguredEntryPoints) {
      this.hypermediaClient.navigateToMainPage();
    } else {
      this.hypermediaClient.navigateToEntryPoint();
    }
  }
}
