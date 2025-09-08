import { Component, OnInit, Input, OnChanges } from '@angular/core';
import {ActionType, HypermediaAction} from '../siren-parser/hypermedia-action';

@Component({
    selector: 'app-actions-view',
    templateUrl: './actions-view.component.html',
    styleUrls: ['./actions-view.component.scss'],
    standalone: false
})
export class ActionsViewComponent implements OnInit {
  @Input() actions: HypermediaAction[] = [];

  constructor() { }

  ngOnInit() {
  }

  protected readonly ActionType = ActionType;
}
