import { IconNamePipe } from './icon-name.pipe';

describe('IconNamePipe', () => {
  let pipe: IconNamePipe;

  beforeEach(() => {
    pipe = new IconNamePipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return default icon for empty string', () => {
    expect(pipe.transform('')).toBe('push_pin');
  });

  it('should return default icon for null', () => {
    expect(pipe.transform(null)).toBe('push_pin');
  });

  it('should return default icon for undefined', () => {
    expect(pipe.transform(undefined)).toBe('push_pin');
  });

  it('should return input if already a material icon name', () => {
    expect(pipe.transform('work')).toBe('work');
    expect(pipe.transform('home')).toBe('home');
    expect(pipe.transform('favorite')).toBe('favorite');
  });

  it('should map location emoji to location_on', () => {
    expect(pipe.transform('📍')).toBe('location_on');
  });

  it('should map smartphone emoji to smartphone', () => {
    expect(pipe.transform('📱')).toBe('smartphone');
  });

  it('should map assignment emoji to assignment', () => {
    expect(pipe.transform('📋')).toBe('assignment');
  });

  it('should map pin emoji to push_pin', () => {
    expect(pipe.transform('📌')).toBe('push_pin');
  });

  it('should map mail emoji to mail', () => {
    expect(pipe.transform('📧')).toBe('mail');
  });

  it('should map lock emoji to lock', () => {
    expect(pipe.transform('🔒')).toBe('lock');
  });

  it('should map sparkle emoji to auto_awesome', () => {
    expect(pipe.transform('✨')).toBe('auto_awesome');
  });

  it('should map check circle emoji to check_circle', () => {
    expect(pipe.transform('✅')).toBe('check_circle');
  });

  it('should map check emoji to check', () => {
    expect(pipe.transform('✓')).toBe('check');
  });

  it('should map circle emoji to radio_button_unchecked', () => {
    expect(pipe.transform('○')).toBe('radio_button_unchecked');
  });

  it('should map edit emoji to edit', () => {
    expect(pipe.transform('✏️')).toBe('edit');
  });

  it('should map delete emoji to delete', () => {
    expect(pipe.transform('🗑️')).toBe('delete');
  });

  it('should map undo emoji to undo', () => {
    expect(pipe.transform('↩️')).toBe('undo');
  });

  it('should map refresh emoji to refresh', () => {
    expect(pipe.transform('🔄')).toBe('refresh');
  });

  it('should map forward arrow to arrow_forward', () => {
    expect(pipe.transform('→')).toBe('arrow_forward');
  });

  it('should map back arrow to arrow_back', () => {
    expect(pipe.transform('←')).toBe('arrow_back');
  });

  it('should map ruler emoji to straighten', () => {
    expect(pipe.transform('📏')).toBe('straighten');
  });

  it('should map target emoji to my_location', () => {
    expect(pipe.transform('🎯')).toBe('my_location');
  });

  it('should map inbox emoji to move_to_inbox', () => {
    expect(pipe.transform('📭')).toBe('move_to_inbox');
  });

  it('should map warning emoji to warning', () => {
    expect(pipe.transform('⚠️')).toBe('warning');
  });

  it('should map save emoji to save', () => {
    expect(pipe.transform('💾')).toBe('save');
  });

  it('should map person emoji to person', () => {
    expect(pipe.transform('👤')).toBe('person');
  });

  it('should map close emoji to close', () => {
    expect(pipe.transform('✖')).toBe('close');
  });

  it('should map keyboard emoji to keyboard', () => {
    expect(pipe.transform('⌨️')).toBe('keyboard');
  });

  it('should return default icon for unmapped emoji', () => {
    expect(pipe.transform('🎉')).toBe('push_pin');
    expect(pipe.transform('🔥')).toBe('push_pin');
  });

  it('should handle whitespace', () => {
    expect(pipe.transform('  📍  ')).toBe('location_on');
    expect(pipe.transform('   ')).toBe('push_pin');
  });
});
