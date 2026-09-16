import { PropertyTreeComponent } from './property-tree.component';
import { PropertyInfo, PropertyTypes } from '../siren-parser/property-info';

describe('PropertyTreeComponent', () => {
  function createComponent() {
    const component = new PropertyTreeComponent();
    component.propertyContainer = [
      new PropertyInfo('customer', { name: 'Ada Lovelace', address: { city: 'London' } }, PropertyTypes.object),
    ];
    component.ngOnChanges({ propertyContainer: {} as any });
    return component;
  }

  it('reveals a matching nested property and marks its ancestor', () => {
    const component = createComponent();
    component.applyFilter({ target: { value: 'london' } } as unknown as Event);

    expect(component.matchCount).toBe(1);
    expect(component.currentMatchIndex).toBe(0);
    expect(component.treeControl.isExpanded(component.treeControl.dataNodes[0])).toBeTrue();
  });

  it('clears match state when the search is cleared', () => {
    const component = createComponent();
    component.applyFilter({ target: { value: 'ada' } } as unknown as Event);
    component.clearSearch();

    expect(component.searchQuery).toBe('');
    expect(component.matchCount).toBe(0);
    expect(component.currentMatchIndex).toBe(-1);
    expect(component.directMatches.size).toBe(0);
    expect(component.ancestorMatches.size).toBe(0);
  });
});
