import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImagePreviewComponent } from './image-preview.component';
import { DomSanitizer } from '@angular/platform-browser';

describe('ImagePreviewComponent', () => {
  let component: ImagePreviewComponent;
  let fixture: ComponentFixture<ImagePreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ImagePreviewComponent],
      providers: [
        {
          provide: DomSanitizer,
          useValue: {
            bypassSecurityTrustUrl: (url: string) => `safe-${url}`
          }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImagePreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create object URL when blob is provided', () => {
    const blob = new Blob([''], { type: 'image/png' });
    const createSpy = spyOn(URL, 'createObjectURL').and.returnValue('blob:url');

    component.blob = blob;
    component.ngOnChanges({
      blob: {
        currentValue: blob,
        previousValue: undefined,
        firstChange: true,
        isFirstChange: () => true
      }
    });

    expect(createSpy).toHaveBeenCalledWith(blob);
    expect(component.imageUrl).toBe('blob:url');
    expect(component.safeImageUrl).toBe('safe-blob:url' as any);
  });

  it('should revoke object URL on destroy', () => {
    const revokeSpy = spyOn(URL, 'revokeObjectURL');
    component.imageUrl = 'blob:url';

    component.ngOnDestroy();

    expect(revokeSpy).toHaveBeenCalledWith('blob:url');
    expect(component.imageUrl).toBeUndefined();
    expect(component.safeImageUrl).toBeUndefined();
  });

  it('should revoke previous object URL when blob changes', () => {
    const revokeSpy = spyOn(URL, 'revokeObjectURL');
    spyOn(URL, 'createObjectURL').and.returnValue('blob:new');
    component.imageUrl = 'blob:old';

    const blob = new Blob([''], { type: 'image/png' });
    component.blob = blob;
    component.ngOnChanges({
      blob: {
        currentValue: blob,
        previousValue: 'something',
        firstChange: false,
        isFirstChange: () => false
      }
    });

    expect(revokeSpy).toHaveBeenCalledWith('blob:old');
    expect(component.imageUrl).toBe('blob:new');
  });
});
