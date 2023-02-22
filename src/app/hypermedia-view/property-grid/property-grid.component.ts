import { Component, OnInit, Input } from '@angular/core';
import { GeneralSettings } from 'src/app/settings/services/AppSettings';
import { PropertyInfo, PropertyTypes } from '../siren-parser/property-info';

@Component({
  selector: 'app-property-grid',
  templateUrl: './property-grid.component.html',
  styleUrls: ['./property-grid.component.scss']
})
export class PropertyGridComponent implements OnInit {
  @Input() propertyContainer: PropertyInfo[] = [];
  @Input() generalSettings: GeneralSettings = new GeneralSettings();

  public propertyTypes = PropertyTypes;

  constructor() { }

  ngOnInit() {
  }

  IsPrimitiveArray(array: any): boolean {
    if (!array) {
      return true;
    }

    for (const item of array) {
      const itemType = typeof item;
      if (itemType !== 'number' && itemType !== 'boolean' && itemType !== 'string') {
        return false;
      }
    }

    return true;
  }

  // todo merge functionality with similar one found in deserializeProperties()
  GetObjectPropertyInfos(object: any): any {
    const result = new Array<PropertyInfo>();

    if (!object) {
      return result;
    }

    for (const property in object) {
      if (!object.hasOwnProperty(property)) {
        continue;
      }

      const value = object[property];
      const propertyType = typeof value;


      if (value === null) {
        result.push(new PropertyInfo(property, value, PropertyTypes.nullvalue));
        continue;
      }

      switch (propertyType) {
        case 'number':
          result.push(new PropertyInfo(property, value, PropertyTypes.number));
          break;

        case 'boolean':
          result.push(new PropertyInfo(property, value, PropertyTypes.boolean));
          break;

        case 'string':
          result.push(new PropertyInfo(property, value, PropertyTypes.string));
          break;

        case 'object':
          if (Array.isArray(value)) {
            result.push(new PropertyInfo(property, value, PropertyTypes.array));
          } else {
            result.push(new PropertyInfo(property, value, PropertyTypes.object));
          }

          break;

        case 'undefined':
        case 'function':
        case 'symbol':
        default:
          continue;
      }
    }

    return result;
  }
}
