import { SirenClientObject } from './siren-client-object';
import { HypermediaLink } from './hypermedia-link';
import { PropertyInfo } from './property-info';
import { HypermediaAction } from './hypermedia-action';
import { IEmbeddedLinkEntity } from './entity-interfaces';

export class EmbeddedLinkEntity implements IEmbeddedLinkEntity {
  links: HypermediaLink[];
  properties: PropertyInfo[];
  embeddedLinkEntities: any;
  embeddedEntities: any[];
  actions: HypermediaAction[];

  public relations: string[] = new Array<string>();
  public href: string;
  public classes: string[] = new Array<string>();
  public mediaType: string;
  public title: string;

  constructor() { }

}
