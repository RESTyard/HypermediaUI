import { HypermediaClientService, ActionResults } from '../../hypermedia-client.service';
import { Component, OnInit, Input } from '@angular/core';
import { HypermediaAction } from '../../siren-parser/hypermedia-action';
import { ProblemDetailsError } from 'src/app/error-dialog/problem-details-error';

@Component({
  selector: 'app-parameterless-action-view',
  templateUrl: './parameterless-action-view.component.html',
  styleUrls: ['./parameterless-action-view.component.scss']
})
export class ParameterlessActionViewComponent implements OnInit {
  @Input() action: HypermediaAction;

  ActionResultsEnum = ActionResults;

  actionResult: ActionResults | null = null;
  actionResultLocation: string | null = null;
  actionMessage: string = "";  // TODO: Needs to be updated
  executed: boolean = false; // TODO show multiple executions as list
  problemDetailsError: ProblemDetailsError| null = null

  constructor(private hypermediaClientService: HypermediaClientService) { }

  ngOnInit() {
  }

  public executeAction() {
    this.hypermediaClientService.executeAction(this.action,
      (actionResults: ActionResults,
        resultLocation: string | null,
        content: any,
        problemDetailsError: ProblemDetailsError) => {
          
        this.problemDetailsError = problemDetailsError;
        this.actionResult = actionResults;
        
        if (problemDetailsError) {
          this.actionMessage = problemDetailsError.title;
        } else {
          this.actionMessage = '';
        }

        this.actionResultLocation = resultLocation;
        this.executed = true;
      });
  }

  navigateLocation(location: string) {
    this.hypermediaClientService.Navigate(location);
  }

}
