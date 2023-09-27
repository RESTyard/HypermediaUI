import { Component, Input } from '@angular/core';
import { FieldArrayType } from '@ngx-formly/core';

@Component({
  selector: 'formly-array-type',
  template: ` <div>
    <mat-card style="margin: 10px 0 0 0" appearance="raised">
      <div class="row">
        <mat-card-header>
          <legend *ngIf="props.label">{{ props.label }}</legend>
        </mat-card-header>
        <mat-card-actions>
          <div style="margin-bottom: 3px;">
            <button type="button" (click)="add()" mat-flat-button>
              <mat-icon>add</mat-icon>
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

      <mat-card-content
        *ngFor="let field of field.fieldGroup; let i = index"
        class="row"
      >
        <div class="row">
          <label class="label-container"> {{ getLabel(field) }} </label>
          <formly-field [field]="field"></formly-field>
        </div>
        <div *ngIf="field.props['removable'] !== false">
          <button
            class="delete-button"
            type="button"
            (click)="remove(i)"
            mat-flat-button
          >
            <mat-icon fontSet="material-icons-outlined">delete</mat-icon>
          </button>
        </div>
      </mat-card-content>
    </mat-card>
  </div>`,
  styleUrls: ['./array-type.scss'],
})
export class ArrayTypeComponent extends FieldArrayType {
  ngOnInit() {
    console.log(this);
  }
  getLabel(field: any): string {
    if (field?.parent?.type === 'array' && !isNaN(Number(field?.parent?.key))) {
      return `[${field?.parent?.key}, ${field.key}]`;
    }
    return '';
  }
}
