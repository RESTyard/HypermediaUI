import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiKeyService {
  private _apiKey: string | null = null;
  set apiKey(value: string | null) {
    this._apiKey = value;
  }

  get apiKey(): string | null {
    return this._apiKey;
  }

  constructor() {
  }
}
