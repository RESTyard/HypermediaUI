import { Component, ElementRef, EventEmitter, Input, OnInit, Output, inject, viewChild } from '@angular/core';
import { MatExpansionPanel } from '@angular/material/expansion';
import { AbstractControl, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { AppSettings, SiteSetting } from '../app-settings';
import { Store } from '@ngrx/store';
import {
  addHeader,
  globalHeaderTarget,
  HeaderTarget,
  removeHeader,
  siteHeaderTarget,
  updateHeader,
  updateSiteUrl,
} from 'src/app/store/appsettings.actions';
import {Unit} from "../../utils/unit";
import { siteHostValidator } from './site-host.validator';

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
  @Input() isGlobal: boolean = false;
  /** Hosts of all site specific settings, to reject duplicates. */
  @Input() siteUrls: string[] = [];

  @Output() deleteRequested: EventEmitter<Unit> = new EventEmitter<Unit>();
  @Output() siteUrlChanging = new EventEmitter<{ previousSiteUrl: string, newSiteUrl: string }>();
  public urlFormControl: FormControl = new FormControl();
  headerFormGroups: FormGroup[] = [];
  private panel = viewChild.required(MatExpansionPanel);
  private hostInput = viewChild<ElementRef<HTMLInputElement>>('hostInput');
  /** Shows host errors while typing, not only after leaving the field. */
  readonly hostErrorStateMatcher: ErrorStateMatcher = {
    isErrorState: (control: AbstractControl | null) => !!control && control.invalid && (control.dirty || control.touched),
  };

  ngOnInit(): void {
    if (!this.siteSetting) {
      this.siteSetting = new SiteSetting();
    }

    this.urlFormControl = new FormControl(this.siteSetting!.siteUrl, {
      validators: siteHostValidator(() => this.siteUrls.filter(url => url !== this.siteSetting!.siteUrl)),
    });
    // show problems of stored hosts right away, except for a site that was just added
    if (this.siteSetting.siteUrl !== "" && this.urlFormControl.invalid) {
      this.urlFormControl.markAsTouched();
    }


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
        this.store.dispatch(addHeader({ target: this.headerTarget, key: v, value: value }));
      } else {
        this.store.dispatch(updateHeader({ target: this.headerTarget, previousKey: key, newKey: v, newValue: value }));
      }
      key = v;
    });

    const valueControl = new FormControl(value, {updateOn: 'blur'});
    valueControl.valueChanges.subscribe(v => {
      v = (v ?? "").trim();
      if (key !== "") {
        this.store.dispatch(updateHeader({ target: this.headerTarget, previousKey: key, newKey: key, newValue: v }));
      }
      value = v;
    });

    const result = this.formBuilder.group({
      key: keyControl,
      value: valueControl
    });
    return result;
  }

  focusHost() {
    this.panel().open();
    // the input can only take the focus once the opened panel shows it
    setTimeout(() => this.hostInput()?.nativeElement.focus());
  }

  /** Stores the host when leaving the field. An invalid host is not stored, the previous one stays in effect. */
  commitHost() {
    if (this.urlFormControl.invalid) return;
    const host = (this.urlFormControl.value as string).trim();
    if (host === this.siteSetting!.siteUrl) return;
    this.siteUrlChanging.emit({ previousSiteUrl: this.siteSetting!.siteUrl, newSiteUrl: host });
    this.store.dispatch(updateSiteUrl({ previousSiteUrl: this.siteSetting!.siteUrl, newSiteUrl: host }));
  }

  private get headerTarget(): HeaderTarget {
    return this.isGlobal ? globalHeaderTarget : siteHeaderTarget(this.siteSetting!.siteUrl);
  }

  addHeader() {
    this.headerFormGroups.push(this.AddHeaderFormControl(["", ""]));
  }

  // the panel outlives store updates, so the row is removed here; renamed keys move in the store's map, so look up by key
  removeHeader(index: number) {
    const key = ((this.headerFormGroups[index]?.value.key as string | null) ?? "").trim();
    if (key !== "" && this.siteSetting!.headers.has(key)) {
      this.store.dispatch(removeHeader({ target: this.headerTarget, key }));
    }
    this.headerFormGroups.splice(index, 1);
  }

  removeSite() {
    this.deleteRequested.emit();
  }
}
