declare module 'lodash/debounce' {
  import { DebounceSettings } from 'lodash';

  export default function debounce<F extends (...args: any[]) => any>(
    func: F,
    wait?: number,
    options?: DebounceSettings
  ): F;
}
