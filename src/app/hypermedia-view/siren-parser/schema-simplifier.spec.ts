import { SchemaSimplifier } from './schema-simplifier';

describe('SchemaSimplifier', () => {
  it('normalizes nullable references, formats, and draft 2020 tuple schemas', () => {
    const schema: any = {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      definitions: { address: { type: 'string', format: 'int32' } },
      properties: {
        address: { oneOf: [{ $ref: '#/definitions/address' }, { type: 'null' }] },
        tuple: { prefixItems: [{ type: 'string' }], items: false },
      },
    };

    new SchemaSimplifier().simplifySchema(schema);

    expect(schema.$schema).toBeUndefined();
    expect(schema.definitions).toBeUndefined();
    expect(schema.properties.address.type).toEqual(['string', 'null']);
    expect(schema.properties.address.format).toBeUndefined();
    expect(schema.properties.tuple.items).toEqual([{ type: 'string' }]);
    expect(schema.properties.tuple.additionalItems).toBeFalse();
    expect(schema.properties.tuple.prefixItems).toBeUndefined();
  });

  it('simplifies number and integer anyOf combinations to number', () => {
    const schema: any = { properties: { amount: { anyOf: [{ type: 'number' }, { type: 'integer' }] } } };

    new SchemaSimplifier().simplifySchema(schema);

    expect(schema.properties.amount).toEqual({ type: 'number' });
  });
});
