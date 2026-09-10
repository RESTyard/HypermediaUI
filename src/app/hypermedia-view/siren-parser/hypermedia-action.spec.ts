import { HypermediaAction } from './hypermedia-action';

describe('HypermediaAction', () => {
  let action: HypermediaAction;

  beforeEach(() => {
    action = new HypermediaAction();
  });

  it('should not match any config by default', () => {
    const configs: HypermediaUI.IActionClassConfiguration[] = [
      { actionClass: 'destructive', title: 'T', message: 'M', icon: 'I' }
    ];
    expect(action.getConfigurations(configs).length).toBe(0);
  });

  it('should match a config if class is present', () => {
    action.classes.push('Destructive');
    const configs: HypermediaUI.IActionClassConfiguration[] = [
      { actionClass: 'destructive', title: 'T', message: 'M', icon: 'I' }
    ];
    const matched = action.getConfigurations(configs);
    expect(matched.length).toBe(1);
    expect(matched[0].actionClass).toBe('destructive');
  });

  it('should match class case-insensitively', () => {
    action.classes.push('DESTRUCTIVE');
    const configs: HypermediaUI.IActionClassConfiguration[] = [
      { actionClass: 'Destructive', title: 'T', message: 'M', icon: 'I' }
    ];
    const matched = action.getConfigurations(configs);
    expect(matched.length).toBe(1);
    expect(matched[0].actionClass).toBe('Destructive');
  });

  it('should return empty array if no class matches', () => {
    action.classes.push('Other');
    const configs: HypermediaUI.IActionClassConfiguration[] = [
      { actionClass: 'destructive', title: 'T', message: 'M', icon: 'I' }
    ];
    expect(action.getConfigurations(configs).length).toBe(0);
  });

  it('should match multiple configs if multiple classes match', () => {
    action.classes.push('Destructive');
    action.classes.push('Warning');
    const configs: HypermediaUI.IActionClassConfiguration[] = [
      { actionClass: 'destructive', title: 'T1', message: 'M1', icon: 'I1' },
      { actionClass: 'warning', title: 'T2', message: 'M2', icon: 'I2' }
    ];
    const matched = action.getConfigurations(configs);
    expect(matched.length).toBe(2);
    expect(matched[0].actionClass).toBe('destructive');
    expect(matched[1].actionClass).toBe('warning');
  });
});
