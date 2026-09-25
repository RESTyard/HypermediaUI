import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { ParameterActionComponent } from './parameter-action.component';
import { provideHypermediaClientServiceMock } from 'src/app/test/HypermediaClientServiceMock';
import { MatMenu } from '@angular/material/menu';
import { MatExpansionPanel, MatExpansionPanelDescription, MatExpansionPanelHeader, MatExpansionPanelTitle } from '@angular/material/expansion';
import { MatIcon } from '@angular/material/icon';
import { HypermediaAction } from '../../siren-parser/hypermedia-action';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { AppConfigService } from 'src/app.config.service';
import { FormlyJsonschema } from '@ngx-formly/core/json-schema';
import {importStore} from "../../../store/store-module";

describe('ParameterActionComponent', () => {
  let component: ParameterActionComponent;
  let fixture: ComponentFixture<ParameterActionComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        ParameterActionComponent
      ],
      imports: [
        importStore(),
        MatMenu,
        MatExpansionPanel,
        MatExpansionPanelHeader,
        MatExpansionPanelTitle,
        MatIcon,
        MatExpansionPanelDescription,
        MatButtonModule,
      ],
      providers: [
        provideHypermediaClientServiceMock(),
        { provide: MatDialog, useValue: {} },
        { provide: AppConfigService, useValue: { actionPopupWarningConfigurations: [] } },
        { provide: FormlyJsonschema, useValue: { toFieldConfig: () => ({}) } },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ParameterActionComponent);
    component = fixture.componentInstance;
    component.action = new HypermediaAction();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
