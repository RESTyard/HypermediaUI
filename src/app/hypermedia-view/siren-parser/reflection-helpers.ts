export class ReflectionHelpers {

  static hasProperty(obj: object, propertyName: string): boolean {
    return obj.hasOwnProperty(propertyName);
  }

  static hasFilledProperty(obj: any, propertyName: string): boolean {
    if (this.hasProperty(obj, propertyName) && obj[propertyName]) {
      return true;
    }

    return false;
  }

  static hasFilledArrayProperty(obj: any, propertyName: string): boolean {
    if (this.hasFilledProperty(obj, propertyName) && Array.isArray(obj[propertyName])) {
      return true;
    }

    return false;
  }

}
