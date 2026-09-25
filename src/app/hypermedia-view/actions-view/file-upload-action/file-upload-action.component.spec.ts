import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing'

import { FileUploadActionComponent } from './file-upload-action.component';
import { ProblemDetailsViewComponent } from 'src/app/error-dialog/problem-details-view/problem-details-view.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHypermediaClientServiceMock } from 'src/app/test/HypermediaClientServiceMock';
import { MatExpansionPanel, MatExpansionPanelDescription, MatExpansionPanelHeader, MatExpansionPanelTitle } from '@angular/material/expansion';
import { MatIcon } from '@angular/material/icon';
import { HypermediaAction } from '../../siren-parser/hypermedia-action';
import { MatTooltip } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AppConfigService } from 'src/app.config.service';
import {importStore} from "../../../store/store-module";

describe('FileUploadActionComponent', () => {
  let component: FileUploadActionComponent;
  let fixture: ComponentFixture<FileUploadActionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        FileUploadActionComponent,
        ProblemDetailsViewComponent,
      ],
      imports: [
        importStore(),
        MatExpansionPanel,
        MatExpansionPanelHeader,
        MatExpansionPanelTitle,
        MatExpansionPanelDescription,
        MatIcon,
        MatTooltip,
        MatButtonModule,
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideHypermediaClientServiceMock(),
        { provide: MatDialog, useValue: {} },
        { provide: MatSnackBar, useValue: { open: () => {} } },
        { provide: AppConfigService, useValue: { actionPopupWarningConfigurations: [] } },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(FileUploadActionComponent);
    component = fixture.componentInstance;
    component.action = new HypermediaAction();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
