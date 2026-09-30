import { Injectable } from '@angular/core';

/**
 * Origins known to be backed by a BFF. Only requests to these origins are sent with credentials,
 * because credentialed CORS requests are rejected by servers answering with `Access-Control-Allow-Origin: *`.
 */
@Injectable({ providedIn: 'root' })
export class BffOriginsService {
  private readonly origins = new Set<string>();

  add(url: string): void {
    this.origins.add(new URL(url).origin);
  }

  has(url: string): boolean {
    return URL.canParse(url) && this.origins.has(new URL(url).origin);
  }
}
