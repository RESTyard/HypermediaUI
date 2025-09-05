import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { SirenClientObject } from '../siren-parser/siren-client-object';
import { HypermediaLink } from '../siren-parser/hypermedia-link';
import { HypermediaAction } from '../siren-parser/hypermedia-action';
import { PropertyInfo } from '../siren-parser/property-info';
import { IEmbeddedEntity, IEmbeddedLinkEntity } from '../siren-parser/entity-interfaces';
import { AppSettings, GeneralSettings } from 'src/app/settings/app-settings';
import { Store } from '@ngrx/store';
import { selectEffectiveGeneralSettings } from 'src/app/store/selectors';
import { AppConfig } from 'src/app.config.service';

@Component({
    selector: 'app-entity-view',
    templateUrl: './entity-view.component.html',
    styleUrls: ['./entity-view.component.scss'],
    standalone: false
})
export class EntityViewComponent implements OnInit, OnChanges {

  @Input() entity: SirenClientObject = new SirenClientObject();

  public title: string = "";
  public embeddedLinkEntities: IEmbeddedLinkEntity[] = [];
  public embeddedEntities: IEmbeddedEntity[] = [];
  public classes: string = "";
  public links: HypermediaLink[] = new Array<HypermediaLink>();
  public properties: PropertyInfo[] = new Array<PropertyInfo>();
  public actions: HypermediaAction[] = new Array<HypermediaAction>();
  GeneralSettings: GeneralSettings = new GeneralSettings();

  constructor(private store: Store<{ appSettings: AppSettings, appConfig: AppConfig }>) {
    store
      .select(selectEffectiveGeneralSettings)
      .subscribe({
        next: appSettings => {
          this.GeneralSettings = appSettings;
        }
      });
  }

  ngOnInit() {
    this.processHto();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.processHto();
  }

  private processHto() {
    this.classes = this.entity.classes.join(',');
    this.links = this.entity.links;
    this.properties = this.entity.properties;
    this.embeddedLinkEntities = this.entity.embeddedLinkEntities;
    this.embeddedEntities = this.entity.embeddedEntities;
    this.title = this.entity.title;
    this.actions = this.entity.actions;
  }

}
