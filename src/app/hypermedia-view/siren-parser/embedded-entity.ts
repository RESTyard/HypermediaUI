import { SirenClientObject } from './siren-client-object';
import { IEmbeddedEntity } from './entity-interfaces';

export class EmbeddedEntity extends SirenClientObject implements IEmbeddedEntity {
  public relations: string[] = [];
}
