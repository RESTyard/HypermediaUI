import { Component } from '@angular/core';
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
    standalone: false
})
export class BooleanTypeComponent extends FormlyFieldCheckbox {
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
        this.formControl.setValue(null);
        break;
    }
  }

  ngOnInit() {
    const schemaType = this.field.validators['type'].schemaType;
    this.isNullable =
      Array.isArray(schemaType) &&
      (schemaType.includes(null) || schemaType.includes('null'));
    if (this.isNullable) {
      this.state = 0;
    }
  }

  click(event: any) {
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
