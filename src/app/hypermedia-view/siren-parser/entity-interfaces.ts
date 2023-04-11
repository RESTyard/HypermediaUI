import { HypermediaLink } from './hypermedia-link';
import { PropertyInfo } from './property-info';
import { HypermediaAction } from './hypermedia-action';

export interface ISirenClientObject {
  classes: string[];
  links: HypermediaLink[];
  properties: PropertyInfo[];
  embeddedLinkEntities: IEmbeddedLinkEntity[];
  embeddedEntities: IEmbeddedEntity[];
  title: string;
  actions: HypermediaAction[];
}

export interface IEmbeddedLinkEntity extends IEmbeddedEntity {
  relations: string[];
  href: string;
  classes: string[];
  mediaType: string;
  title: string;
}

export interface IEmbeddedEntity extends ISirenClientObject {
  relations: string[];
}
