import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { PropertyInfo, PropertyTypes } from '../siren-parser/property-info';

interface PropertyFlatNode {
  expandable: boolean;
  name: string;
  value: any;
  type: PropertyTypes;
  level: number;
}

@Component({
  selector: 'app-property-tree',
  templateUrl: './property-tree.component.html',
  styleUrls: ['./property-tree.component.scss'],
  standalone: false
})
export class PropertyTreeComponent implements OnChanges {
  @Input() propertyContainer: PropertyInfo[] = [];
  public propertyTypes = PropertyTypes;

  // search and highlighting states
  public searchQuery: string = '';
  public matchCount: number = 0;
  public directMatches = new Set<PropertyFlatNode>();
  public ancestorMatches = new Set<PropertyFlatNode>();

  public currentMatchIndex: number = -1;
  private matchNodes: PropertyFlatNode[] = [];
  public hasExpandableItems: boolean = false;

  private _transformer = (node: PropertyInfo, level: number): PropertyFlatNode => {
    return {
      expandable: node.type === PropertyTypes.object || node.type === PropertyTypes.array,
      name: node.name,
      value: node.value,
      type: node.type,
      level: level,
    };
  };

  treeControl = new FlatTreeControl<PropertyFlatNode>(
    node => node.level,
    node => node.expandable
  );

  treeFlattener = new MatTreeFlattener(
    this._transformer,
    node => node.level,
    node => node.expandable,
    (node: PropertyInfo) => this.getChildProperties(node)
  );

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  ngOnChanges(changes: SimpleChanges) {
    if (changes['propertyContainer'] && this.propertyContainer) {
      this.dataSource.data = this.propertyContainer;
      this.hasExpandableItems = this.checkForExpandable(this.propertyContainer);
    }
  }

  // search logic and filter
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.searchQuery = filterValue.toLowerCase().trim();
    this.calculateMatchCount();
  }

  private calculateMatchCount() {
    this.directMatches.clear();
    this.ancestorMatches.clear();
    this.currentMatchIndex = -1;

    if (!this.searchQuery) {
      this.matchCount = 0;
      this.matchNodes = [];
      return;
    }

    const nodes = this.treeControl.dataNodes;
    const search = this.searchQuery;

    nodes.forEach((node, index) => {
      // check if name or value matches
      const nameMatch = node.name.toLowerCase().includes(search);
      let valueMatch = false;
      if (node.value !== null && typeof node.value !== 'object') {
        valueMatch = node.value.toString().toLowerCase().includes(search);
      }

      if (nameMatch || valueMatch) {
        this.directMatches.add(node);

        // propagate to parent
        let currentLevel = node.level;
        for (let i = index - 1; i >= 0; i--) {
          const prevNode = nodes[i];
          if (prevNode.level < currentLevel) {
            this.ancestorMatches.add(prevNode);
            currentLevel = prevNode.level;
          }
          if (currentLevel === 0) break;
        }
      }
    });

    this.matchNodes = Array.from(this.directMatches);
    this.matchCount = this.matchNodes.length;
    if (this.matchCount > 0) this.currentMatchIndex = 0;
  }

  handleSearchEnter(event: Event) {
    if (this.matchCount > 0) {
      this.scrollToMatch(this.currentMatchIndex);
      this.currentMatchIndex = (this.currentMatchIndex + 1) % this.matchCount;
    }
  }

  private scrollToMatch(index: number) {
    const targetNode = this.matchNodes[index];
    if (!targetNode) return;

    // search the DOM Element
    const elements = document.querySelectorAll('.property-row');
    const targetElement = Array.from(elements).find(el =>
      el.querySelector('.prop-name')?.textContent?.trim() === targetNode.name + ':'
    );

    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      targetElement.classList.add('pulse-highlight');
      setTimeout(() => targetElement.classList.remove('pulse-highlight'), 1000);
    }
  }

  clearSearch() {
    this.searchQuery = '';
    this.matchCount = 0;
    this.directMatches.clear();
    this.ancestorMatches.clear();
    this.currentMatchIndex = -1;
  }



  private checkForExpandable(nodes: PropertyInfo[]): boolean {
    if (!nodes) return false;
    return nodes.some(node =>
      node.type === PropertyTypes.object || node.type === PropertyTypes.array
    );
  }

  expandAll() { this.treeControl.expandAll(); }
  collapseAll() { this.treeControl.collapseAll(); }
  hasChild = (_: number, node: PropertyFlatNode) => node.expandable;

  private getChildProperties(node: PropertyInfo): PropertyInfo[] | null {
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
}
