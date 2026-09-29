import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { ParameterlessActionViewComponent } from './parameterless-action-view.component';
import { provideHypermediaClientServiceMock } from 'src/app/test/HypermediaClientServiceMock';
import { MatCard } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatMenu } from '@angular/material/menu';
import { MatExpansionPanel, MatExpansionPanelDescription } from '@angular/material/expansion';
import { HypermediaAction } from '../../siren-parser/hypermedia-action';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { AppConfigService } from 'src/app.config.service';
import {importStore} from "../../../store/store-module";

describe('ParameterlessActionViewComponent', () => {
  let component: ParameterlessActionViewComponent;
  let fixture: ComponentFixture<ParameterlessActionViewComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        ParameterlessActionViewComponent
      ],
      imports: [
        importStore(),
        MatCard,
        MatIcon,
        MatMenu,
        MatExpansionPanel,
        MatExpansionPanelDescription,
        MatButtonModule,
      ],
      providers: [
        provideHypermediaClientServiceMock(),
        { provide: MatDialog, useValue: {} },
        { provide: AppConfigService, useValue: { actionPopupWarningConfigurations: [] } },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ParameterlessActionViewComponent);
    component = fixture.componentInstance;
    component.action = new HypermediaAction();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
