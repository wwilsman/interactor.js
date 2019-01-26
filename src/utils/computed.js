export default function computed(getter) {
  return {
    enumerable: false,
    configurable: false,
    get: getter
  };
}
