import { TestBed } from '@angular/core/testing';
import { EntitySearchService } from './entity-search.service';
import { SirenClientObject } from '../siren-parser/siren-client-object';
import { PropertyInfo, PropertyTypes } from '../siren-parser/property-info';

describe('EntitySearchService', () => {
  let search: EntitySearchService;

  function entityWithValues(...values: string[]): SirenClientObject {
    const entity = new SirenClientObject();
    entity.properties = values.map((value, i) => new PropertyInfo(`p${i}`, value, PropertyTypes.string));
    return entity;
  }

  beforeEach(() => {
    search = TestBed.inject(EntitySearchService);
    search.clear();
  });

  it('applies typed text after the debounce', () => {
    jasmine.clock().install();
    try {
      search.setEntity(entityWithValues('apple'));
      search.setInputText('app');

      expect(search.hits().length).toBe(0);
      jasmine.clock().tick(EntitySearchService.debounceMs);
      expect(search.hits().length).toBe(1);
    } finally {
      jasmine.clock().uninstall();
    }
  });

  it('goes to the first hit when Enter is pressed before the debounce elapsed', () => {
    search.setEntity(entityWithValues('apple', 'pineapple'));
    search.setInputText('apple');

    search.next();

    expect(search.query()).toBe('apple');
    expect(search.currentIndex()).toBe(0);
  });

  it('wraps around when stepping through hits', () => {
    search.setEntity(entityWithValues('apple', 'pineapple'));
    search.query.set('apple');

    search.previous();
    expect(search.currentIndex()).toBe(1);
    search.next();
    expect(search.currentIndex()).toBe(0);
  });

  it('keeps the query and restarts at the first hit when the entity changes', () => {
    search.setEntity(entityWithValues('apple', 'pineapple'));
    search.query.set('apple');
    search.next();

    search.setEntity(entityWithValues('crab apple', 'apple pie', 'apple'));

    expect(search.hits().length).toBe(3);
    expect(search.currentIndex()).toBe(0);
  });

  it('searches the raw json as plain text in raw mode', () => {
    search.setRawObject({ name: 'apple' });
    search.rawMode.set(true);
    search.query.set('"name"');

    expect(search.hits().length).toBe(1);
    expect(search.rawSegments()!.filter(segment => segment.target).map(segment => segment.text)).toEqual(['"name"']);
  });

  it('has no hits for an invalid regular expression', () => {
    search.setEntity(entityWithValues('apple'));
    search.setOptions({ ...search.options(), regex: true });
    search.query.set('(');

    expect(search.queryError()).toBeDefined();
    expect(search.hits()).toEqual([]);
  });
});
