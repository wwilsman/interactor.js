import meta, { get } from './meta';

export default function isInteractor(obj) {
  return !!obj && typeof obj === 'object' &&
    meta in obj && Array.isArray(get(obj, 'queue')) &&
    'scope' in obj[meta] &&
    '$' in obj && typeof obj.$ === 'function' &&
    '$$' in obj && typeof obj.$$ === 'function' &&
    '$element' in obj &&
    'timeout' in obj && typeof obj.timeout === 'function' &&
    'run' in obj && typeof obj.run === 'function';
}
