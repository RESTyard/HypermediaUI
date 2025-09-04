import { Injectable } from '@angular/core';
import {map, Observable, of, share} from 'rxjs';



@Injectable()
export class ObservableLruCache<T> {
  private cacheItems: Map<string, CacheItem<T>> = new Map<string, CacheItem<T>>();
  private maxEntries = 30;

  public getItem(key: string): Observable<T> | null {

    const hasKey = this.cacheItems.has(key);
    let item: CacheItem<T> | undefined = undefined;
    if (hasKey) {
      // peek the entry, re-insert for LRU strategy
      item = this.cacheItems.get(key)!;
      this.cacheItems.delete(key);
      this.cacheItems.set(key, item);
    }

    if (item) {
      return item.getValue();
    }

    return null;
  }

  public addItem(key: string, value: Observable<T>): Observable<T> {
    // least-recently used cache eviction strategy
    if (this.cacheItems.size >= this.maxEntries) {
      const keyToDelete = this.cacheItems.keys().next().value;

      if (keyToDelete) {
        this.cacheItems.delete(keyToDelete);
      }
    }

    const newItem = new CacheItem<T>();
    const valueStream = newItem.setValue(value);
    this.cacheItems.set(key, newItem);

    return valueStream;
  }
}

class CacheItem<T> {
  value: T | null = null;
  valueSource: Observable<T> | null = null;

  setValue(valueSource: Observable<T>): Observable<T> {
    this.valueSource = valueSource
      .pipe(
        map(result => {
          this.value = result;
          this.valueSource = null;
          return result;
        }),
        share()
      ); // multiple subscriptions are possible while still requesting

    return this.valueSource;
  }

  getValue(): Observable<T> {
    if (this.value) {
      return of(this.value);
    } else if (this.valueSource) {
      return this.valueSource;
    } else {
      return of();
    }
  }
}
