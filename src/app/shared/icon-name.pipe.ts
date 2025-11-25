import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'iconName',
  standalone: true,
})
export class IconNamePipe implements PipeTransform {
  transform(value?: string | null): string {
    const v = (value || '').trim();
    if (!v) return 'push_pin';

    // If looks like a Material icon name already
    if (/^[a-z0-9_]+$/.test(v)) return v;

    // Map common emojis used in the app to Material Symbols
    const map: Record<string, string> = {
      '📍': 'location_on',
      '📱': 'smartphone',
      '📋': 'assignment',
      '📌': 'push_pin',
      '📧': 'mail',
      '🔒': 'lock',
      '✨': 'auto_awesome',
      '✅': 'check_circle',
      '✓': 'check',
      '○': 'radio_button_unchecked',
      '✏️': 'edit',
      '🗑️': 'delete',
      '↩️': 'undo',
      '🔄': 'refresh',
      '→': 'arrow_forward',
      '←': 'arrow_back',
      '📏': 'straighten',
      '🎯': 'my_location',
      '📭': 'move_to_inbox',
      '⚠️': 'warning',
      '💾': 'save',
      '👤': 'person',
      '✖': 'close',
      '⌨️': 'keyboard'
    };

    return map[v] || 'push_pin';
  }
}
