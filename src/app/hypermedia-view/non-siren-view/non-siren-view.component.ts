import { Component, Input } from '@angular/core';
import { getBaseMimeType, getIconForMimeType } from '../mime-type-icon-mapping';
import { HypermediaClientService } from '../hypermedia-client.service';

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

  getIcon(): string {
    return getIconForMimeType(this.contentType);
  }

  getDisplayMimeType(): string | undefined {
    return getBaseMimeType(this.contentType!) ?? this.contentType;
  }

  download() {
    const url = this.hypermediaClient.currentApiPath.newestSegment;
    this.hypermediaClient.DownloadAsFile(url);
  }
}
