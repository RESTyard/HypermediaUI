import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteSettingsDialogComponent } from './site-settings-dialog.component';

describe('SiteSettingsDialogComponent', () => {
  let component: SiteSettingsDialogComponent;
  let fixture: ComponentFixture<SiteSettingsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteSettingsDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteSettingsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
