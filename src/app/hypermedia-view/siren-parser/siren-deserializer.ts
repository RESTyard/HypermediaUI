import {HttpClient} from '@angular/common/http';
import {SirenClientObject} from './siren-client-object';
import {HypermediaLink} from './hypermedia-link';
import {PropertyInfo, PropertyTypes} from './property-info';
import {ContentTypes, HttpMethodTypes, HypermediaAction} from './hypermedia-action';
import {ReflectionHelpers} from './reflection-helpers';
import {SchemaSimplifier} from './schema-simplifier';
import {EmbeddedLinkEntity} from './embedded-link-entity';
import {IEmbeddedEntity, ISirenClientObject} from './entity-interfaces';
import {EmbeddedEntity} from './embedded-entity';
import {ObservableLruCache} from '../api-access/observable-lru-cache';
import {Injectable} from '@angular/core';
import {map} from 'rxjs';

@Injectable()
export class SirenDeserializer {
  private readonly waheActionTypes = ['application/json', 'octet-stream', 'multipart/form-data'];

  constructor(
     private httpClient: HttpClient,
      private schemaCache: ObservableLruCache<object>,
      private schemaSimplifier: SchemaSimplifier
    ) {

  }

  deserialize(raw: any): SirenClientObject {
    const result = new SirenClientObject();
    this.deserializeEntity(raw, result);

    return result;
  }

  private deserializeEmbeddedEntity(raw: any): EmbeddedEntity {
    const result = new EmbeddedEntity();
    result.relations = [...raw.rel];
    this.deserializeEntity(raw, result);

    return result;
  }

  private deserializeEntity(raw: any, result: ISirenClientObject) {
    if (ReflectionHelpers.hasFilledArrayProperty(raw, 'class')) {
      result.classes = [...(<string[]>raw.class)];
    }

    if (ReflectionHelpers.hasFilledArrayProperty(raw, 'title')) {
      result.title = raw.title;
    }
    
    result.links = this.deserializeLinks(raw);
    result.properties = this.deserializeProperties(raw);
    result.actions = this.deserializeActions(raw);

    // todo preserve order of embeddedLinkEntitys and embeddedEntity, splitting types changes order
    if (ReflectionHelpers.hasFilledArrayProperty(raw, 'entities')) {
      result.embeddedLinkEntities = this.deserializeEmbeddedLinkEntity(raw.entities);
      result.embeddedEntities = this.deserializeEmbeddedEntitys(raw.entities);
    }
  }

  private deserializeLinks(raw: any): HypermediaLink[] {
    const result = new Array<HypermediaLink>();

    if (!ReflectionHelpers.hasFilledArrayProperty(raw, 'links')) {
      return result;
    }

    const links: any[] = raw.links;
    links.forEach(link => {
      result.push(new HypermediaLink([...link.rel], link.href));
    });

    return result;
  }

  deserializeProperties(raw: any): PropertyInfo[] {
    const result = new Array<PropertyInfo>();

    if (!ReflectionHelpers.hasFilledProperty(raw, 'properties')) {
      return result;
    }

    const properties: any = raw.properties;
    for (const property in properties) {
      if (!properties.hasOwnProperty(property)) {
        continue;
      }

      const value = properties[property];
      const propertyType = typeof value;


      if (value === null) {
        result.push(new PropertyInfo(property, value, PropertyTypes.nullvalue));
        continue;
      }

      switch (propertyType) {
        case 'number':
          result.push(new PropertyInfo(property, value, PropertyTypes.number));
          break;

        case 'boolean':
          result.push(new PropertyInfo(property, value, PropertyTypes.boolean));
          break;

        case 'string':
          result.push(new PropertyInfo(property, value, PropertyTypes.string));
          break;

        case 'object':
          if (Array.isArray(value)) {
            result.push(new PropertyInfo(property, value, PropertyTypes.array)); // todo nested values
          } else {
            result.push(new PropertyInfo(property, value, PropertyTypes.object)); // todo nested values
          }

          break;

        case 'undefined':
        case 'function':
        case 'symbol':
        default:
          continue;
      }
    }

    return result;
  }

