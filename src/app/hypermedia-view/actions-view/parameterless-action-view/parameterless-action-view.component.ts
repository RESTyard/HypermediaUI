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
    this.hypermediaClientService.executeAction(this.action,
      (actionResults: ActionResults,
        resultLocation: string | null,
        content: any,
        statusCodeString: string) => {
        this.actionResult = actionResults;
        if (statusCodeString) {
          this.actionMessage = statusCodeString;
          console.log(typeof statusCodeString);
        } else {
          this.actionMessage = '';
        }
      });
  }

}
