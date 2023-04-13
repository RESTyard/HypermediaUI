import {Component} from '@angular/core';
import {FieldArrayType} from '@ngx-formly/core';

@Component({selector: 'formly-array-type',
  template: `
    <div style="margin: 0 0 20px 0;">
      <legend *ngIf="props.label">{{ props.label }}</legend>
      <p *ngIf="props.description">{{ props.description }}</p>
      <div class="d-flex flex-row-reverse">
        <button mat-button type="button" (click)="add()">Add</button>
      </div>
      <div class="alert alert-danger" role="alert" *ngIf="showError && formControl.errors">
        <formly-validation-message [field]="field"></formly-validation-message>
      </div>
      <div *ngFor="let field of field.fieldGroup; let i = index" class="row align-items-start">
        <mat-grid-list cols="12" rowHeight="50px">
          <mat-grid-tile colspan="11">
            <formly-field style="width: 100%" [field]="field"></formly-field>
          </mat-grid-tile>
          <mat-grid-tile colspan="1">
            <div *ngIf="field.props['removable'] !== false" class="col-2 text-right">
              <button mat-button type="button" (click)="remove(i)">Remove</button>
            </div>
          </mat-grid-tile>
        </mat-grid-list>
      </div>
    </div> `,
})
export class ArrayTypeComponent extends FieldArrayType {
}
