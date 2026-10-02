import { Component, HostListener, inject } from '@angular/core';
import { EmbeddedNavigationService } from './embedded-navigation.service';

// keys are left to elements that use them themselves, e.g. text fields, toggles and the property tree
const keyHandlingElements = [
  'input', 'textarea', 'select', '[contenteditable]:not([contenteditable="false"])',
  '[role="radio"]', '[role="radiogroup"]', '[role="tree"]', '[role="treeitem"]', '[role="menu"]',
  '[role="menuitem"]', '[role="listbox"]', '[role="option"]', '[role="slider"]', '[role="tab"]',
  '[role="switch"]', '.cdk-overlay-container',
].join(',');

const enterHandlingElements = 'button, a, [role="button"], mat-expansion-panel-header';

@Component({
  selector: 'app-page-navigation',
  templateUrl: './page-navigation.component.html',
  styleUrls: ['./page-navigation.component.scss'],
  standalone: false
})
export class PageNavigationComponent {
  protected navigation = inject(EmbeddedNavigationService);

  /**
   * A clicked button would keep the focus, so Enter would press it again instead of toggling the
   * current item. Buttons activated by keyboard (detail 0) keep the focus.
   */
  releaseFocus(event: MouseEvent) {
    if (event.detail > 0) (event.currentTarget as HTMLElement).blur();
  }

  // a click outside every top level embedded item, e.g. on the entity's own properties, clears the current item
  @HostListener('document:pointerdown', ['$event'])
  onPointerdown(event: PointerEvent) {
    if (!(event.target instanceof Element)) return;
    if (event.target.closest(`[${EmbeddedNavigationService.itemAttribute}], app-page-navigation, .cdk-overlay-container`)) return;
    this.navigation.reset();
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent) {
    if (this.navigation.itemCount() === 0) return;
    if (event.defaultPrevented || event.ctrlKey || event.altKey || event.metaKey) return;
    if (event.target instanceof Element && event.target.closest(keyHandlingElements)) return;

    // + needs Shift on some layouts, e.g. US, so only the other keys require no Shift
    if (event.shiftKey && event.key !== '+') return;

    switch (event.key) {
      case '+':
        this.navigation.expandAll();
        break;
      case '-':
        this.navigation.collapseAll();
        break;
      case 'Home':
        this.navigation.toTop();
        break;
      case 'End':
        this.navigation.toBottom();
        break;
      case 'ArrowUp':
        this.navigation.previous();
        break;
      case 'ArrowDown':
        this.navigation.next();
        break;
      case 'Enter':
        // buttons, links and panel headers handle Enter themselves
        if (event.target instanceof Element && event.target.closest(enterHandlingElements)) return;
        this.navigation.toggleCurrent();
        break;
      default:
        return;
    }
    event.preventDefault();
  }
}
