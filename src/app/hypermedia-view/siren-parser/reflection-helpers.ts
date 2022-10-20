export class ReflectionHelpers {

  static hasProperty(obj: object, propertyName: string): boolean {
    if (obj.hasOwnProperty(propertyName)) {
      return true;
    }
    return false;
  }

  static hasFilledProperty(obj: object, propertyName: string): boolean {
    if (this.hasProperty(obj, propertyName) && obj[propertyName]) {
      return true;
    }

    return false;
  }

  static hasFilledArrayProperty(obj: object, propertyName: string): boolean {
    if (this.hasFilledProperty(obj, propertyName) && Array.isArray(obj[propertyName])) {
      return true;
    }

    return false;
  }

}
