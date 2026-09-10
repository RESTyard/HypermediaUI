import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TextPreviewComponent } from './text-preview.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('TextPreviewComponent', () => {
  let component: TextPreviewComponent;
  let fixture: ComponentFixture<TextPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TextPreviewComponent],
      imports: [
        MatMenuModule,
        MatButtonModule,
        MatIconModule,
        FormsModule,
        BrowserAnimationsModule
      ]
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
    component.contentType = 'text/plain';

    // Trigger onChanges manually since we are setting input directly
    component.ngOnChanges({
      blob: {
        currentValue: blob,
        previousValue: undefined,
        firstChange: true,
        isFirstChange: () => true
      },
      contentType: {
        currentValue: 'text/plain',
        previousValue: undefined,
        firstChange: true,
        isFirstChange: () => true
      }
    });

    // Wait for the async updateTextPreview
    await new Promise(resolve => setTimeout(resolve, 100));
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

    // Wait for the async updateTextPreview
    await new Promise(resolve => setTimeout(resolve, 100));
    fixture.detectChanges();

    expect(component.textContent).toBeUndefined();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.text-preview')).toBeNull();
  });

  it('should sanitize content even when forced for octet-stream', async () => {
    const maliciousText = 'Hello <script>alert("xss")</script>';
    const blob = new Blob([maliciousText], { type: 'application/octet-stream' });
    component.blob = blob;
    component.contentType = 'application/octet-stream';
    component.forceTextRendering = true;

    component.ngOnChanges({
      blob: {
        currentValue: blob,
        previousValue: undefined,
        firstChange: true,
        isFirstChange: () => true
      },
      contentType: {
        currentValue: 'application/octet-stream',
        previousValue: undefined,
        firstChange: true,
        isFirstChange: () => true
      }
    });

    // Wait for the async updateTextPreview
    await new Promise(resolve => setTimeout(resolve, 100));
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const codeElement = compiled.querySelector('code.hljs');
    if (codeElement) {
      // If it's highlighted, it should be escaped
      expect(codeElement.innerHTML).not.toContain('<script>');
      expect(codeElement.innerHTML).toContain('&lt;script&gt;');
    } else {
      // If it's not highlighted, interpolation should have escaped it
      const preElement = compiled.querySelector('pre.text-preview');
      expect(preElement?.innerHTML).not.toContain('<script>');
      expect(preElement?.innerHTML).toContain('&lt;script&gt;');
    }
  });
});
