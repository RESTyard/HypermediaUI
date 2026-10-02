import { Component, computed, effect, inject, input, Input, OnChanges, signal, SimpleChanges } from '@angular/core';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { PropertyInfo, PropertyTypes } from '../siren-parser/property-info';
import { EntitySearchService } from '../search/entity-search.service';
import { getChildProperties, propertyTarget, rootEntityKey } from '../search/entity-search';

interface PropertyFlatNode {
  expandable: boolean;
  name: string;
  value: any;
  preview?: string;
  type: PropertyTypes;
  level: number;
  searchTarget: string;
}

@Component({
  selector: 'app-property-tree',
  templateUrl: './property-tree.component.html',
  styleUrls: ['./property-tree.component.scss'],
  standalone: false
})
export class PropertyTreeComponent implements OnChanges {
  protected search = inject(EntitySearchService);

  @Input() propertyContainer: PropertyInfo[] = [];
  @Input() showHeader: boolean = true;
  readonly entityKey = input(rootEntityKey);
  public propertyTypes = PropertyTypes;

  public hasExpandableItems: boolean = false;

  // the flattener only passes the node and its level, so the property path is tracked here
  private propertyPaths = new WeakMap<PropertyInfo, string[]>();
  private readonly nodes = signal<PropertyFlatNode[]>([]);

  /** Nodes that contain a search hit further down; they are expanded to reveal it. */
  readonly ancestorMatches = computed(() => {
    const ancestors = new Set<PropertyFlatNode>();
    const nodes = this.nodes();
    nodes.forEach((node, index) => {
      if (!this.search.isHitTarget(node.searchTarget)) return;
      let currentLevel = node.level;
      for (let i = index - 1; i >= 0 && currentLevel > 0; i--) {
        if (nodes[i].level < currentLevel) {
          ancestors.add(nodes[i]);
          currentLevel = nodes[i].level;
        }
      }
    });
    return ancestors;
  });

  constructor() {
    effect(() => this.ancestorMatches().forEach(node => this.treeControl.expand(node)));
  }

  private _transformer = (node: PropertyInfo, level: number): PropertyFlatNode => {
    return {
      expandable: node.type === PropertyTypes.object || node.type === PropertyTypes.array,
      name: node.name,
      value: node.value,
      preview: this.getPreview(node),
      type: node.type,
      level: level,
      searchTarget: propertyTarget(this.entityKey(), this.propertyPaths.get(node) ?? [node.name]),
    };
  };

  private getPreview(node: PropertyInfo): string | undefined {
    if (node.type !== PropertyTypes.array || !Array.isArray(node.value)) {
      return undefined;
    }

    const arr = node.value as any[];
    if (arr.length === 0) {
      return undefined;
    }

    const isPrimitive = (val: any) =>
      val === null ||
      typeof val === 'string' ||
      typeof val === 'number' ||
      typeof val === 'boolean';

    if (arr.every(isPrimitive)) {
      const limit = 10;
      const previewItems = arr.slice(0, limit);
      let previewString = previewItems.map(v => v === null ? 'null' : JSON.stringify(v)).join(', ');

      if (arr.length > limit) {
        previewString += ', ...';
      }

      return `[${previewString}]`;
    }

    return undefined;
  }

  treeControl = new FlatTreeControl<PropertyFlatNode>(
    node => node.level,
    node => node.expandable
  );

  treeFlattener = new MatTreeFlattener(
    this._transformer,
    node => node.level,
    node => node.expandable,
    (node: PropertyInfo) => this.getChildPropertiesWithPath(node)
  );

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  ngOnChanges(changes: SimpleChanges) {
    if (changes['propertyContainer'] && this.propertyContainer) {
      this.dataSource.data = this.propertyContainer;
      this.nodes.set(this.treeControl.dataNodes);
      this.hasExpandableItems = this.checkForExpandable(this.propertyContainer);
    }
  }

  private checkForExpandable(nodes: PropertyInfo[]): boolean {
    if (!nodes) return false;
    return nodes.some(node =>
      node.type === PropertyTypes.object || node.type === PropertyTypes.array
    );
  }

  private getChildPropertiesWithPath(node: PropertyInfo): PropertyInfo[] | null {
    const children = getChildProperties(node);
    const path = this.propertyPaths.get(node) ?? [node.name];
    children?.forEach(child => this.propertyPaths.set(child, [...path, child.name]));
    return children;
  }

  expandAll() { this.treeControl.expandAll(); }
  collapseAll() { this.treeControl.collapseAll(); }
  hasChild = (_: number, node: PropertyFlatNode) => node.expandable;
}
