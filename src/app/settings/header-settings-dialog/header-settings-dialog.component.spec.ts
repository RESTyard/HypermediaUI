import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderSettingsDialogComponent } from './header-settings-dialog.component';

describe('SettingsDialogComponent', () => {
  let component: HeaderSettingsDialogComponent;
  let fixture: ComponentFixture<HeaderSettingsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HeaderSettingsDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeaderSettingsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
