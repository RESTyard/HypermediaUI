import { Component, OnInit, Input } from '@angular/core';
import { ProblemDetailsError } from 'src/app/error-dialog/problem-details-error';
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
  problemDetailsError: ProblemDetailsError| null = null

  constructor(private hypermediaClientService: HypermediaClientService) { }

  ngOnInit() {
    // This is a workaround if we do not find a built-in way to configure json-schema-form to allow empty array as default value
    for (let key in this.action.defaultValues['Filter']) {
      let value = this.action.defaultValues['Filter'][key];
      if(Array.isArray(value) && value.length == 0){
        delete this.action.defaultValues['Filter'][key];
      }
    }
  }

  public onActionSubmitted(formParameters: any) {
    this.action.parameters = formParameters;
    this.actionResult= ActionResults.pending;
    this.executed = true;

    this.hypermediaClientService.executeAction(this.action,
      (result: ActionResults,
        resultLocation: string | null,
        content: string,
        problemDetailsError: ProblemDetailsError | null) => {

        this.problemDetailsError = problemDetailsError;
        this.actionResult = result;

        if (problemDetailsError) {
          this.actionMessage = problemDetailsError.title;
        } else {
          this.actionMessage = '';
        }

        // todo handle if has content AND location
        this.actionResultLocation = resultLocation;
      });
  }

  navigateLocation(location: string) {
    this.hypermediaClientService.Navigate(location);
  }
}
