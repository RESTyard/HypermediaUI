import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import { FormlyFieldCheckbox } from '@ngx-formly/material/checkbox';

@Component({
    selector: 'boolean-type',
    template: `
    <mat-checkbox
      [indeterminate]="state === 0"
      [formControl]="formControl"
      [formlyAttributes]="field"
      (click)="click($event)"
    >
      {{ props.label }}
    </mat-checkbox>
  `,
    // the form field around the checkbox is outside this component
    styles: `
      /* beats the 16px of .mdc-text-field--no-label .mat-mdc-form-field-infix */
      .mat-mdc-form-field .mat-mdc-text-field-wrapper .mat-mdc-form-field-infix:has(> boolean-type) {
        padding-top: 8px;
        padding-bottom: 8px;
      }

      /* aligns the box with the text of other fields, the box's touch target pads it */
      boolean-type .mat-mdc-checkbox {
        margin-left: calc((var(--mat-checkbox-state-layer-size, 40px) - 18px) / -2);
      }
    `,
    encapsulation: ViewEncapsulation.None,
    standalone: false
})
export class BooleanTypeComponent extends FormlyFieldCheckbox implements OnInit {
  state: number = -1;
  isNullable: boolean = false;

  override ngAfterViewInit() {
    super.ngAfterViewInit();
    switch (this.model[this.field.key + '']) {
      case true:
        this.state = 1;
        this.formControl.setValue(true);
        break;
      case false:
        this.state = -1;
        this.formControl.setValue(false);
        break;
      default:
        this.formControl.setValue(this.isNullable ? null : false);
        break;
    }
  }

  ngOnInit() {
    const schemaType = (this.field.validators ?? {})['type']?.schemaType;
    this.isNullable =
      Array.isArray(schemaType) &&
      (schemaType.includes(null) || schemaType.includes('null'));
    if (this.isNullable) {
      this.state = 0;
    }
  }

  click(_event: PointerEvent) {
    if (!this.isNullable) {
      return;
    }
    switch (this.state) {
      case -1: {
        this.state = 0;
        this.formControl.setValue(null);
        break;
      }
      case 0: {
        this.state = 1;
        this.formControl.setValue(true);
        break;
      }
      case 1: {
        this.state = -1;
        this.formControl.setValue(false);
        break;
      }
    }
  }
}
