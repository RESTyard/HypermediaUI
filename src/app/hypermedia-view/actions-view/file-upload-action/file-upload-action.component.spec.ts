import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileUploadActionComponent } from './file-upload-action.component';

describe('FileUploadActionComponent', () => {
  let component: FileUploadActionComponent;
  let fixture: ComponentFixture<FileUploadActionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FileUploadActionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FileUploadActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
