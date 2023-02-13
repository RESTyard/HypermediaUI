import {Header} from './interface/headers';
import {EncryptionService} from './encryption.service';
import {Injectable} from '@angular/core';

@Injectable()
export class SettingsService {

  static readonly HEADERS = "headers";

  constructor(private encryptionService: EncryptionService) {}
  public setHeaders(headers: {}){
    localStorage.setItem(SettingsService.HEADERS, this.encryptionService.encrypt(JSON.stringify(headers)));
  }
  public getHeaders(): Header[]{
    let headers: Header[] = [];
    try{
      const headersRaw = JSON.parse(this.encryptionService.decrypt(localStorage.getItem(SettingsService.HEADERS)));
      let keys = Object.keys(headersRaw);
      headers = keys
        .filter(x => x.trim() != '' && headersRaw[x].trim() != '')
        .map(x => ({
        key: x, value: headersRaw[x]
      } as Header));
    } catch (e){
      console.log("Invalid headers object.")
    }
    return headers;
  }
}
