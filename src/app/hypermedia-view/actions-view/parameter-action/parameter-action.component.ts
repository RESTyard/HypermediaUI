import { Component, OnInit, Input } from '@angular/core';
import { ActionResults, HypermediaClientService } from '../../hypermedia-client.service';
import { HypermediaAction } from '../../siren-parser/hypermedia-action';

@Component({
  selector: 'app-parameter-action',
  templateUrl: './parameter-action.component.html',
  styleUrls: ['./parameter-action.component.scss']
})
export class ParameterActionComponent implements OnInit {
  @Input() action: HypermediaAction;

  ActionResultsEnum = ActionResults;

  actionResult: ActionResults;
  actionResultLocation: string | null = null;
  actionMessage: string = "";
  executed: boolean = false; // TODO show multiple executions as list

  constructor(private hypermediaClientService: HypermediaClientService) { }

  ngOnInit() {
  }

  public onActionSubmitted(formParameters: any) {
    this.action.parameters = formParameters;

    this.hypermediaClientService.executeAction(this.action,
      (result: ActionResults,
        resultLocation: string | null,
        content: string,
        statusCodeMessage: string) => {

        this.actionResult = result;

        if (statusCodeMessage) {
          this.actionMessage = statusCodeMessage;
        } else {
          this.actionMessage = '';
        }

        // todo handle if has content AND location
        this.actionResultLocation = resultLocation;
        this.executed = true;
      });
  }

  navigateLocation(location: string) {
    this.hypermediaClientService.Navigate(location);
  }
}
