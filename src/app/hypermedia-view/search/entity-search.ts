import { ISirenClientObject } from '../siren-parser/entity-interfaces';
import { PropertyInfo, PropertyTypes } from '../siren-parser/property-info';
import { getDisplayTextForRelation } from '../display-text-mapping';
import { TextMatcher } from './search-matcher';

export interface SearchOptions {
  propertyValues: boolean;
  propertyNames: boolean;
  titles: boolean;
  linkRelations: boolean;
  embeddedRelations: boolean;
  actions: boolean;
  caseSensitive: boolean;
  regex: boolean;
}

export const defaultSearchOptions: SearchOptions = {
  propertyValues: true,
  propertyNames: true,
  titles: true,
  linkRelations: false,
  embeddedRelations: false,
  actions: false,
  caseSensitive: false,
  regex: false,
};

/**
 * One matching text field. `target` identifies the rendered element that holds the field
 * (scroll target), `entityKey` the entity whose content area renders it (must be expanded).
 */
export interface SearchHit {
  target: string;
  field: SearchField;
  entityKey: string;
}

export type SearchField = 'name' | 'value' | 'title' | 'classes' | 'rel' | 'raw';

export interface EntitySearchContext {
  showClasses: boolean;
}

// Entity keys mirror the embedding structure: "e", "e.0", "e.0.3", ...
export const rootEntityKey = 'e';
export const embeddedEntityKey = (parentKey: string, index: number) => `${parentKey}.${index}`;
export const entityTitleTarget = (entityKey: string) => `${entityKey}|title`;
export const entityClassesTarget = (entityKey: string) => `${entityKey}|classes`;
export const propertyTarget = (entityKey: string, path: string[]) =>
  `${entityKey}|p|${path.map(encodeURIComponent).join('/')}`;
export const linkTarget = (entityKey: string, index: number) => `${entityKey}|l|${index}`;
export const actionTarget = (entityKey: string, index: number) => `${entityKey}|a|${index}`;
export const embeddedHeaderTarget = (entityKey: string) => `${entityKey}|header`;
export const embeddedLinkEntityTarget = (entityKey: string, index: number) => `${entityKey}|le|${index}`;
export const rawTarget = (index: number) => `raw|${index}`;

/** The entity key itself plus all its ancestors, e.g. "e.0.3" -> ["e", "e.0", "e.0.3"]. */
export function entityKeyWithAncestors(entityKey: string): string[] {
  const parts = entityKey.split('.');
  return parts.map((_, i) => parts.slice(0, i + 1).join('.'));
}

/** Child properties as rendered by the property tree: object keys in insertion order, array items by index. */
export function getChildProperties(node: PropertyInfo): PropertyInfo[] | null {
  if (node.type !== PropertyTypes.object && node.type !== PropertyTypes.array) return null;
  const val = node.value;
  return Object.keys(val).map(key => {
    const v = val[key];
    let type = PropertyTypes.object;
    if (v === null) type = PropertyTypes.nullvalue;
    else if (Array.isArray(v)) type = PropertyTypes.array;
    else if (typeof v === 'number') type = PropertyTypes.number;
    else if (typeof v === 'boolean') type = PropertyTypes.boolean;
    else if (typeof v === 'string') type = PropertyTypes.string;
    return new PropertyInfo(key, v, type);
  });
}

export function displayTextOfAction(action: { title: string, name: string | undefined }): string {
  return action.title || action.name || '';
}

/** Collects hits in render order: title, classes, properties, links, actions, embedded entities. */
export function collectEntityHits(
  entity: ISirenClientObject,
  options: SearchOptions,
  match: TextMatcher,
  context: EntitySearchContext): SearchHit[] {

  const hits: SearchHit[] = [];
  const matches = (text: string | undefined | null) => !!text && match(text).length > 0;
  const relationsMatch = (relations: string[]) =>
    relations.some(rel => matches(rel) || matches(getDisplayTextForRelation(rel)));

  const visitProperty = (entityKey: string, property: PropertyInfo, path: string[]) => {
    const target = propertyTarget(entityKey, path);
    if (options.propertyNames && matches(property.name)) {
      hits.push({ target, field: 'name', entityKey });
    }
    if (options.propertyValues && property.value !== null && typeof property.value !== 'object' && matches(String(property.value))) {
      hits.push({ target, field: 'value', entityKey });
    }
    getChildProperties(property)?.forEach(child => visitProperty(entityKey, child, [...path, child.name]));
  };

  const visitEntity = (current: ISirenClientObject, entityKey: string, isRoot: boolean) => {
    // An embedded entity's title and classes are rendered in its panel header (see visitEmbedded)
    if (isRoot && options.titles) {
      if (matches(current.title)) {
        hits.push({ target: entityTitleTarget(entityKey), field: 'title', entityKey });
      }
      if (context.showClasses && matches(current.classes.join(','))) {
        hits.push({ target: entityClassesTarget(entityKey), field: 'classes', entityKey });
      }
    }

    current.properties.forEach(property => visitProperty(entityKey, property, [property.name]));

    if (options.linkRelations) {
      current.links.forEach((link, index) => {
        if (relationsMatch(link.relations)) {
          hits.push({ target: linkTarget(entityKey, index), field: 'rel', entityKey });
        }
      });
    }

    if (options.actions) {
      current.actions.forEach((action, index) => {
        if (matches(action.title) || matches(action.name)) {
          hits.push({ target: actionTarget(entityKey, index), field: 'title', entityKey });
        }
      });
    }

    current.embeddedEntities.forEach((embedded, index) => {
      const childKey = embeddedEntityKey(entityKey, index);
      visitHeader(embeddedHeaderTarget(childKey), embedded, entityKey);
      visitEntity(embedded, childKey, false);
    });

    current.embeddedLinkEntities.forEach((linkEntity, index) => {
      visitHeader(embeddedLinkEntityTarget(entityKey, index), linkEntity, entityKey);
    });
  };

  const visitHeader = (
    target: string,
    embedded: { relations: string[], title: string, classes: string[] },
    parentKey: string) => {
    if (options.embeddedRelations && relationsMatch(embedded.relations)) {
      hits.push({ target, field: 'rel', entityKey: parentKey });
    }
    if (options.titles && matches(embedded.title)) {
      hits.push({ target, field: 'title', entityKey: parentKey });
    }
    if (options.titles && context.showClasses && matches(embedded.classes.join(','))) {
      hits.push({ target, field: 'classes', entityKey: parentKey });
    }
  };

  visitEntity(entity, rootEntityKey, true);
  return hits;
}
