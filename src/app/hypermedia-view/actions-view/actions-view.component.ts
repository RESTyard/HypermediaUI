import { Component, Input } from '@angular/core';
import {ActionType, HypermediaAction} from '../siren-parser/hypermedia-action';

@Component({
    selector: 'app-actions-view',
    templateUrl: './actions-view.component.html',
    styleUrls: ['./actions-view.component.scss'],
    standalone: false
})
export class ActionsViewComponent {
  @Input() actions: HypermediaAction[] = [];

  protected readonly ActionType = ActionType;
}
