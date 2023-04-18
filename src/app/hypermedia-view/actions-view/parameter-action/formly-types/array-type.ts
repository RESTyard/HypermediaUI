import {Component} from '@angular/core';
import {FieldArrayType} from '@ngx-formly/core';
import {style} from '@angular/animations';

@Component({selector: 'formly-array-type',
  template: `
    <div style="margin: 0 0 20px 0;">
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
      <div *ngFor="let field of field.fieldGroup; let i = index" class="row align-items-start">
        <mat-grid-list cols="12" rowHeight="50px">
          <mat-grid-tile colspan="11">
            <formly-field style="width: 100%" [field]="field"></formly-field>
          </mat-grid-tile>
          <mat-grid-tile colspan="1">
            <div *ngIf="field.props['removable'] !== false" class="col-2 text-right">
              <button type="button" (click)="remove(i)" mat-flat-button>
                <mat-icon class="deleteHeader" fontSet="material-icons-outlined">delete</mat-icon>
              </button>
            </div>
          </mat-grid-tile>
        </mat-grid-list>
      </div>
    </div> `
})
export class ArrayTypeComponent extends FieldArrayType {
  protected readonly style = style;
}
