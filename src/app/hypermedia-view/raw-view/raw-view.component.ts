import { Component, Input, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ClipboardService } from 'ngx-clipboard';
import { EntitySearchService } from '../search/entity-search.service';
import { EmbeddedNavigationService } from '../page-navigation/embedded-navigation.service';

// opens the root keys and their content, e.g. class and properties, but not deeper levels
const defaultDepth = 2;

@Component({
    selector: 'app-raw-view',
    templateUrl: './raw-view.component.html',
    styleUrls: ['./raw-view.component.scss'],
    standalone: false
})
export class RawViewComponent {
  private clipboardService = inject(ClipboardService);
  protected search = inject(EntitySearchService);

  @Input() rawObject: any;

  expand: boolean = true;
  // -1 opens all levels; the full tree renders slowly for large entities
  depth: number = defaultDepth;

  constructor() {
    inject(EmbeddedNavigationService).expandAllRequests
      .pipe(takeUntilDestroyed())
      .subscribe(expand => expand ? this.onExpand() : this.onCollapse());
  }

  copyToClipBoard() {
    this.clipboardService.copyFromContent(JSON.stringify(this.rawObject, null, 2));
  }

  onExpand() {
    this.expand = true;
    this.depth = -1;
  }

  onDefaultDepth() {
    this.expand = true;
    this.depth = defaultDepth;
  }

  onCollapse() {
    this.expand = false;
  }
}
