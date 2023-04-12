import { Component } from '@angular/core';
import {FieldArrayType} from '@ngx-formly/core';

@Component({
  selector: 'app-formly-repeat-section',
  styleUrls: ['./formly-repeat-section.component.css'],
  template: `
    <div class="mb-3">
      <legend *ngIf="props.label">{{ props.label }}</legend>
      <p *ngIf="props.description">{{ props.description }}</p>
      <div *ngFor="let field of field.fieldGroup; let i = index" class="row align-items-baseline">
        <mat-grid-list cols="6" rowHeight="50px">
          <mat-grid-tile>
            <formly-field class="col" [field]="field"></formly-field>
          </mat-grid-tile>
          <mat-grid-tile>
            <button class="btn btn-danger" type="button" (click)="remove(i)">{{ props['removeText'] }}</button>
          </mat-grid-tile>
        </mat-grid-list>
      </div>
      <div style="margin:30px 0;">
        <button class="btn btn-primary" type="button" (click)="add()">{{ props['addText'] }}</button>
      </div>
    </div>
  `
})
export class FormlyRepeatSectionComponent extends FieldArrayType{

}
