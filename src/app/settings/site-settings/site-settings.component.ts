import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { AppSettings, SiteSetting, SiteSettings } from '../app-settings';
import { Store } from '@ngrx/store';
import { addHeader, removeHeader, updateHeader, updateSiteUrl } from 'src/app/store/appsettings.actions';

@Component({
    selector: 'app-site-settings',
    templateUrl: './site-settings.component.html',
    styleUrls: ['./site-settings.component.scss'],
    standalone: false
})
export class SiteSettingsComponent implements OnInit {
  @Input() siteSetting: SiteSetting | undefined = new SiteSetting();
  @Input() urlEditable: boolean = true;
  @Input() canBeDeleted: boolean = true;
  @Input() headline: string = "";

  @Output() deleteRequested: EventEmitter<any> = new EventEmitter();
  public urlFormControl: FormControl = new FormControl();
  headerFormGroups: FormGroup[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private store: Store<{ appSettings: AppSettings }>) {
  }

  ngOnInit(): void {
    if (!this.siteSetting) {
      this.siteSetting = new SiteSetting();
    }

    this.urlFormControl = new FormControl(this.siteSetting!.siteUrl, { updateOn: 'blur' });

    this.urlFormControl.valueChanges.subscribe(v => {
      v = v.trim();
      this.store.dispatch(updateSiteUrl({ previousSiteUrl: this.siteSetting!.siteUrl, newSiteUrl: v}));
    });

    const headers = this.siteSetting.headers;
    this.headerFormGroups = Array
      .from(headers.entries())
      .map(h => this.AddHeaderFormControl(h));
  }

  private AddHeaderFormControl(headerSetting: [string, string]): FormGroup<any> {
    let key = headerSetting[0];
    let value = headerSetting[1];
    let keyControl = new FormControl(key, { updateOn: 'blur'});
    keyControl.valueChanges.subscribe(v => {
      v = (v ?? "").trim();
      if (key === "") {
        this.store.dispatch(addHeader({ siteUrl: this.siteSetting!.siteUrl, key: v, value: value }));
      } else {
        this.store.dispatch(updateHeader({ siteUrl: this.siteSetting!.siteUrl, previousKey: key, newKey: v, newValue: value }));
      }
      key = v;
    });

    let valueControl = new FormControl(value, { updateOn: 'blur' });
    valueControl.valueChanges.subscribe(v => {
      v = (v ?? "").trim();
      if (key !== "") {
        this.store.dispatch(updateHeader({ siteUrl: this.siteSetting!.siteUrl, previousKey: key, newKey: key, newValue: v }));
      }
      value = v;
    });

    const result = this.formBuilder.group({
      key: keyControl,
      value: valueControl
    });
    return result;
  }

  addHeader() {
    this.headerFormGroups.push(this.AddHeaderFormControl(["", ""]));
  }

  removeHeader(index: number) {
    const header = Array.from(this.siteSetting!.headers.entries())[index];
    this.store.dispatch(removeHeader({ siteUrl: this.siteSetting!.siteUrl, key: header[0]}));
  }

  removeSite() {
    this.deleteRequested.emit();
  }
}
