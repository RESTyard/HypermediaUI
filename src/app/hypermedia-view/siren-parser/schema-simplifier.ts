import { find } from 'simple-object-query';

export class SchemaSimplifier {
  simplifySchema(response: any) {
    // normalize schema so ui component can render propperly, if component improves this may be vanish:
    // oneOf: not handled-> will not show

    this.fixNullablesInOneOf(response);

    // sub schemas, definitions + ref: not resolved
    this.resolveLocalReferences(response); // formly is capable of references so we could remove, but ther is an issue with arrays
    this.flatenOneOf(response);

    // format: unknown "int32", "int64"
    this.fixUnknownFormats(response);
    this.simplifyAnyOf(response);

    // angular2-json-schema-form: 0.7.0-alpha.1 leaves schema version in schema object when translating from schema 4 to 6
    // until fixed remove schema version
    this.removeSchemaSpecification(response);
    this.simplifyPrefixItems(response);
  }

  private removeSchemaSpecification(schema: any) {
    const schemaProeprty = '$schema';
    if (schema.hasOwnProperty(schemaProeprty)) {
      delete schema[schemaProeprty];
    }
  }

  private fixUnknownFormats(object: any) {
    for (const propertyName in object) {
      if (!object.hasOwnProperty(propertyName)) {
        continue;
      }

      if (
        propertyName === 'format' &&
        (object[propertyName] === 'int32' || object[propertyName] === 'int64')
      ) {
        delete object[propertyName];
      }

      // recursion
      if (typeof object[propertyName] === 'object') {
        this.fixUnknownFormats(object[propertyName]);
      }
    }
  }

  private flatenOneOf(schema: any) {
    const properties = schema.properties;
    if (!properties) {
      return;
    }

    for (const propertyName in properties) {
      if (!properties.hasOwnProperty(propertyName)) {
        continue;
      }

      const oneOf = properties[propertyName].oneOf;
      if (oneOf && Array.isArray(oneOf)) {
        if (oneOf.length > 1) {
          throw new Error(
            'Can not flatten oneOf in schema because mre than one element remaining.',
          );
        }

        const containedSchema = oneOf[0];
        delete properties[propertyName].oneOf;
        if (!containedSchema) {
          continue;
        }

        properties[propertyName] = containedSchema;

        // recursion
        this.flatenOneOf(properties[propertyName]);
      }
    }
  }

  private fixNullablesInOneOf(schema: any, parent: any = null) {
    if (typeof schema !== 'object' || schema === null) {
      return;
    }
    if (schema.hasOwnProperty('oneOf') && Array.isArray(schema.oneOf)) {
      let originalLength = schema.oneOf.length;
      schema.oneOf = schema.oneOf.filter((item: any) => item.type !== 'null');
      let nullWasRemoved = schema.oneOf.length != originalLength;
      if (schema.oneOf.length === 1) {
        let oneOf = schema.oneOf[0];
        delete schema.oneOf;
        let key = Object.keys(parent).find((key) => parent[key] === schema);
        if (!key) {
          console.log(`Could not minify oneof`);
        } else {
          parent[key] = oneOf;
          // preserve nullable
          parent[key].type = [parent[key].type, 'null'];
        }
      } else if (nullWasRemoved) {
        console.log(
          `Removed null from property as workaround (oneof null ablitity)`,
        );
      }
    }

    // Recursion
    for (const key in schema) {
      if (Object.prototype.hasOwnProperty.call(schema, key)) {
        this.fixNullablesInOneOf(schema[key], schema);
      }
    }
  }

  private resolveLocalReferences(schema: any) {
    // could have replaced a ref with something that contained a ref
    let iteration = 0;
    const maxTrys = 50;
    while (iteration < maxTrys) {
      const foundRefs = <Array<any>>find(schema, {
        $ref: /\.*/,
      });

      if (foundRefs.length === 0) {
        break;
      }

      this.ReplaceRefs(foundRefs, schema);

      iteration++;
    }
    if (iteration === maxTrys) {
      console.error(`Could not resolve all schema refs in ${maxTrys} trys.`);
      return;
    }

    delete schema.definitions;
    return;
  }

  private ReplaceRefs(foundRefs: any[], schema: any) {
    foundRefs.forEach((refParent) => {
      // inline subschema keyword used in draft 2019-09
      if (schema.$defs) {
        const defsKey = (<string>refParent.$ref).replace('#/$defs/', '');
        const defsReplacement = schema.$defs[defsKey];
        if (defsReplacement) {
          delete refParent.$ref;
          Object.assign(refParent, defsReplacement);
          return;
        }
      }

      // inline subschema keyword used in drafts 06 and 07
      if (schema.definitions) {
        const definitionsKey = (<string>refParent.$ref).replace(
          '#/definitions/',
          '',
        );
        const definitionsReplacement = schema.definitions[definitionsKey];
        if (definitionsReplacement) {
          delete refParent.$ref;
          Object.assign(refParent, definitionsReplacement);
          return;
        }
      }

      throw new Error(`Can not resolve schema reference: ${refParent.$ref}`);
    });
  }

  private simplifyAnyOf(schema: any): void {
    if (typeof schema !== 'object' || schema === null) {
      return;
    }

    if (schema.hasOwnProperty('anyOf')) {
      // if anyOf contains both number and integer, simplify to just number
      let anyOfNumber = schema.anyOf.filter((s: any) => s.type === 'number');
      let anyOfInteger = schema.anyOf.filter((s: any) => s.type === 'integer');
      if (anyOfNumber.length > 0 && anyOfInteger.length > 0) {
        schema['type'] = 'number';
        delete schema.anyOf;
      } else {
        // formly requires type object to diplay the type selector nad value input
        schema['type'] = 'object';
      }
    }

    for (const propertyName in schema) {
      // Recursive call for each property
      this.simplifyAnyOf(schema[propertyName]);
    }
  }

  // formly does not support "prefixItems" property (introduced in json schema draft version 2020-12), so we replace it with "items" as used in previous versions
  private simplifyPrefixItems(schema: any) {
    if (schema === null) {
      return;
    }

    if (schema.hasOwnProperty('prefixItems')) {
      if (schema.hasOwnProperty('items')) {
        schema['additionalItems'] = schema['items'];
        delete schema['items'];
      }
      schema['items'] = schema['prefixItems'];
      delete schema['prefixItems'];
    }

    // recursively call for all properties of the schema
    for (const prop in schema) {
      if (typeof schema[prop] === 'object') {
        this.simplifyPrefixItems(schema[prop]);
      }
    }
  }
}
