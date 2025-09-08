import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { EntityViewComponent } from './entity-view.component';
import { SettingsService } from 'src/app/settings/services/settings.service';
import { PropertyGridComponent } from '../property-grid/property-grid.component';
import { importStore } from 'src/app/store/store-module';

describe('EntityViewComponent', () => {
  let component: EntityViewComponent;
  let fixture: ComponentFixture<EntityViewComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ 
        EntityViewComponent,
        PropertyGridComponent
      ],
      imports: [
        importStore(),
      ],
      providers: [
        SettingsService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EntityViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
