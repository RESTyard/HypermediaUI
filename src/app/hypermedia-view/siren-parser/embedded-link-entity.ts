import { HypermediaLink } from './hypermedia-link';
import { PropertyInfo } from './property-info';
import { HypermediaAction } from './hypermedia-action';
import {IEmbeddedEntity, IEmbeddedLinkEntity} from './entity-interfaces';

export class EmbeddedLinkEntity implements IEmbeddedLinkEntity {
  links: HypermediaLink[] = [];
  properties: PropertyInfo[] = [];
  embeddedLinkEntities: IEmbeddedLinkEntity[] = [];
  embeddedEntities: IEmbeddedEntity[] = [];
  actions: HypermediaAction[] = [];

  public relations: string[] = [];
  public href: string = "";
  public classes: string[] = [];
  public mediaType: string = "";
  public title: string = "";
}
