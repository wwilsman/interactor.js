import meta, { get } from './meta';

export default function isConvergence(obj) {
  return !!obj && typeof obj === 'object' &&
    meta in obj && Array.isArray(get(obj, 'queue')) &&
    'timeout' in obj && typeof obj.timeout === 'function' &&
    'run' in obj && typeof obj.run === 'function';
}
