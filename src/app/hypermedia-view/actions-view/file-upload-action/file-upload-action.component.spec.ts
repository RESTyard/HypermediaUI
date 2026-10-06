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
import { DropzoneComponent, FileInputDirective } from '@ngx-dropzone/cdk';
import { FormlyJsonschema } from '@ngx-formly/core/json-schema';

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
        DropzoneComponent,
        FileInputDirective,
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideHypermediaClientServiceMock(),
        { provide: MatDialog, useValue: {} },
        { provide: MatSnackBar, useValue: { open: () => {} } },
        { provide: AppConfigService, useValue: { actionPopupWarningConfigurations: [] } },
        { provide: FormlyJsonschema, useValue: { toFieldConfig: () => ({}) } },
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

  it('keeps valid selected files and rejects files over the configured size', () => {
    component.action.FileUploadConfiguration.MaxFileSizeBytes = 4;
    const snackBar = TestBed.inject(MatSnackBar);
    spyOn(snackBar, 'open');

    component.onSelect([
      new File(['ok'], 'valid.txt', {type: 'text/plain'}),
      new File(['large'], 'large.txt', {type: 'text/plain'}),
    ]);

    expect(component.files.map(file => file.name)).toEqual(['valid.txt']);
    expect(snackBar.open).toHaveBeenCalled();
  });

  it('uses an icon appropriate for the selected file type', () => {
    expect(component.getIconForFile(new File(['image'], 'photo.png', {type: 'image/png'}))).toBe('image');
    expect(component.getIconForFile(new File(['pdf'], 'document.pdf', {type: 'application/pdf'}))).toBe('assignment');
    expect(component.getIconForFile(new File(['unknown'], 'file.unknown', {type: 'application/unknown'}))).toBe('insert_drive_file');
  });
});
