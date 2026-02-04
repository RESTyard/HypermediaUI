import { Component, Input } from '@angular/core';
import { getBaseMimeType, getIconForMimeType } from '../mime-type-icon-mapping';
import { HypermediaClientService } from '../hypermedia-client.service';
import { TextPreviewComponent } from './text-preview/text-preview.component';

@Component({
  selector: 'app-non-siren-view',
  templateUrl: './non-siren-view.component.html',
  styleUrl: './non-siren-view.component.css',
  standalone: false
})
export class NonSirenViewComponent {
  @Input() contentType: string | undefined;
  @Input() rawContent: any;

  constructor(
    private hypermediaClient: HypermediaClientService
  ) { }

  isImage(): boolean {
    return !!this.contentType?.toLowerCase().startsWith('image/');
  }

  isText(): boolean {
    const type = this.contentType?.toLowerCase();
    if (!type) return false;

    // Normalize known vendor-specific base types (e.g., application/vnd.*+xml -> application/xml)
    const base = getBaseMimeType(type) ?? type;

    return TextPreviewComponent.supportedMimeTypes.has(base);
  }

  isJson(): boolean {
    const type = this.contentType?.toLowerCase();
    return type === 'application/json' ||
      (!!type && type.startsWith('application/vnd.') && type.endsWith('+json'));
  }

  isOctetStream(): boolean {
    return this.contentType?.toLowerCase() === 'application/octet-stream';
  }

  getIcon(): string {
    return getIconForMimeType(this.contentType);
  }

  getDisplayMimeType(): string | undefined {
    return getBaseMimeType(this.contentType!) ?? this.contentType;
  }

  getContentSize(): number | undefined {
    if (this.rawContent instanceof Blob) {
      return this.rawContent.size;
    }
    return undefined;
  }

  download() {
    const url = this.hypermediaClient.currentApiPath.newestSegment;
    this.hypermediaClient.DownloadAsFile(url);
  }
}
