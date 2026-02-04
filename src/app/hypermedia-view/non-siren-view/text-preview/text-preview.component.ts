import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-text-preview',
  templateUrl: './text-preview.component.html',
  styleUrl: './text-preview.component.css',
  standalone: false
})
export class TextPreviewComponent implements OnChanges {
  @Input() blob: Blob | undefined;

  textContent: string | undefined;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['blob']) {
      this.updateTextPreview();
    }
  }

  private async updateTextPreview() {
    if (this.blob instanceof Blob) {
      try {
        this.textContent = await this.blob.text();
      } catch (e) {
        console.error('Error reading text content', e);
        this.textContent = 'Error reading text content';
      }
    } else {
      this.textContent = undefined;
    }
  }
}
