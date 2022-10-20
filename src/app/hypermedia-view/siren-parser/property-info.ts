export class PropertyInfo {
  constructor(public name: string, public value: any, public type: PropertyTypes) { }
}

export enum PropertyTypes {
  nullvalue = 'nullvalue',
  boolean = 'boolean',
  number = 'number',
  string = 'string',
  object = 'object',
  array = 'array'
}
