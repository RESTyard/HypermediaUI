import { Component, Input, inject } from '@angular/core';
import { ClipboardService } from 'ngx-clipboard';

@Component({
    selector: 'app-raw-view',
    templateUrl: './raw-view.component.html',
    styleUrls: ['./raw-view.component.scss'],
    standalone: false
})
export class RawViewComponent {
  private clipboardService = inject(ClipboardService);

  @Input() rawObject: any;

  expand:boolean = true;
  copyToClipBoard() {
    this.clipboardService.copyFromContent(JSON.stringify(this.rawObject, null, 2));
  }

  onExpand() {
    this.expand = true;
  }

  onCollapse() {
    this.expand = false;
  }
}
