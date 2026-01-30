import { HypermediaClientService } from '../hypermedia-client.service';
import { Component, OnInit, Input } from '@angular/core';
import { HypermediaLink } from '../siren-parser/hypermedia-link';
import { getIconForRelation } from '../relation-icon-mapping';
import { ClipboardService } from 'ngx-clipboard';
import {MediaTypes} from "../MediaTypes";

@Component({
    selector: 'app-link-view',
    templateUrl: './link-view.component.html',
    styleUrls: ['./link-view.component.scss'],
    standalone: false
})
export class LinkViewComponent implements OnInit {

  @Input() links: HypermediaLink[] = [];

  protected readonly MediaTypes = MediaTypes;

  constructor(private hypermediaClient: HypermediaClientService, private clipboardService: ClipboardService) { }

  ngOnInit() {
  }

  navigateLink(hypermediaLink: HypermediaLink) {
    this.hypermediaClient.Navigate(hypermediaLink.url);
  }

  getRelationIcon(rels: string[]): string | undefined {
    if (!rels) return undefined;
    for (const rel of rels) {
      const icon = getIconForRelation(rel);
      if (icon) return icon;
    }
    return undefined;
  }

  copyToClipBoard(hypermediaLink: HypermediaLink) {
    this.clipboardService.copyFromContent(hypermediaLink.url);
  }

  download(hypermediaLink: HypermediaLink) {
    this.hypermediaClient.DownloadAsFile(hypermediaLink.url);
  }
}
