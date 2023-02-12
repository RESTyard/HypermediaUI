import {Header} from './interface/headers';

export class SettingsService {

  static readonly HEADERS = "headers";
  public setHeaders(headers: {}){
    localStorage.setItem(SettingsService.HEADERS, JSON.stringify(headers));
  }
  public getHeaders(): Header[]{
    let headers: Header[] = [];
    try{
      const headersRaw = JSON.parse(localStorage.getItem(SettingsService.HEADERS));
      let keys = Object.keys(headersRaw);
      headers = keys.map(x => ({
        key: x, value: headersRaw[x]
      } as Header));
    } catch (e){
      console.log("Invalid headers object.")
    }
    return headers;
  }
}
