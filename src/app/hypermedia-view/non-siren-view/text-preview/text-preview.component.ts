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
  @Input() contentType: string | undefined;

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
    'text/yaml',
    'application/octet-stream'
  ]);

  public static readonly mimeTypeToLanguage: Record<string, string> = {
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
    'text/yaml': 'yaml',
    'application/octet-stream': 'plaintext'
  };

  textContent: string | undefined;
  highlightedHtml: SafeHtml | undefined;

  forceTextRendering = false;
  selectedLanguage: string | undefined;
  languages: string[] = [];

  constructor(private readonly sanitizer: DomSanitizer) {
    const supportedLanguages = Array.from(TextPreviewComponent.supportedMimeTypes)
      .map(mimeType => TextPreviewComponent.mimeTypeToLanguage[mimeType])
      .filter((lang): lang is string => !!lang && lang !== 'plaintext');

    this.languages = Array.from(new Set(supportedLanguages)).sort();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['blob'] || changes['selectedLanguage'] || changes['contentType']) {
      console.log('Updating text preview');
      this.updateTextPreview();
    }
  }

  isOctetStream(): boolean {
    return this.contentType?.toLowerCase() === 'application/octet-stream';
  }

  toggleForceTextRendering() {
    this.forceTextRendering = !this.forceTextRendering;
    this.updateTextPreview();
  }

  selectLanguage(lang: string | undefined) {
    this.selectedLanguage = lang;
    this.updateTextPreview();
  }

  private getLanguageForMimeType(mimeType: string | undefined): string {
    if (!mimeType) return 'plaintext';
    const mt = mimeType.toLowerCase();

    return TextPreviewComponent.mimeTypeToLanguage[mt] ?? 'plaintext';
  }

  public async updateTextPreview() {
    this.highlightedHtml = undefined;
    if (this.blob instanceof Blob) {
      try {
        const text = await this.blob.text();
        this.textContent = text;

        const lang = this.selectedLanguage ?? this.getLanguageForMimeType(this.contentType || this.blob.type);
        try {
          const result = hljs.highlight(text, { language: lang });
          this.highlightedHtml = this.sanitizer.bypassSecurityTrustHtml(result.value);
        } catch (e) {
          // If the language is not registered/supported, we fall back to plain text
          // SRP/DIP: error handling isolated; we do not rethrow to keep UI functional
          this.highlightedHtml = undefined;
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
