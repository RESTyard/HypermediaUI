import { Component, Input } from '@angular/core';
import { getBaseMimeType, getIconForMimeType } from '../mime-type-icon-mapping';
import { HypermediaClientService } from '../hypermedia-client.service';
import { TextPreviewComponent } from './text-preview/text-preview.component';
import { ImagePreviewComponent } from './image-preview/image-preview.component';
import { JsonPreviewComponent } from './json-preview/json-preview.component';

export enum PreviewType {
  None,
  Image,
  Text,
  Json
}

@Component({
  selector: 'app-non-siren-view',
  templateUrl: './non-siren-view.component.html',
  styleUrl: './non-siren-view.component.css',
  standalone: false
})
export class NonSirenViewComponent {
  @Input() contentType: string | undefined;
  @Input() rawContent: any;

  PreviewType = PreviewType;

  constructor(
    private hypermediaClient: HypermediaClientService
  ) { }

  getPreviewType(): PreviewType {
    const type = this.contentType?.toLowerCase();
    if (!type) return PreviewType.None;

    const base = getBaseMimeType(type) ?? type;

    if (ImagePreviewComponent.supportedMimeTypes.has(base) || type.startsWith('image/')) {
      return PreviewType.Image;
    }

    if (TextPreviewComponent.supportedMimeTypes.has(base)) {
      return PreviewType.Text;
    }

    if (JsonPreviewComponent.supportedMimeTypes.has(base) ||
      (type.startsWith('application/vnd.') && type.endsWith('+json'))) {
      return PreviewType.Json;
    }

    return PreviewType.None;
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
