import {httpMethodIconMapping} from "./icon-mapping";

export let relationDisplayTextMapping: Record<string, string> = {}

export function getDisplayTextForRelation(relation: string): string {
  const mapping = relationDisplayTextMapping[relation.toLowerCase()];
  return mapping ?? relation;
}

export function updateMappingsDisplayTextMappings(relationOverrides?: Record<string, string>) {
  if (relationOverrides && Object.keys(relationOverrides).length > 0) {
    relationDisplayTextMapping = relationOverrides;
  }
}
