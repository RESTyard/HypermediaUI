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
})
export class BooleanTypeComponent extends FormlyFieldCheckbox {
  state: number = -1;
  isNullable: boolean = false;

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
