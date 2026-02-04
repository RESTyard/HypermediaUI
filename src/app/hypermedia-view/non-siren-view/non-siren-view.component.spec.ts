import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NonSirenViewComponent } from './non-siren-view.component';
import { provideHypermediaClientServiceMock } from '../../test/HypermediaClientServiceMock';
import { MatIconModule } from '@angular/material/icon';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-image-preview',
  template: '',
  standalone: false
})
class MockImagePreviewComponent {
  @Input() blob: any;
}

@Component({
  selector: 'app-text-preview',
  template: '',
  standalone: false
})
class MockTextPreviewComponent {
  @Input() blob: any;
}

@Component({
  selector: 'app-json-preview',
  template: '',
  standalone: false
})
class MockJsonPreviewComponent {
  @Input() blob: any;
}

describe('NonSirenViewComponent', () => {
  let component: NonSirenViewComponent;
  let fixture: ComponentFixture<NonSirenViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        NonSirenViewComponent,
        MockImagePreviewComponent,
        MockTextPreviewComponent,
        MockJsonPreviewComponent
      ],
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

  it('should identify image mime types', () => {
    component.contentType = 'image/png';
    expect(component.isImage()).toBeTrue();

    component.contentType = 'application/pdf';
    expect(component.isImage()).toBeFalse();
  });

  it('should identify text mime types', () => {
    component.contentType = 'text/plain';
    expect(component.isText()).toBeTrue();

    component.contentType = 'text/html';
    expect(component.isText()).toBeFalse();
  });

  it('should identify json mime types', () => {
    component.contentType = 'application/json';
    expect(component.isJson()).toBeTrue();

    component.contentType = 'application/vnd.siren+json';
    expect(component.isJson()).toBeTrue();

    component.contentType = 'text/plain';
    expect(component.isJson()).toBeFalse();
  });
});
