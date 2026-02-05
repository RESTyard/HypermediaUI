import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-image-preview',
  templateUrl: './image-preview.component.html',
  styleUrl: './image-preview.component.css',
  standalone: false
})
export class ImagePreviewComponent implements OnChanges, OnDestroy {
  @Input() blob: Blob | undefined;

  public static readonly supportedMimeTypes = new Set([
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/svg+xml',
    'image/webp',
    'image/bmp',
    'image/x-icon'
  ]);

  imageUrl: string | undefined;
  safeImageUrl: SafeUrl | undefined;

  constructor(private sanitizer: DomSanitizer) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['blob']) {
      this.updateImagePreview();
    }
  }

  ngOnDestroy(): void {
    this.revokeImageUrl();
  }

  private updateImagePreview() {
    this.revokeImageUrl();

    if (this.blob instanceof Blob) {
      this.imageUrl = URL.createObjectURL(this.blob);
      this.safeImageUrl = this.sanitizer.bypassSecurityTrustUrl(this.imageUrl);
    }
  }

  private revokeImageUrl() {
    if (this.imageUrl) {
      URL.revokeObjectURL(this.imageUrl);
      this.imageUrl = undefined;
      this.safeImageUrl = undefined;
    }
  }
}
