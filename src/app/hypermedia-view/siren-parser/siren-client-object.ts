import { PropertyInfo } from './property-info';
import { HypermediaAction } from './hypermedia-action';
import { HypermediaLink } from './hypermedia-link';
import { ISirenClientObject, IEmbeddedLinkEntity, IEmbeddedEntity } from './entity-interfaces';


export class SirenClientObject implements ISirenClientObject {
    classes: string[] = new Array<string>();
    links: HypermediaLink[] = new Array<HypermediaLink>();
    properties: PropertyInfo[] = [];
    embeddedLinkEntities: IEmbeddedLinkEntity[] = [];
    embeddedEntities: IEmbeddedEntity[] = [];
    title: string = "";
    actions: HypermediaAction[] = [];
  }
