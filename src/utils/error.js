import meta from './meta';

const { assign } = Object;

// adds meta to an error so it bubbles through negated asseritons
export default function error(message, Klass = Error) {
  return assign(new Klass(message), { [meta]: true });
}
