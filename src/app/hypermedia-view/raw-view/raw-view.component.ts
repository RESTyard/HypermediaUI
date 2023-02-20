import { Component, OnInit, Input } from '@angular/core';
import { ClipboardService } from 'ngx-clipboard';

@Component({
  selector: 'app-raw-view',
  templateUrl: './raw-view.component.html',
  styleUrls: ['./raw-view.component.scss']
})
export class RawViewComponent implements OnInit {
  @Input() rawObject: any;

  expand:boolean = true;
  constructor(private clipboardService: ClipboardService) { }

  ngOnInit() {
  }

  copyToClipBoard() {
    this.clipboardService.copyFromContent(JSON.stringify(this.rawObject, null, 2));
  }

  onExpand() {
    this.expand = true;
  }

  onCollaps() {
    this.expand = false;
  }
}
