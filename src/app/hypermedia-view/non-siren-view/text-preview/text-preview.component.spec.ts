import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TextPreviewComponent } from './text-preview.component';

describe('TextPreviewComponent', () => {
  let component: TextPreviewComponent;
  let fixture: ComponentFixture<TextPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TextPreviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TextPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should read text from blob', async () => {
    const text = 'Hello world';
    const blob = new Blob([text], { type: 'text/plain' });
    component.blob = blob;

    // Trigger onChanges manually since we are setting input directly
    component.ngOnChanges({
      blob: {
        currentValue: blob,
        previousValue: undefined,
        firstChange: true,
        isFirstChange: () => true
      }
    });

    // Wait for the async updateTextPreview
    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.textContent).toBe(text);
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.text-preview')?.textContent).toBe(text);
  });

  it('should handle non-blob input', async () => {
    component.blob = undefined;
    component.ngOnChanges({
      blob: {
        currentValue: undefined,
        previousValue: new Blob(),
        firstChange: false,
        isFirstChange: () => false
      }
    });

    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.textContent).toBeUndefined();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.text-preview')).toBeNull();
  });
});
