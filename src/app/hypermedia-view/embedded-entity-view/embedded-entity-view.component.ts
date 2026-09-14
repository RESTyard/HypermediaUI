import { Component, Input, inject } from '@angular/core';
import { EmbeddedLinkEntity } from '../siren-parser/embedded-link-entity';
import { EmbeddedEntity } from '../siren-parser/embedded-entity';
import { getIconForRelation } from '../icon-mapping';
import { HypermediaClientService } from '../hypermedia-client.service';
import { ClipboardService } from 'ngx-clipboard';
import { Store } from '@ngrx/store';
import { AppSettings, GeneralSettings } from 'src/app/settings/app-settings';
import { AppConfig } from 'src/app.config.service';
import { selectEffectiveGeneralSettings } from 'src/app/store/selectors';

@Component({
    selector: 'app-embedded-entity-view',
    templateUrl: './embedded-entity-view.component.html',
    styleUrls: ['./embedded-entity-view.component.scss'],
    standalone: false
})
export class EmbeddedEntityViewComponent {
  private hypermediaClient = inject(HypermediaClientService);
  private clipboardService = inject(ClipboardService);

  @Input() embeddedLinkEntities: EmbeddedLinkEntity[] = [];
  @Input() embeddedEntities: EmbeddedEntity[] = [];
  generalSettings: GeneralSettings = new GeneralSettings();

  constructor() {
      const store = inject<Store<{
    appSettings: AppSettings;
    appConfig: AppConfig;
}>>(Store);

      store
        .select(selectEffectiveGeneralSettings)
        .subscribe({
          next: generalSettings => this.generalSettings = generalSettings,
        });
    }

  navigateHref(href: string) {
    this.hypermediaClient.Navigate(href);
  }

  copyToClipBoard(href: string) {
    this.clipboardService.copyFromContent(href);
  }

  getRelationIcon(rel: string): string | undefined {
    return getIconForRelation(rel);
  }
}
