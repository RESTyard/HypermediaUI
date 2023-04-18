import {Component} from '@angular/core';
import {FieldArrayType} from '@ngx-formly/core';
import {style} from '@angular/animations';

@Component({selector: 'formly-array-type',
  template: `
    <div>
      <mat-card style="margin: 10px 0 0 0" appearance="raised">
        <div class="row">
          <mat-card-header>
            <legend *ngIf="props.label">{{ props.label }}</legend>
          </mat-card-header>
          <mat-card-actions>
            <div style="margin-bottom: 3px;">
              <button type="button" (click)="add()" mat-flat-button>
                <mat-icon id="addHeaderButton">add</mat-icon>
              </button>
            </div>
          </mat-card-actions>
          <mat-card-header>
            <p *ngIf="props.description">{{ props.description }}</p>
          </mat-card-header>
        </div>

        <div role="alert" *ngIf="showError && formControl.errors">
          <formly-validation-message [field]="field"></formly-validation-message>
        </div>

        <mat-card-content *ngIf="field.fieldGroup.length != 0">
          <div *ngFor="let field of field.fieldGroup; let i = index" class="row">
            <div class="col-24">
              <formly-field [field]="field"></formly-field>
            </div>
            <div class="delete-button" *ngIf="field.props['removable'] !== false">
              <button type="button" (click)="remove(i)" mat-flat-button>
                <mat-icon fontSet="material-icons-outlined">delete</mat-icon>
              </button>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>`,
  styleUrls: ['./array-type.scss']
})
export class ArrayTypeComponent extends FieldArrayType {

}
