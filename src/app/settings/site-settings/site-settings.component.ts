import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { AppSettings, SiteSetting } from '../app-settings';
import { Store } from '@ngrx/store';
import { addHeader, removeHeader, updateHeader, updateSiteUrl } from 'src/app/store/appsettings.actions';
import {Unit} from "../../utils/unit";

@Component({
    selector: 'app-site-settings',
    templateUrl: './site-settings.component.html',
    styleUrls: ['./site-settings.component.scss'],
    standalone: false
})
export class SiteSettingsComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private store = inject<Store<{
    appSettings: AppSettings;
}>>(Store);

  @Input() siteSetting: SiteSetting | undefined = new SiteSetting();
  @Input() urlEditable: boolean = true;
  @Input() canBeDeleted: boolean = true;
  @Input() headline: string = "";

  @Output() deleteRequested: EventEmitter<Unit> = new EventEmitter<Unit>();
  @Output() siteUrlChanging = new EventEmitter<{ previousSiteUrl: string, newSiteUrl: string }>();
  public urlFormControl: FormControl = new FormControl();
  headerFormGroups: FormGroup[] = [];

  ngOnInit(): void {
    if (!this.siteSetting) {
      this.siteSetting = new SiteSetting();
    }

    this.urlFormControl = new FormControl(this.siteSetting!.siteUrl, { updateOn: 'blur' });

    this.urlFormControl.valueChanges.subscribe(v => {
      v = v.trim();
      this.siteUrlChanging.emit({ previousSiteUrl: this.siteSetting!.siteUrl, newSiteUrl: v });
      this.store.dispatch(updateSiteUrl({ previousSiteUrl: this.siteSetting!.siteUrl, newSiteUrl: v}));
    });

    const headers = this.siteSetting.headers;
    this.headerFormGroups = Array
      .from(headers.entries())
      .map(h => this.AddHeaderFormControl(h));
  }

  private AddHeaderFormControl(headerSetting: [string, string]): FormGroup {
    let key = headerSetting[0];
    let value = headerSetting[1];
    const keyControl = new FormControl(key, {updateOn: 'blur'});
    keyControl.valueChanges.subscribe(v => {
      v = (v ?? "").trim();
      if (key === "") {
        this.store.dispatch(addHeader({ siteUrl: this.siteSetting!.siteUrl, key: v, value: value }));
      } else {
        this.store.dispatch(updateHeader({ siteUrl: this.siteSetting!.siteUrl, previousKey: key, newKey: v, newValue: value }));
      }
      key = v;
    });

    const valueControl = new FormControl(value, {updateOn: 'blur'});
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

  // the panel outlives store updates, so the row is removed here; renamed keys move in the store's map, so look up by key
  removeHeader(index: number) {
    const key = ((this.headerFormGroups[index]?.value.key as string | null) ?? "").trim();
    if (key !== "" && this.siteSetting!.headers.has(key)) {
      this.store.dispatch(removeHeader({ siteUrl: this.siteSetting!.siteUrl, key }));
    }
    this.headerFormGroups.splice(index, 1);
  }

  removeSite() {
    this.deleteRequested.emit();
  }
}
