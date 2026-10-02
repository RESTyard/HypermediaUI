import { Component, computed, inject, input } from '@angular/core';
import { EntitySearchService } from './entity-search.service';
import { SearchField } from './entity-search';
import { splitByRanges, TextSegment } from './search-matcher';

/** Renders a text and marks the search matches in it, if the field is a search hit. */
@Component({
  selector: 'app-search-highlight',
  template: `@for (segment of segments(); track $index) {@if (segment.isMatch) {<mark class="search-mark" [class.current]="isCurrent()">{{segment.text}}</mark>} @else {<ng-container>{{segment.text}}</ng-container>}}`,
  styles: `
    .search-mark { background-color: #fff176; color: inherit; padding: 0; border-radius: 2px; }
    .search-mark.current { background-color: #ff9800; }
  `,
  standalone: false
})
export class SearchHighlightComponent {
  private search = inject(EntitySearchService);

  readonly text = input<string | number | null | undefined>('');
  readonly target = input.required<string>();
  readonly field = input.required<SearchField>();

  readonly isCurrent = computed(() => this.search.isCurrentField(this.target(), this.field()));

  readonly segments = computed<TextSegment[]>(() => {
    const text = this.text() == null ? '' : String(this.text());
    if (!this.search.isHitField(this.target(), this.field())) {
      return [{ text, isMatch: false }];
    }
    // A relation can match via its raw name while showing its mapped display text: then nothing is marked here
    return splitByRanges(text, this.search.matchRanges(text));
  });
}
