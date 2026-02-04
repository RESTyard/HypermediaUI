import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import hljs from 'highlight.js';

@Component({
  selector: 'app-text-preview',
  templateUrl: './text-preview.component.html',
  styleUrl: './text-preview.component.css',
  standalone: false
})
export class TextPreviewComponent implements OnChanges {
  @Input() blob: Blob | undefined;

  public static readonly supportedMimeTypes = new Set([
    'text/markdown',
    'text/x-markdown',
    'text/plain',
    'text/csv',
    'application/csv',
    'application/vnd.ms-excel',
    'application/xml',
    'text/xml',
    'text/html',
    'text/toml',
    'text/yaml'
  ]);

  private static readonly mimeTypeToLanguage: Record<string, string> = {
    'text/markdown': 'markdown',
    'text/x-markdown': 'markdown',
    'text/plain': 'plaintext',
    'text/csv': 'csv',
    'application/csv': 'csv',
    'application/vnd.ms-excel': 'csv',
    'application/xml': 'xml',
    'text/xml': 'xml',
    'text/html': 'html',
    'text/toml': 'toml',
    'text/yaml': 'yaml'
  };

  textContent: string | undefined;
  highlightedHtml: SafeHtml | undefined;

  constructor(private readonly sanitizer: DomSanitizer) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['blob']) {
      console.log('Updating text preview');
      this.updateTextPreview();
    }
  }

  private getLanguageForMimeType(mimeType: string | undefined): string | undefined {
    if (!mimeType) return undefined;
    const mt = mimeType.toLowerCase();

    return TextPreviewComponent.mimeTypeToLanguage[mt];
  }

  private async updateTextPreview() {
    this.highlightedHtml = undefined;
    if (this.blob instanceof Blob) {
      try {
        const text = await this.blob.text();
        this.textContent = text;

        const lang = this.getLanguageForMimeType(this.blob.type);
        if (lang) {
          try {
            const result = hljs.highlight(text, { language: lang });
            this.highlightedHtml = this.sanitizer.bypassSecurityTrustHtml(result.value);
          } catch (e) {
            // If the language is not registered/supported, we fall back to plain text
            // SRP/DIP: error handling isolated; we do not rethrow to keep UI functional
            this.highlightedHtml = undefined;
          }
        }
      } catch (e) {
        console.error('Error reading text content', e);
        this.textContent = 'Error reading text content';
      }
    } else {
      this.textContent = undefined;
    }
  }
}
