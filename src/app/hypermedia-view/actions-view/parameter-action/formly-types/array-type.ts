import { Component, Input } from '@angular/core';
import { FieldArrayType } from '@ngx-formly/core';

@Component({
    selector: 'formly-array-type',
    template: ` <div>
    <mat-card style="margin: 10px 0 0 0" appearance="raised">
      <div class="header-container">
        <mat-card-header class="header-content">
          <legend class="title" *ngIf="props.label">
            {{ props.label }}
          </legend>
          <div style="margin-bottom: 3px; margin-left: 0px;">
            <mat-icon class="add-button" (click)="add()">add</mat-icon>
          </div>
        </mat-card-header>
        <mat-card-title class="description" style="margin-left: 18px;">
          <p *ngIf="props.description">{{ props.description }}</p>
        </mat-card-title>
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
          <button mat-icon-button class="delete-button" (click)="remove(i)">
            <mat-icon class="material-icons-outlined">delete</mat-icon>
          </button>
        </div>
      </mat-card-content>
    </mat-card>
  </div>`,
    styleUrls: ['./array-type.scss'],
    standalone: false
})
export class ArrayTypeComponent extends FieldArrayType {
  getLabel(field: any): string {
    if (field?.parent?.type === 'array' && !isNaN(Number(field?.parent?.key))) {
      return `[${field?.parent?.key}, ${field.key}]`;
    }
    return '';
  }
}
