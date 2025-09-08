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
        MatExpansionPanel,
        MatExpansionPanelHeader,
        MatExpansionPanelTitle,
        MatExpansionPanelDescription,
        MatIcon,
        MatTooltip,
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideHypermediaClientServiceMock(),
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
