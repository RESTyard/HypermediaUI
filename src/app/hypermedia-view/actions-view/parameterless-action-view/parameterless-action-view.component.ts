import { HypermediaClientService, ActionResults } from '../../hypermedia-client.service';
import { Component, OnInit, Input } from '@angular/core';
import { HypermediaAction } from '../../siren-parser/hypermedia-action';

@Component({
  selector: 'app-parameterless-action-view',
  templateUrl: './parameterless-action-view.component.html',
  styleUrls: ['./parameterless-action-view.component.scss']
})
export class ParameterlessActionViewComponent implements OnInit {
  @Input() action: HypermediaAction;

  actionResult: ActionResults;
  actionMessage: string = '';  // TODO: Needs to be updated

  constructor(private hypermediaClientService: HypermediaClientService) { }

  ngOnInit() {
  }

  public executeAction() {
    this.hypermediaClientService.executeParameterlessAction(this.action, (result: ActionResults, message?: string) => {
      this.actionResult = result;
      if (message) {
        this.actionMessage = message;
        console.log(typeof message);
      } else {
        this.actionMessage = '';
      }
    });
  }

}
