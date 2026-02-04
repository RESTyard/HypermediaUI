import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NonSirenViewComponent } from './non-siren-view.component';
import { provideHypermediaClientServiceMock } from '../../test/HypermediaClientServiceMock';
import { MatIconModule } from '@angular/material/icon';

describe('NonSirenViewComponent', () => {
  let component: NonSirenViewComponent;
  let fixture: ComponentFixture<NonSirenViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NonSirenViewComponent],
      imports: [MatIconModule],
      providers: [
        provideHypermediaClientServiceMock()
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NonSirenViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display normalized mime type for vendor-specific siren+json', () => {
    component.contentType = 'application/vnd.siren+json';
    fixture.detectChanges();
    expect(component.getDisplayMimeType()).toBe('application/json');

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.mime-type')?.textContent).toContain('application/json');
  });

  it('should display original mime type if no base type is found', () => {
    component.contentType = 'application/pdf';
    fixture.detectChanges();
    expect(component.getDisplayMimeType()).toBe('application/pdf');

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.mime-type')?.textContent).toContain('application/pdf');
  });
});
