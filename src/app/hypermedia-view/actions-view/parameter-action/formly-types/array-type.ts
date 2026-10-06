import { Component } from '@angular/core';
import {FieldArrayType, FormlyFieldConfig} from '@ngx-formly/core';

@Component({
    selector: 'formly-array-type',
    template: ` <div>
      <mat-card style="margin: 0 0 20px 0" appearance="raised">
        <div class="header-container">
          <mat-card-header class="header-content">
            @if (props.label) {
              <legend class="title">
                {{ props.label }}@if (!props['nullable']) {<span> *</span>}
              </legend>
            }
            @if (!field.fieldGroup?.length) {
              <span class="state">{{ isSet() ? 'empty' : props['nullable'] ? 'null' : 'not set' }}</span>
            }
            <div style="margin-bottom: 3px; margin-left: 0px;">
              <mat-icon class="add-button" (click)="add()">add</mat-icon>
              @if (props['nullable'] && isSet()) {
                <mat-icon class="add-button" matTooltip="Set to null" (click)="unset()">backspace</mat-icon>
              }
            </div>
          </mat-card-header>
          <mat-card-title class="description" style="margin-left: 18px;">
            @if (props.description) {
              <p>{{ props.description }}</p>
            }
          </mat-card-title>
        </div>

        @if (showError && formControl.errors) {
          <div role="alert">
            <formly-validation-message [field]="field"></formly-validation-message>
          </div>
        }

        @for (field of field.fieldGroup; track field; let i = $index) {
          <mat-card-content
            class="row"
            >
            <div class="row">
              <label class="label-container"> {{ getLabel(field) }} </label>
              <formly-field [field]="field"></formly-field>
            </div>
            @if (field.props['removable'] !== false) {
              <div>
                <button mat-icon-button class="delete-button" (click)="remove(i)">
                  <mat-icon class="material-icons-outlined">delete</mat-icon>
                </button>
              </div>
            }
          </mat-card-content>
        }
      </mat-card>
    </div>`,
    styleUrls: ['./array-type.scss'],
    standalone: false
})
export class ArrayTypeComponent extends FieldArrayType {
  // an unset array is sent as null, an empty one as []
  isSet(): boolean {
    return this.model !== null && this.model !== undefined;
  }

  unset() {
    for (let i = this.field.fieldGroup!.length - 1; i >= 0; i--) {
      this.remove(i);
    }
    const parentModel = this.field.parent!.model as Record<string, unknown>;
    parentModel[String(this.key)] = null;
    this.formControl.markAsDirty();
    this.formControl.updateValueAndValidity();
  }

  getLabel(field: FormlyFieldConfig | undefined): string {
    if (field?.parent?.type === 'array' && !isNaN(Number(field?.parent?.key))) {
      return `[${field?.parent?.key}, ${field.key}]`;
    }
    return '';
  }
}
