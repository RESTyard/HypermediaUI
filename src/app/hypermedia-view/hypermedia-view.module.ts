import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { PrettyJsonModule } from 'angular2-prettyjson';

import { ActionsViewComponent } from './actions-view/actions-view.component';
import { ParameterActionComponent } from './actions-view/parameter-action/parameter-action.component';
import { ParameterlessActionViewComponent } from './actions-view/parameterless-action-view/parameterless-action-view.component';
import { ObservableLruCache } from './api-access/observable-lru-cache';
import { EmbeddedEntityViewComponent } from './embedded-entity-view/embedded-entity-view.component';
import { EntityViewComponent } from './entity-view/entity-view.component';
import { HypermediaClientService } from './hypermedia-client.service';
import { HypermediaControlComponent } from './hypermedia-control/hypermedia-control.component';
import { LinkViewComponent } from './link-view/link-view.component';
import { PropertyGridComponent } from './property-grid/property-grid.component';
import { RawViewComponent } from './raw-view/raw-view.component';
import { SchemaSimplifier } from './siren-parser/schema-simplifier';
import { SirenDeserializer } from './siren-parser/siren-deserializer';
import { ClipboardModule } from 'ngx-clipboard';
import {MatCardModule} from "@angular/material/card";
import {MatButtonModule} from "@angular/material/button";
import {MatGridListModule} from "@angular/material/grid-list";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatExpansionModule} from "@angular/material/expansion";
import {MatTabsModule} from "@angular/material/tabs";
import {MatTooltipModule} from "@angular/material/tooltip";
import {MatIconModule} from "@angular/material/icon";
import {MatListModule} from "@angular/material/list";
import {MatSelectModule} from "@angular/material/select";
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatInputModule} from "@angular/material/input";
import {FlexLayoutModule} from "@angular/flex-layout";
import {FormsModule} from "@angular/forms";
import {SettingsModule} from '../settings/settings.module';

import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatProgressBarModule} from '@angular/material/progress-bar';

import { NgxJsonViewerModule } from 'ngx-json-viewer';
import { MatMenuModule } from '@angular/material/menu';
import { ErrorDialogModule } from '../error-dialog/error-dialog.module';
import { FileUploadActionComponent } from './actions-view/file-upload-action/file-upload-action.component';
import {NgxDropzoneModule} from 'ngx-dropzone';
import {MatStepperModule} from '@angular/material/stepper';

import { ReactiveFormsModule } from '@angular/forms';
import {FormlyFieldConfig, FormlyModule} from '@ngx-formly/core';
import { FormlyMaterialModule } from '@ngx-formly/material';
import {ArrayTypeComponent} from './actions-view/parameter-action/formly-types/array-type';
import {ObjectTypeComponent} from './actions-view/parameter-action/formly-types/object-type';
import {MultiSchemaTypeComponent} from './actions-view/parameter-action/formly-types/multi-schema-type';
import {NullTypeComponent} from './actions-view/parameter-action/formly-types/null-type';

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    MatCardModule,
    MatButtonModule,
    MatGridListModule,
    MatCheckboxModule,
    MatExpansionModule,
    MatTabsModule,
    MatTooltipModule,
    MatIconModule,
    MatToolbarModule,
    MatListModule,
    FlexLayoutModule,
    MatInputModule,
    MatSelectModule,
    MatMenuModule,
    ErrorDialogModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,

    NgxJsonViewerModule,

    ReactiveFormsModule,
    FormlyModule.forRoot({
      validationMessages: [
        { name: 'required', message: 'This field is required' },
        { name: 'type', message: typeValidationMessage },
        { name: 'minLength', message: minLengthValidationMessage },
        { name: 'maxLength', message: maxLengthValidationMessage },
        { name: 'min', message: minValidationMessage },
        { name: 'max', message: maxValidationMessage },
        { name: 'multipleOf', message: multipleOfValidationMessage },
        { name: 'exclusiveMinimum', message: exclusiveMinimumValidationMessage },
        { name: 'exclusiveMaximum', message: exclusiveMaximumValidationMessage },
        { name: 'minItems', message: minItemsValidationMessage },
        { name: 'maxItems', message: maxItemsValidationMessage },
        { name: 'uniqueItems', message: 'should NOT have duplicate items' },
        { name: 'const', message: constValidationMessage },
      ],
      types: [
        { name: 'null', component: NullTypeComponent, wrappers: ['form-field'] },
        { name: 'array', component: ArrayTypeComponent },
        { name: 'object', component: ObjectTypeComponent },
        { name: 'multischema', component: MultiSchemaTypeComponent },
      ]
    }),
    FormlyMaterialModule,

    PrettyJsonModule,
    ClipboardModule,
    FormsModule,
    SettingsModule,
    NgxDropzoneModule,
    MatStepperModule,
  ],
  exports: [
    HypermediaControlComponent
  ],
  declarations: [
    HypermediaControlComponent,
    PropertyGridComponent,
    LinkViewComponent,
    EmbeddedEntityViewComponent,
    EntityViewComponent,
    RawViewComponent,
    ActionsViewComponent,
    ParameterlessActionViewComponent,
    ParameterActionComponent,
    FileUploadActionComponent,
    ArrayTypeComponent, ObjectTypeComponent, MultiSchemaTypeComponent, NullTypeComponent
  ],
  providers: [
    HypermediaClientService,
    ObservableLruCache,
    SirenDeserializer,
    SchemaSimplifier,
    HttpClient]
})
export class HypermediaViewModule { }

export function minItemsValidationMessage(error: any, field: FormlyFieldConfig) {
  return `should NOT have fewer than ${field.props['minItems']} items`;
}

export function maxItemsValidationMessage(error: any, field: FormlyFieldConfig) {
  return `should NOT have more than ${field.props['maxItems']} items`;
}

export function minLengthValidationMessage(error: any, field: FormlyFieldConfig) {
  return `should NOT be shorter than ${field.props.minLength} characters`;
}

export function maxLengthValidationMessage(error: any, field: FormlyFieldConfig) {
  return `should NOT be longer than ${field.props.maxLength} characters`;
}

export function minValidationMessage(error: any, field: FormlyFieldConfig) {
  return `should be >= ${field.props.min}`;
}

export function maxValidationMessage(error: any, field: FormlyFieldConfig) {
  return `should be <= ${field.props.max}`;
}

export function multipleOfValidationMessage(error: any, field: FormlyFieldConfig) {
  return `should be multiple of ${field.props.step}`;
}

export function exclusiveMinimumValidationMessage(error: any, field: FormlyFieldConfig) {
  return `should be > ${field.props.step}`;
}

export function exclusiveMaximumValidationMessage(error: any, field: FormlyFieldConfig) {
  return `should be < ${field.props.step}`;
}

export function constValidationMessage(error: any, field: FormlyFieldConfig) {
  return `should be equal to constant "${field.props['const']}"`;
}

export function typeValidationMessage({ schemaType }: any) {
  return `should be "${schemaType[0]}".`;
}
