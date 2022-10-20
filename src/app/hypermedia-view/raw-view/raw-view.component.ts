import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-raw-view',
  templateUrl: './raw-view.component.html',
  styleUrls: ['./raw-view.component.scss']
})
export class RawViewComponent implements OnInit {
  @Input() rawObject: object;

  constructor() { }

  ngOnInit() {
  }

}
