import { padEnd, isArray, mapValues, isPlainObject } from 'lodash/fp';

const mapValuesWithKey = mapValues.convert({ cap: false });

const decorateTraversals =
  (decorator) => (traversals) =>
    mapValuesWithKey(decorator, traversals);

// Wrap each traversal in a try/catch
export const catchTraversalErrors = decorateTraversals((traversalFunc, traversalName) => (domElement) => {
  try {
    return traversalFunc(domElement);
  } catch (e) {
    throw new Error(`Failed traversal: ${traversalName}.\n ${e.toString()}`);
  }
});

// Caches traversal results on the DOM Element nodes within an object called
// `__traversalCache` by the name of the traversal. ie: The result of
// `mei.staff(domElement)` is stored under `domElement.__traversalCache.staff`
//
// There is no cache invalidation mechanism, so using this assumes that your XML
// Document does not get modified.
//
// This relies on mutating an object we don't own, so it's not the most elegant thing,
// but it's super simple and efficient
export const cacheTraversals = decorateTraversals((traversalFunc, traversalName) => (domElement) => {
  // Ensure cache exists
  if (!domElement.__traversalCache) domElement.__traversalCache = {};

  // Check for cache hit
  const cachedResult = domElement.__traversalCache[traversalName];
  if (cachedResult) return cachedResult;

  // In case of cache miss, execute traversal and cache result
  const result = traversalFunc(domElement);
  domElement.__traversalCache[traversalName] = result;
  return result;
});

// FIXME: This is a pretty inadequate stringifier
const toString = (input) => {
  if (input === null || input.nodeType) {
    return input;
  } else if (isArray(input)) {
    return input.map(toString).join('\n');
  } else if (isPlainObject(input)) {
    return JSON.stringify(mapValues(toString, input));
  } else {
    return JSON.stringify(input);
  }
};

// Use this decorator to provide very verbose logging
// FIXME: `console.groupCollapsed` not supported in node
export const logTraversals = decorateTraversals((traversalFunc, traversalName) => (domElement) => {
  /* eslint-disable no-console */
  const prettyElementId = `${domElement.tagName}#${domElement.getAttribute('xml:id')}`;
  const logGroup = padEnd(30, `Traversal: ${traversalName}`) + `Element: ${prettyElementId}`;
  console.groupCollapsed(logGroup);
  console.time(`${traversalName}:${prettyElementId} - Total time:`);
  const result = traversalFunc(domElement);
  console.log(`Result: ${toString(result)}`);
  console.timeEnd(`${traversalName}:${prettyElementId} - Total time:`);
  console.groupEnd(logGroup);
  return result;
  /* eslint-disable no-console */
});
