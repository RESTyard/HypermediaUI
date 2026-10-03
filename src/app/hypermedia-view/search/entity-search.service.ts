import { computed, Injectable, linkedSignal, signal } from '@angular/core';
import { ISirenClientObject } from '../siren-parser/entity-interfaces';
import { SirenClientObject } from '../siren-parser/siren-client-object';
import {
  collectEntityHits,
  defaultSearchOptions,
  entityKeyWithAncestors,
  rawTarget,
  SearchField,
  SearchHit,
  SearchOptions,
} from './entity-search';
import { createMatcher, MatchRange, splitByRanges, TextSegment } from './search-matcher';

export interface RawSegment extends TextSegment {
  target?: string;
}

/**
 * Search over the currently displayed entity (or its raw JSON). Runs on the model rather than on
 * the rendered views, because embedded entity panels render their content lazily.
 */
@Injectable({ providedIn: 'root' })
export class EntitySearchService {
  static readonly debounceMs = 150;

  /** The text as typed; `query` follows it after the debounce. */
  readonly inputText = signal('');
  readonly query = signal('');
  readonly options = signal<SearchOptions>(defaultSearchOptions);
  readonly rawMode = signal(false);
  readonly showClasses = signal(false);

  private readonly entity = signal<ISirenClientObject>(new SirenClientObject());
  private readonly rawObject = signal<unknown>(null);
  private debounceHandle: ReturnType<typeof setTimeout> | undefined;

  private readonly matcher = computed(() =>
    createMatcher(this.query(), this.options().caseSensitive, this.options().regex));

  readonly queryError = computed(() => {
    const matcher = this.matcher();
    return matcher.kind === 'invalid' ? matcher.error : undefined;
  });

  private readonly rawText = computed(() => {
    const raw = this.rawObject();
    return raw === null || raw === undefined ? '' : JSON.stringify(raw, null, 2);
  });

  private readonly rawRanges = computed<MatchRange[]>(() => {
    const matcher = this.matcher();
    return matcher.kind === 'valid' && this.rawMode() ? matcher.match(this.rawText()) : [];
  });

  readonly hits = computed<SearchHit[]>(() => {
    const matcher = this.matcher();
    if (matcher.kind !== 'valid') return [];
    if (this.rawMode()) {
      return this.rawRanges().map((_, index) => ({ target: rawTarget(index), field: 'raw', entityKey: '' }));
    }
    return collectEntityHits(this.entity(), this.options(), matcher.match, { showClasses: this.showClasses() });
  });

  readonly currentIndex = linkedSignal<SearchHit[], number>({
    source: this.hits,
    computation: hits => hits.length > 0 ? 0 : -1,
  });

  readonly currentHit = computed<SearchHit | undefined>(() => this.hits()[this.currentIndex()]);

  readonly isActive = computed(() => this.matcher().kind === 'valid');

  /** Raw JSON split into plain and matching segments; undefined when there is nothing to highlight. */
  readonly rawSegments = computed<RawSegment[] | undefined>(() => {
    if (!this.isActive() || !this.rawMode()) return undefined;
    let matchIndex = 0;
    return splitByRanges(this.rawText(), this.rawRanges())
      .map(segment => segment.isMatch ? { ...segment, target: rawTarget(matchIndex++) } : segment);
  });

  private readonly hitFields = computed(() => new Set(this.hits().map(hit => fieldKey(hit.target, hit.field))));
  private readonly hitTargets = computed(() => new Set(this.hits().map(hit => hit.target)));
  private readonly entitiesWithHits = computed(() =>
    new Set(this.hits().filter(hit => hit.entityKey).flatMap(hit => entityKeyWithAncestors(hit.entityKey))));

  setEntity(entity: ISirenClientObject) {
    this.entity.set(entity);
  }

  setRawObject(rawObject: unknown) {
    this.rawObject.set(rawObject);
  }

  setInputText(text: string) {
    this.inputText.set(text);
    clearTimeout(this.debounceHandle);
    this.debounceHandle = setTimeout(() => this.commitQuery(), EntitySearchService.debounceMs);
  }

  setOptions(options: SearchOptions) {
    const current = this.options();
    if ((Object.keys(options) as (keyof SearchOptions)[]).every(key => options[key] === current[key])) return;
    this.options.set(options);
    this.revealCurrent();
  }

  clear() {
    clearTimeout(this.debounceHandle);
    this.debounceHandle = undefined;
    this.inputText.set('');
    this.query.set('');
  }

  next() {
    this.step(1);
  }

  previous() {
    this.step(-1);
  }

  isHitTarget(target: string): boolean {
    return this.hitTargets().has(target);
  }

  isHitField(target: string, field: SearchField): boolean {
    return this.hitFields().has(fieldKey(target, field));
  }

  isCurrentTarget(target: string): boolean {
    return this.currentHit()?.target === target;
  }

  isCurrentField(target: string, field: SearchField): boolean {
    const current = this.currentHit();
    return current?.target === target && current.field === field;
  }

  /** True if the entity or one of its embedded descendants renders a hit in its content area. */
  containsHit(entityKey: string): boolean {
    return this.entitiesWithHits().has(entityKey);
  }

  matchRanges(text: string): MatchRange[] {
    const matcher = this.matcher();
    return matcher.kind === 'valid' ? matcher.match(text) : [];
  }

  private step(direction: 1 | -1) {
    // Enter right after typing should go to the first hit of the new query, not past it
    if (this.debounceHandle !== undefined) {
      this.commitQuery();
      return;
    }
    const count = this.hits().length;
    if (count === 0) return;
    this.currentIndex.update(index => (index + direction + count) % count);
    this.revealCurrent();
  }

  private commitQuery() {
    clearTimeout(this.debounceHandle);
    this.debounceHandle = undefined;
    this.query.set(this.inputText().trim());
    this.revealCurrent();
  }

  /**
   * Scrolls the current hit into view. Expanding its embedded entities renders their content
   * asynchronously (lazy panel content, expand animation), so retry for a few frames.
   */
  private revealCurrent(remainingFrames = 30) {
    const hit = this.currentHit();
    if (!hit) return;
    requestAnimationFrame(() => {
      if (this.currentHit() !== hit) return;
      const element = document.querySelector(`[data-search-target="${CSS.escape(hit.target)}"]`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (remainingFrames > 0) {
        this.revealCurrent(remainingFrames - 1);
      }
    });
  }
}

function fieldKey(target: string, field: SearchField): string {
  return `${target}#${field}`;
}
