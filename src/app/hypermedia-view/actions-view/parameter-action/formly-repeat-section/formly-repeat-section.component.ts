import { Component } from '@angular/core';
import {FieldArrayType} from '@ngx-formly/core';

@Component({
  selector: 'app-formly-repeat-section',
  styleUrls: ['./formly-repeat-section.component.css'],
  template: `
    <div class="mb-3">
      <legend *ngIf="props.label">{{ props.label }}</legend>
      <p *ngIf="props.description">{{ props.description }}</p>
      <div *ngFor="let field of field.fieldGroup; let i = index">
        <mat-grid-list cols="12" rowHeight="50px">
          <mat-grid-tile colspan="11">
            <formly-field style="width: 100%" [field]="field"></formly-field>
          </mat-grid-tile>
          <mat-grid-tile colspan="1">
            <button mat-raised-button type="button" (click)="remove(i)">{{ props['removeText'] }}</button>
          </mat-grid-tile>
        </mat-grid-list>
      </div>
      <div style="margin: 1px 0 20px 0;">
        <button mat-raised-button type="button" (click)="add()">{{ props['addText'] }}</button>
      </div>
    </div>
  `
})
export class FormlyRepeatSectionComponent extends FieldArrayType{

}