  deserializeActions(raw: any): HypermediaAction[] {
    const result = new Array<HypermediaAction>();

    if (!ReflectionHelpers.hasFilledArrayProperty(raw, 'actions')) {
      return result;
    }

    const actions: any[] = raw.actions;
    actions.forEach(action => {
      const hypermediaAction = new HypermediaAction();
      hypermediaAction.name = action.name;

      if (ReflectionHelpers.hasFilledArrayProperty(action, 'class')) {
        hypermediaAction.classes = [...action.class];
      }

      hypermediaAction.method = this.getMethod(action);

      hypermediaAction.href = action.href;
      hypermediaAction.title = action.title;
      hypermediaAction.type = action.type;

      this.deserializeActionParameters(action, hypermediaAction);

      result.push(hypermediaAction);
    });

    return result;
  }

  deserializeActionParameters(action: any, hypermediaAction: HypermediaAction) {
    if (!ReflectionHelpers.hasFilledArrayProperty(action, 'fields') || action.fields.length === 0) {
      hypermediaAction.expectedContentType = ContentTypes.NONE;
      return;
    } else {
      hypermediaAction.expectedContentType = action.type;
      this.parseWaheStyleParameters(action, hypermediaAction);
    }
  }

  private getMethod(action: any): HttpMethodTypes {
    let method = HttpMethodTypes[<string>action.method];

    // default value for siren is GET
    if (!method) {
      method = HttpMethodTypes.GET;
    }

    return method;
  }

  deserializeEmbeddedEntitys(entities: Array<any>): Array<IEmbeddedEntity> {
    const result = new Array<EmbeddedEntity>();
    entities.forEach(entity => {
      if (this.isEmbeddedLinkEntity(entity)) {
        return;
      }

      const embeddedEntity = this.deserializeEmbeddedEntity(entity);
      result.push(embeddedEntity);
    });

    return result;
  }

  deserializeEmbeddedLinkEntity(entities: Array<any>): Array<EmbeddedLinkEntity> {
    const result = new Array<EmbeddedLinkEntity>();

    entities.forEach(entity => {
      if (!this.isEmbeddedLinkEntity(entity)) {
        return;
      }

      const linkEntity = new EmbeddedLinkEntity();
      linkEntity.href = entity.href;
      linkEntity.relations = [...entity.rel];
      linkEntity.classes = [...entity.class];
      linkEntity.title = entity.title;
      linkEntity.mediaType = entity.mediaType;

      result.push(linkEntity);
    });

    return result;
  }

  private isEmbeddedLinkEntity(entity: any) {
    if (entity.hasOwnProperty('href')) {
      return true;
    }

    return false;
  }

  parseWaheStyleParameters(action: any, hypermediaAction: HypermediaAction) {
    if (!ReflectionHelpers.hasProperty(action, 'type') || !this.waheActionTypes.includes(action.type)) {
      throw new Error(`Only supporting actions with types="${this.waheActionTypes.join()}". [action ${action.name}]`); // todo parse standard siren
    }

    if (!ReflectionHelpers.hasFilledArrayProperty(action, 'fields')) {
      throw new Error(`no property fields of type array found, which is required. [action ${action.name}]`);
    }

    if (action.fields.length !== 1) {
      throw new Error(`Action field may only contain one entry. [action ${action.name}]`);
    }

    hypermediaAction.waheActionParameterName = action.fields[0].name;
    hypermediaAction.waheActionParameterClasses = [...action.fields[0].class];
    if (hypermediaAction.waheActionParameterClasses.length !== 1) {
      throw new Error(`Action field may only contain one class. [action ${action.name}]`);
    }

    if (!action.fields[0].name) {
      throw new Error(`Action field must contain a name. [action ${action.name}]`);
    }
    hypermediaAction.waheActionParameterName = action.fields[0].name;

    //Map default values if exist
    hypermediaAction.defaultValues = action.fields[0]?.value;

    this.getActionParameterJsonSchema(hypermediaAction.waheActionParameterClasses[0], hypermediaAction);
  }

  // todo handle error
  getActionParameterJsonSchema(schemaUrl: string, hypermediaAction: HypermediaAction) {
    const cached = this.schemaCache.getItem(schemaUrl);
    if (cached) {
      hypermediaAction.waheActionParameterJsonSchema = cached;
      return;
    }

    const simplifiedResponse$ = this.httpClient.get(schemaUrl)
      .pipe(
        map(response => {
          this.schemaSimplifier.simplifySchema(response);
          return response;
        })
      );

    const cachedResponse = this.schemaCache.addItem(schemaUrl, simplifiedResponse$);
    hypermediaAction.waheActionParameterJsonSchema = cachedResponse;
  }

}
