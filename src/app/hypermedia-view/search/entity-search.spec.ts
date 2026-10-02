import { collectEntityHits, defaultSearchOptions, SearchOptions } from './entity-search';
import { createMatcher, TextMatcher } from './search-matcher';
import { SirenClientObject } from '../siren-parser/siren-client-object';
import { EmbeddedEntity } from '../siren-parser/embedded-entity';
import { EmbeddedLinkEntity } from '../siren-parser/embedded-link-entity';
import { PropertyInfo, PropertyTypes } from '../siren-parser/property-info';
import { HypermediaLink } from '../siren-parser/hypermedia-link';
import { HypermediaAction } from '../siren-parser/hypermedia-action';
import { relationDisplayTextMapping, updateMappingsDisplayTextMappings } from '../display-text-mapping';

describe('collectEntityHits', () => {
  const allScopes: SearchOptions = {
    ...defaultSearchOptions,
    linkRelations: true,
    embeddedRelations: true,
    actions: true,
  };

  function matcher(query: string, caseSensitive = false, regex = false): TextMatcher {
    const result = createMatcher(query, caseSensitive, regex);
    if (result.kind !== 'valid') throw new Error('expected a valid matcher');
    return result.match;
  }

  function createOrder(): SirenClientObject {
    const order = new SirenClientObject();
    order.title = 'Order';
    order.properties = [
      new PropertyInfo('customer', { name: 'Ada', address: { city: 'London' } }, PropertyTypes.object),
    ];
    order.links = [new HypermediaLink(['self'], 'https://api/order/1', 'application/vnd.siren+json')];
    const cancel = new HypermediaAction();
    cancel.name = 'CancelOrder';
    cancel.title = 'Cancel';
    order.actions = [cancel];

    const item = new EmbeddedEntity();
    item.relations = ['item'];
    item.title = 'Line item';
    item.properties = [new PropertyInfo('product', 'London Fog Tea', PropertyTypes.string)];
    order.embeddedEntities = [item];

    const invoice = new EmbeddedLinkEntity();
    invoice.relations = ['invoice'];
    invoice.title = 'Invoice';
    order.embeddedLinkEntities = [invoice];
    return order;
  }

  afterEach(() => {
    Object.keys(relationDisplayTextMapping).forEach(key => delete relationDisplayTextMapping[key]);
  });

  it('finds nested property values in render order, including embedded entities', () => {
    const hits = collectEntityHits(createOrder(), defaultSearchOptions, matcher('london'), { showClasses: false });

    expect(hits).toEqual([
      { target: 'e|p|customer/address/city', field: 'value', entityKey: 'e' },
      { target: 'e.0|p|product', field: 'value', entityKey: 'e.0' },
    ]);
  });

  it('finds titles of the entity, embedded entities and embedded links', () => {
    const hits = collectEntityHits(createOrder(), defaultSearchOptions, matcher('i'), { showClasses: false })
      .filter(hit => hit.field === 'title');

    expect(hits.map(hit => hit.target)).toEqual(['e.0|header', 'e|le|0']);
  });

  it('finds link, embedded and action relations only when enabled', () => {
    const order = createOrder();

    expect(collectEntityHits(order, defaultSearchOptions, matcher('self'), { showClasses: false })).toEqual([]);
    expect(collectEntityHits(order, allScopes, matcher('self'), { showClasses: false }))
      .toEqual([{ target: 'e|l|0', field: 'rel', entityKey: 'e' }]);
    expect(collectEntityHits(order, allScopes, matcher('cancelorder'), { showClasses: false }))
      .toEqual([{ target: 'e|a|0', field: 'title', entityKey: 'e' }]);
    expect(collectEntityHits(order, allScopes, matcher('invoice'), { showClasses: false }).map(hit => hit.field))
      .toEqual(['rel', 'title']);
  });

  it('finds a relation by its mapped display text', () => {
    updateMappingsDisplayTextMappings({ item: 'Position' });

    const hits = collectEntityHits(createOrder(), allScopes, matcher('position'), { showClasses: false });

    expect(hits).toEqual([{ target: 'e.0|header', field: 'rel', entityKey: 'e' }]);
  });

  it('matches classes only while they are shown', () => {
    const order = createOrder();
    order.classes = ['OrderClass'];

    expect(collectEntityHits(order, defaultSearchOptions, matcher('orderclass'), { showClasses: false })).toEqual([]);
    expect(collectEntityHits(order, defaultSearchOptions, matcher('orderclass'), { showClasses: true }))
      .toEqual([{ target: 'e|classes', field: 'classes', entityKey: 'e' }]);
  });

  it('respects case sensitivity and regular expressions', () => {
    const order = createOrder();

    expect(collectEntityHits(order, defaultSearchOptions, matcher('london', true), { showClasses: false })).toEqual([]);
    expect(collectEntityHits(order, defaultSearchOptions, matcher('^Lon.*Tea$', false, true), { showClasses: false }))
      .toEqual([{ target: 'e.0|p|product', field: 'value', entityKey: 'e.0' }]);
  });
});

describe('createMatcher', () => {
  it('reports an invalid regular expression', () => {
    expect(createMatcher('(', false, true).kind).toBe('invalid');
  });

  it('treats regex characters literally when regex is off', () => {
    const result = createMatcher('a.b', false, false);
    if (result.kind !== 'valid') throw new Error('expected a valid matcher');

    expect(result.match('axb a.b')).toEqual([{ start: 4, end: 7 }]);
  });

  it('skips zero-length matches', () => {
    const result = createMatcher('x*', false, true);
    if (result.kind !== 'valid') throw new Error('expected a valid matcher');

    expect(result.match('axxb')).toEqual([{ start: 1, end: 3 }]);
  });
});
