import { HypermediaClientService } from '../hypermedia-client.service';
import { Component, Input, inject } from '@angular/core';
import { HypermediaLink } from '../siren-parser/hypermedia-link';
import { getDisplayTextForRelation } from '../display-text-mapping';
import { getIconForRelation } from '../icon-mapping';
import { getIconForMimeType } from '../mime-type-icon-mapping';
import { ClipboardService } from 'ngx-clipboard';
import {MediaTypes} from "../MediaTypes";
import { ApiPath } from '../api-path';
import {Store} from "@ngrx/store";
import {AppSettings, GeneralSettings} from "../../settings/app-settings";
import {AppConfig} from "../../../app.config.service";
import {selectEffectiveGeneralSettings} from "../../store/selectors";

@Component({
    selector: 'app-link-view',
    templateUrl: './link-view.component.html',
    styleUrls: ['./link-view.component.scss'],
    standalone: false
})
export class LinkViewComponent {
  private hypermediaClient = inject(HypermediaClientService);
  private clipboardService = inject(ClipboardService);
  private store = inject<Store<{
    appSettings: AppSettings;
    appConfig: AppConfig;
  }>>(Store);

  @Input() links: HypermediaLink[] = [];
  protected readonly getIconForMimeType = getIconForMimeType;
  protected readonly MediaTypes = MediaTypes;

  generalSettings: GeneralSettings = new GeneralSettings();

  constructor() {
    this.store
      .select(selectEffectiveGeneralSettings)
      .subscribe({
        next: generalSettings => {
          this.generalSettings = generalSettings;
        },
      });
  }

  getBrowserUrl(hypermediaLink: HypermediaLink) {
    const apiPath = this.hypermediaClient.currentApiPath;
    // We need to simulate the navigation for the URL generation
    // Create a temporary ApiPath to not affect the current state
    const tempPath = new ApiPath(apiPath.fullPath);
    tempPath.setCurrentStep(hypermediaLink.url);
    return this.hypermediaClient.buildBrowserUrl(undefined, tempPath);
  }

  navigateLink(hypermediaLink: HypermediaLink) {
    this.hypermediaClient.Navigate(hypermediaLink.url, { acceptType: hypermediaLink.type });
  }

  getRelationDisplayText(rel: string[]): string[] {
    return rel.map(getDisplayTextForRelation);
  }

  getRelationIcon(rels: string[]): string | undefined {
    if (!rels) return undefined;
    for (const rel of rels) {
      const icon = getIconForRelation(rel);
      if (icon) return icon;
    }
    return undefined;
  }

  copyToClipBoard(hypermediaLink: HypermediaLink) {
    this.clipboardService.copyFromContent(hypermediaLink.url);
  }

  // Styling/UX hint only:
  // Determines if a link is Siren. Unknown/empty type is treated as Siren (assumed Siren).
  isSirenLink(link: HypermediaLink | undefined): boolean {
    const type = (link?.type ?? '').trim();
    if (!type) return true; // unknown -> assume Siren
    return type.toLowerCase() === MediaTypes.Siren.toLowerCase();
  }

  download(hypermediaLink: HypermediaLink) {
    this.hypermediaClient.DownloadAsFile(hypermediaLink.url);
  }
}
