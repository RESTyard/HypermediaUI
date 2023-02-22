import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { HeaderSetting, SiteSetting } from '../services/AppSettings';

@Component({
  selector: 'app-site-settings',
  templateUrl: './site-settings.component.html',
  styleUrls: ['./site-settings.component.scss']
})


export class SiteSettingsComponent implements OnInit {
  @Input() siteSetting: SiteSetting | undefined = new SiteSetting();
  @Input() urlEditable: boolean = true;
  @Input() canBeDeleted: boolean = true;
  @Input() headline: string = "";

  @Output() deleteRequested: EventEmitter<any> = new EventEmitter();
  public urlFormControl: FormControl = new FormControl();
  headerFormGroups: FormGroup[] = [];

  constructor(private formBuilder: FormBuilder) {
  }

  ngOnInit(): void {
    if (!this.siteSetting) {
      this.siteSetting = new SiteSetting();
    }

    this.urlFormControl = new FormControl(this.siteSetting!.SiteUrl);
    this.urlFormControl.valueChanges.subscribe(v => this.siteSetting!.SiteUrl = v.trim())

    const headers = this.siteSetting.Headers;
    headers.forEach(h => {
      this.headerFormGroups.push(
        this.AddHeaderFormControl(h));
    });
  }

  private AddHeaderFormControl(headerSetting: HeaderSetting): FormGroup<any> {
    let key = new FormControl(headerSetting.Key);
    key.valueChanges.subscribe(v => v ? headerSetting.Key = v!.trim() : headerSetting.Key = "");
    
    let value = new FormControl(headerSetting.Value);
    value.valueChanges.subscribe(v => v ? headerSetting.Value = v!.trim() : headerSetting.Value = "");

    return this.formBuilder.group({
      key: key,
      value: value
    });
  }

  addHeader() {
    let newHeader = new HeaderSetting();
    this.siteSetting?.Headers.push(newHeader);

    this.headerFormGroups.push(this.AddHeaderFormControl(newHeader));
  }

  removeHeader(index: number) {
    this.siteSetting?.Headers.splice(index - 1, 1);
    this.headerFormGroups.splice(index - 1, 1);
  }

  removeSite() {
    this.deleteRequested.emit();
  }
}
