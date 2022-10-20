import { Component, OnInit, Input } from '@angular/core';
import {  ActionResults, HypermediaClientService } from '../../hypermedia-client.service';
import { HypermediaAction } from '../../siren-parser/hypermedia-action';

@Component({
  selector: 'app-parameter-action',
  templateUrl: './parameter-action.component.html',
  styleUrls: ['./parameter-action.component.scss']
})
export class ParameterActionComponent implements OnInit {
  @Input() action: HypermediaAction;

  actionResult: ActionResults;
  actionMessage: string;
  actionResultLocation: string = null;
  actionResultBody: string;

  constructor(private hypermediaClientService: HypermediaClientService) { }

  ngOnInit() {
  }

  public onActionSubmitted(formParameters: any) {
    this.action.parameters = formParameters;

    this.hypermediaClientService.executeAction(this.action, (result: ActionResults, resultLocation: string, content: string, message?: string) => {
      this.actionResult = result;

      if (message) {
        this.actionMessage = message;
      } else {
        this.actionMessage = '';
      }

      // todo handle if has content AND location
      this.actionResultLocation = resultLocation;
      this.actionResultBody = resultLocation;

    });
  }

  navigateLocation(location: string) {
    this.hypermediaClientService.Navigate(location);
  }
}
