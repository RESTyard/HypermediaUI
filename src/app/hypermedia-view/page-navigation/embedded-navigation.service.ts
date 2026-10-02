import { Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';

/** Which top level embedded entity (or embedded link) the page navigation points at. */
@Injectable({ providedIn: 'root' })
export class EmbeddedNavigationService {
  static readonly itemAttribute = 'data-embedded-nav-index';

  /** Number of top level embedded items, 0 when the entity view is not shown. */
  readonly itemCount = signal(0);
  /** -1 until the user navigated to an item. */
  readonly currentIndex = signal(-1);
  /** Index of the item whose panel should be expanded or collapsed. */
  readonly toggleRequests = new Subject<number>();
  /** true expands, false collapses all top level embedded entities. */
  readonly expandAllRequests = new Subject<boolean>();

  /** Keeps the current item, unless it no longer exists. */
  setItemCount(itemCount: number) {
    this.itemCount.set(itemCount);
    if (this.currentIndex() >= itemCount) this.currentIndex.set(-1);
  }

  reset() {
    this.currentIndex.set(-1);
  }

  select(index: number) {
    this.currentIndex.set(index);
  }

  toggleCurrent() {
    if (this.currentIndex() >= 0) this.toggleRequests.next(this.currentIndex());
  }

  expandAll() {
    this.expandAllRequests.next(true);
  }

  collapseAll() {
    this.expandAllRequests.next(false);
  }

  canGoPrevious(): boolean {
    return this.currentIndex() > 0;
  }

  canGoNext(): boolean {
    return this.currentIndex() < this.itemCount() - 1;
  }

  previous() {
    if (this.canGoPrevious()) this.goTo(this.currentIndex() - 1);
  }

  next() {
    if (this.canGoNext()) this.goTo(this.currentIndex() + 1);
  }

  toTop() {
    this.currentIndex.set(this.itemCount() > 0 ? 0 : -1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  toBottom() {
    this.currentIndex.set(this.itemCount() - 1);
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
  }

  private goTo(index: number) {
    this.currentIndex.set(index);
    document
      .querySelector(`[${EmbeddedNavigationService.itemAttribute}="${index}"]`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
