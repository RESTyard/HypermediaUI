import { HypermediaLink } from './hypermedia-link';
import { PropertyInfo } from './property-info';
import { HypermediaAction } from './hypermedia-action';
import { IEmbeddedLinkEntity } from './entity-interfaces';

export class EmbeddedLinkEntity implements IEmbeddedLinkEntity {
  links: HypermediaLink[] = new Array<HypermediaLink>();
  properties: PropertyInfo[] = new Array<PropertyInfo>() ;
  embeddedLinkEntities: any = [];
  embeddedEntities: any[] = [];
  actions: HypermediaAction[] = [];

  public relations: string[] = new Array<string>();
  public href: string = "";
  public classes: string[] = new Array<string>();
  public mediaType: string = "";
  public title: string = "";

  constructor() { }
}
