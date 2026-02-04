import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-json-preview',
  templateUrl: './json-preview.component.html',
  styleUrl: './json-preview.component.css',
  standalone: false
})
export class JsonPreviewComponent implements OnChanges {
  @Input() blob: Blob | any | undefined;

  jsonObject: any;

  async ngOnChanges(changes: SimpleChanges) {
    if (changes['blob']) {
      await this.updatePreview();
    }
  }

  private async updatePreview() {
    if (this.blob instanceof Blob) {
      try {
        const text = await this.blob.text();
        this.jsonObject = JSON.parse(text);
      } catch (e) {
        console.error('Error parsing JSON blob', e);
        this.jsonObject = { error: 'Failed to parse JSON content' };
      }
    } else if (this.blob && typeof this.blob === 'object') {
      // If it's already an object (Siren or JSON handled by HypermediaClientService)
      this.jsonObject = this.blob;
    } else {
      this.jsonObject = null;
    }
  }
}
