import {Header} from '../interface/headers';
import {Injectable} from '@angular/core';

@Injectable()
export class SettingsService {

  static readonly HEADERS = "headers";
  static readonly SITE_HEADERS = "siteHeaders";

  constructor() {}
  public setHeaders(headers: {}, site: string | null = null) {
    if(site === null) {
      localStorage.setItem(SettingsService.HEADERS, JSON.stringify(headers));
    } else {
      let currentSites = {...this.getSitesWithHeaders()};
      currentSites[site] = headers;
      localStorage.setItem(SettingsService.SITE_HEADERS, JSON.stringify(currentSites));
    }
  }

  getHeaders(site: string | null = null): Header[] {
    let headers: Header[] = [];
    try{
        const headersRaw = site === null ?
            JSON.parse(localStorage.getItem(SettingsService.HEADERS)) :
            JSON.parse(localStorage.getItem(SettingsService.SITE_HEADERS))[site];
        let keys = Object.keys(headersRaw);
        headers = keys
        .filter(x => x.trim() != '' && headersRaw[x].trim() != '')
        .map(x => ({ key: x, value: headersRaw[x] } as Header));
    } catch (e){
        console.log("Invalid object.")
    }
    return headers;
  }

  public setSites(sites: string[]){
    let currentSites = {...this.getSitesWithHeaders()};
    sites.forEach(x => {
      if(!currentSites.hasOwnProperty(x)){
        currentSites[x] = {};
      }
    });
    Object.keys(currentSites).forEach(x => {
      if(!sites.includes(x)){
        delete currentSites[x];
      }
    });
    localStorage.setItem(SettingsService.SITE_HEADERS, JSON.stringify(currentSites));
  }

  getSites(): string[] {
    try {
      return Object.keys(this.getSitesWithHeaders());
    } catch (e) {
      return [];
    }
  }

  getSitesWithHeaders(): {} {
    let sites = {};
    try{
        sites = JSON.parse(localStorage.getItem(SettingsService.SITE_HEADERS));
    } catch (e){}
    return sites;
  }

}
