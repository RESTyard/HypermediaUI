import { Component, Input, effect, inject, viewChildren } from '@angular/core';
import { MatExpansionPanel } from '@angular/material/expansion';
import { EmbeddedLinkEntity } from '../siren-parser/embedded-link-entity';
import { EmbeddedEntity } from '../siren-parser/embedded-entity';
import { getDisplayTextForRelation } from '../display-text-mapping';
import { getIconForRelation } from '../icon-mapping';
import { HypermediaClientService } from '../hypermedia-client.service';
import { ClipboardService } from 'ngx-clipboard';
import { Store } from '@ngrx/store';
import { AppSettings, GeneralSettings } from 'src/app/settings/app-settings';
import { AppConfig } from 'src/app.config.service';
import { selectEffectiveGeneralSettings } from 'src/app/store/selectors';
import { EntitySearchService } from '../search/entity-search.service';
import {
  embeddedEntityKey,
  embeddedHeaderTarget,
  embeddedLinkEntityTarget,
  rootEntityKey,
} from '../search/entity-search';

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
  @Input() entityKey: string = rootEntityKey;
  generalSettings: GeneralSettings = new GeneralSettings();

  protected search = inject(EntitySearchService);
  protected readonly embeddedEntityKey = embeddedEntityKey;
  protected readonly embeddedHeaderTarget = embeddedHeaderTarget;
  protected readonly embeddedLinkEntityTarget = embeddedLinkEntityTarget;

  private readonly panels = viewChildren(MatExpansionPanel);

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

      // Only ever opens panels: collapsing is left to the user, also when the search is cleared
      effect(() => {
        this.panels().forEach((panel, index) => {
          if (this.search.containsHit(embeddedEntityKey(this.entityKey, index))) {
            panel.open();
          }
        });
      });
    }

  expandAll() {
    this.panels().forEach(panel => panel.open());
  }

  collapseAll() {
    this.panels().forEach(panel => panel.close());
  }

  navigateHref(href: string) {
    this.hypermediaClient.Navigate(href);
  }

  copyToClipBoard(href: string) {
    this.clipboardService.copyFromContent(href);
  }

  getRelationDisplayText(rel: string): string {
    return getDisplayTextForRelation(rel);
  }

  getRelationIcon(rel: string): string | undefined {
    return getIconForRelation(rel);
  }
}
