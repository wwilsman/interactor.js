import isConvergence from './is-convergence';
import meta from './meta';

export default function isInteractor(obj) {
  return isConvergence(obj) &&
    'scope' in obj[meta] &&
    '$' in obj && typeof obj.$ === 'function' &&
    '$$' in obj && typeof obj.$$ === 'function' &&
    '$element' in obj;
}
