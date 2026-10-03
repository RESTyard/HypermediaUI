import { TestBed } from '@angular/core/testing';
import { PropertyTreeComponent } from './property-tree.component';
import { PropertyInfo, PropertyTypes } from '../siren-parser/property-info';
import { EntitySearchService } from '../search/entity-search.service';
import { SirenClientObject } from '../siren-parser/siren-client-object';

describe('PropertyTreeComponent', () => {
  const properties = [
    new PropertyInfo('customer', { name: 'Ada Lovelace', address: { city: 'London' } }, PropertyTypes.object),
  ];

  function createComponent() {
    const search = TestBed.inject(EntitySearchService);
    const entity = new SirenClientObject();
    entity.properties = properties;
    search.setEntity(entity);

    const component = TestBed.runInInjectionContext(() => new PropertyTreeComponent());
    component.propertyContainer = properties;
    component.ngOnChanges({ propertyContainer: {} as any });
    return { component, search };
  }

  function nodeNamed(component: PropertyTreeComponent, name: string) {
    return component.treeControl.dataNodes.find(node => node.name === name)!;
  }

  it('expands the ancestors of a matching nested property', () => {
    const { component, search } = createComponent();

    search.query.set('london');
    TestBed.tick();

    expect(search.isHitTarget(nodeNamed(component, 'city').searchTarget)).toBeTrue();
    expect(component.treeControl.isExpanded(nodeNamed(component, 'customer'))).toBeTrue();
    expect(component.treeControl.isExpanded(nodeNamed(component, 'address'))).toBeTrue();
  });

  it('keeps expanded nodes open when the search is cleared', () => {
    const { component, search } = createComponent();
    search.query.set('london');
    TestBed.tick();

    search.clear();
    TestBed.tick();

    expect(component.ancestorMatches().size).toBe(0);
    expect(component.treeControl.isExpanded(nodeNamed(component, 'customer'))).toBeTrue();
  });
});
