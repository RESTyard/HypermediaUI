import {Header} from '../interface/headers';
import {EncryptionService} from './encryption.service';
import {Injectable} from '@angular/core';

@Injectable()
export class SettingsService {

  static readonly HEADERS = "headers";
  static readonly SITE_HEADERS = "siteHeaders";
  static readonly ENTRY_POINTS = "entryPoints";

  constructor(private encryptionService: EncryptionService) {}
  public setHeaders(headers: {}, site: string | null = null) {
    if(site === null) {
      localStorage.setItem(SettingsService.HEADERS, this.encryptionService.encrypt(JSON.stringify(headers)));
    } else {
      let currentSites = {...this.getSitesWithHeaders()};
      currentSites[site] = headers;
      localStorage.setItem(SettingsService.SITE_HEADERS, this.encryptionService.encrypt(JSON.stringify(currentSites)));
    }
  }

  getHeaders(site: string | null = null): Header[] {
    let headers: Header[] = [];
    try{
        const headersRaw = site === null ?
            JSON.parse(this.encryptionService.decrypt(localStorage.getItem(SettingsService.HEADERS))) :
            JSON.parse(this.encryptionService.decrypt(localStorage.getItem(SettingsService.SITE_HEADERS)))[site];
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
    localStorage.setItem(SettingsService.SITE_HEADERS, this.encryptionService.encrypt(JSON.stringify(currentSites)));
  }

  getSites(): string[] {
    return Object.keys(this.getSitesWithHeaders());
  }

  getSitesWithHeaders(): {} {
    let sites = {};
    try{
        sites = JSON.parse(this.encryptionService.decrypt(localStorage.getItem(SettingsService.SITE_HEADERS)));
    } catch (e){
      console.log("Invalid object.")
    }
    console.log(sites)
    return sites;
  }

  saveEntryPoint(url: string) {
    let recentEntryPoints = this.getEntryPoints();
    try {
      const index = recentEntryPoints.indexOf(url);
      if(index != -1) {
        recentEntryPoints.splice(index, 1);
      }
      if(recentEntryPoints.length >= 5) {
        recentEntryPoints.shift();
      }
      recentEntryPoints.push(url);
      localStorage.setItem(SettingsService.ENTRY_POINTS, JSON.stringify(recentEntryPoints));
    } catch (e) {}
  }

  getEntryPoints(): string[] {
    try {
      return JSON.parse(localStorage.getItem(SettingsService.ENTRY_POINTS)) ?? [];
    } catch (e) {
      return [];
    }
  }

}
