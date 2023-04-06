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
  @Input()
  action!: HypermediaAction;

  ActionResultsEnum = ActionResults;

  actionResult: ActionResults = ActionResults.undefined;
  actionResultLocation: string | null = null;
  actionMessage: string = "";
  executed: boolean = false; // TODO show multiple executions as list
  problemDetailsError: ProblemDetailsError| null = null

  constructor(private hypermediaClientService: HypermediaClientService) { }

  ngOnInit() {
    // This is a workaround if we do not find a built-in way to configure json-schema-form to allow empty array as default value
    let defaultValues:any = this.action.defaultValues;
    if (defaultValues) {
      this.RemoveEmptyArraysFromDefaults(defaultValues);
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

        // todo handle if it has content AND location
        this.actionResultLocation = resultLocation;
      });
  }

  navigateLocation(location: string) {
    this.hypermediaClientService.Navigate(location);
  }

  private RemoveEmptyArraysFromDefaults(objectToClean: any, nestingCounter = 0) {
    if (objectToClean === null) {
      return;
    }

    if (nestingCounter == 50) {
      throw new Error("Cleaning up default values went too deep. Object most probably contains a loop.")
    }

    for (let key in objectToClean) {
      let value = objectToClean[key];

      if (Array.isArray(value) && value.length == 0) {
        delete objectToClean[key];
      }

      if (typeof value === 'object') {
        this.RemoveEmptyArraysFromDefaults(value, nestingCounter + 1);
      }
    }
  }
}
