import { HypermediaAction } from './hypermedia-action';

describe('HypermediaAction', () => {
  let action: HypermediaAction;

  beforeEach(() => {
    action = new HypermediaAction();
  });

  it('should not be destructive by default', () => {
    expect(action.isDestructive()).toBeFalse();
  });

  it('should be destructive if "Destructive" class is present', () => {
    action.classes.push('Destructive');
    expect(action.isDestructive()).toBeTrue();
  });

  it('should not be destructive if other classes are present but not "Destructive"', () => {
    action.classes.push('Other');
    expect(action.isDestructive()).toBeFalse();
  });

  it('should be destructive if "Destructive" class is present along with other classes', () => {
    action.classes.push('Other');
    action.classes.push('Destructive');
    expect(action.isDestructive()).toBeTrue();
  });
});
