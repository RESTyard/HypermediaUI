import {Component} from '@angular/core';
import {FieldArrayType} from '@ngx-formly/core';
import {style} from '@angular/animations';

@Component({selector: 'formly-array-type',
  template: `
    <div>
      <legend *ngIf="props.label">{{ props.label }}</legend>
      <p *ngIf="props.description">{{ props.description }}</p>
      <div class="d-flex flex-row-reverse" style="margin-bottom: 3px;">
        <button type="button" (click)="add()" mat-flat-button>
          <mat-icon id="addHeaderButton">add</mat-icon>
        </button>
      </div>
      <div role="alert" *ngIf="showError && formControl.errors">
        <formly-validation-message [field]="field"></formly-validation-message>
      </div>
      <div *ngFor="let field of field.fieldGroup; let i = index" class="form-field-container">
        <div class="col-10">
          <formly-field [field]="field"></formly-field>
        </div>
        <div *ngIf="field.props['removable'] !== false" class="col-2">
          <button type="button" (click)="remove(i)" mat-flat-button>
            <mat-icon class="deleteHeader" fontSet="material-icons-outlined">delete</mat-icon>
          </button>
        </div>
      </div>
    </div>
  <br/>`,
  styleUrls: ['./array-type.scss']
})
export class ArrayTypeComponent extends FieldArrayType {
  protected readonly style = style;
}
