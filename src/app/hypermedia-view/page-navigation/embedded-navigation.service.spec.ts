import { TestBed } from '@angular/core/testing';
import { EmbeddedNavigationService } from './embedded-navigation.service';

describe('EmbeddedNavigationService', () => {
  let navigation: EmbeddedNavigationService;

  beforeEach(() => {
    navigation = TestBed.inject(EmbeddedNavigationService);
    navigation.reset();
    navigation.setItemCount(3);
  });

  it('goes to the first item on the first step down', () => {
    expect(navigation.canGoPrevious()).toBeFalse();

    navigation.next();

    expect(navigation.currentIndex()).toBe(0);
  });

  it('stops at the first and the last item', () => {
    navigation.select(2);
    navigation.next();
    expect(navigation.currentIndex()).toBe(2);

    navigation.select(0);
    navigation.previous();
    expect(navigation.currentIndex()).toBe(0);
  });

  it('continues from a selected item', () => {
    navigation.select(1);

    navigation.next();

    expect(navigation.currentIndex()).toBe(2);
  });

  it('makes the first item current at the top and the last at the bottom', () => {
    navigation.toBottom();
    expect(navigation.currentIndex()).toBe(2);

    navigation.toTop();
    expect(navigation.currentIndex()).toBe(0);
  });

  it('keeps the current item when the count is updated, unless it no longer exists', () => {
    navigation.select(1);
    navigation.setItemCount(3);
    expect(navigation.currentIndex()).toBe(1);

    navigation.setItemCount(1);
    expect(navigation.currentIndex()).toBe(-1);
  });
});
