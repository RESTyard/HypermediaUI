import { Component, OnInit, Input, OnChanges } from '@angular/core';
import {ContentTypes, HypermediaAction} from '../siren-parser/hypermedia-action';

@Component({
  selector: 'app-actions-view',
  templateUrl: './actions-view.component.html',
  styleUrls: ['./actions-view.component.scss']
})
export class ActionsViewComponent implements OnInit {
  @Input() actions: HypermediaAction[] = [];

  constructor() { }

  ngOnInit() {
  }

  protected readonly ContentTypes = ContentTypes;
}
