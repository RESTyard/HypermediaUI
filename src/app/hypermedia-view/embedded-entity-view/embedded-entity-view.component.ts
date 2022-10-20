import { Component, OnInit, Input} from '@angular/core';
import { EmbeddedLinkEntity } from '../siren-parser/embedded-link-entity';
import { EmbeddedEntity } from '../siren-parser/embedded-entity';
import { HypermediaClientService } from '../hypermedia-client.service';
import { ClipboardService } from 'ngx-clipboard';

@Component({
  selector: 'app-embedded-entity-view',
  templateUrl: './embedded-entity-view.component.html',
  styleUrls: ['./embedded-entity-view.component.scss']
})
export class EmbeddedEntityViewComponent implements OnInit {
  @Input() embeddedLinkEntities: EmbeddedLinkEntity[];
  @Input() embeddedEntities: EmbeddedEntity[];

  constructor(private hypermediaClient: HypermediaClientService, private clipboardService: ClipboardService) { }

  navigateHref(href: string) {
    this.hypermediaClient.Navigate(href);
  }

  copyToClipBoard(href: string) {
    this.clipboardService.copyFromContent(href);
  }

  ngOnInit() {
  }

}
