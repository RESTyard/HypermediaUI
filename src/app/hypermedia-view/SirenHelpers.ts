import { SirenClientObject } from './siren-parser/siren-client-object';
import { HypermediaLink } from './siren-parser/hypermedia-link';


export class SirenHelpers {

  // case insensitive
  public static getFirstLinkByRelation(sirenClientObject: SirenClientObject, rel: string): HypermediaLink {
    const relLowerCase = rel.toLowerCase();

    let result: HypermediaLink = null;
    sirenClientObject.links.forEach(l => {
      const resultIndex = l.relations.findIndex(r => relLowerCase === r.toLowerCase());
      if (resultIndex !== -1) {
        result = l;
        return;
      }
    });

    return result;
  }
}
