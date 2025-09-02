import { Component, OnInit } from '@angular/core';
import { HypermediaClientService } from '../hypermedia-client.service';
import { SirenClientObject } from '../siren-parser/siren-client-object';
import { ActivatedRoute, Router } from '@angular/router';
import { PlatformLocation } from '@angular/common';
import { ApiPath } from '../api-path';
import { SettingsService } from 'src/app/settings/services/settings.service';
import { GeneralSettings } from 'src/app/settings/services/AppSettings';

@Component({
    selector: 'app-hypermedia-control',
    templateUrl: './hypermedia-control.component.html',
    styleUrls: ['./hypermedia-control.component.scss'],
    standalone: false
})
export class HypermediaControlComponent implements OnInit {
  public rawResponse: object | null = null;
  public hto: SirenClientObject| null = null;
  public navPaths: string[] = [];
  public isBusy: boolean = false;
  public CurrentHost: string = "";
  public CurrentEntryPoint: string = "";
  GeneralSettings: GeneralSettings;
  IsInsecureConnection: boolean = false;

  constructor(private hypermediaClient: HypermediaClientService, private route: ActivatedRoute, private router: Router, location: PlatformLocation, public settingsService: SettingsService) {
    this.GeneralSettings = settingsService.CurrentSettings.GeneralSettings
  }

  ngOnInit() {
    this.hypermediaClient.getHypermediaObjectStream().subscribe((hto) => {
      this.hto = hto;
    });

    this.hypermediaClient.getHypermediaObjectRawStream().subscribe((rawResponse) => {
      this.rawResponse = rawResponse;
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

  private SetHostInfo(navPaths: string[]) {
    if (!navPaths || navPaths.length < 1) {
      this.CurrentHost = '';
      this.CurrentEntryPoint = '';
      this.IsInsecureConnection = false;
      return;
    }

    this.CurrentEntryPoint = navPaths[0];
    let url = new URL(this.CurrentEntryPoint);
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

  public navigateLink(url: string) {
    this.hypermediaClient.Navigate(url);
  }

  public navigateMainPage() {
    this.hypermediaClient.navigateToMainPage();
  }
}
