import { Component, inject, Input } from '@angular/core';
import {ActionType, HypermediaAction} from '../siren-parser/hypermedia-action';
import {actionTarget, rootEntityKey} from '../search/entity-search';
import {EntitySearchService} from '../search/entity-search.service';

@Component({
    selector: 'app-actions-view',
    templateUrl: './actions-view.component.html',
    styleUrls: ['./actions-view.component.scss'],
    standalone: false
})
export class ActionsViewComponent {
  protected search = inject(EntitySearchService);

  @Input() actions: HypermediaAction[] = [];
  @Input() entityKey: string = rootEntityKey;
  protected readonly actionTarget = actionTarget;

  protected readonly ActionType = ActionType;
}
