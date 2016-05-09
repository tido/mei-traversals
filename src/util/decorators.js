import { padEnd, isArray, mapValues, isPlainObject } from 'lodash/fp';

const decorateTraversals = (decorator) => (traversals) => {
  Object.keys(traversals).forEach(traversalName => {
    const traversalFunc = traversals[traversalName];
    traversals[traversalName] = decorator(traversalFunc, traversalName);
  });
  return traversals;
};

export const catchErrors = decorateTraversals((traversalFunc, traversalName) => (domElement) => {
  try {
    return traversalFunc(domElement);
  } catch (e) {
    throw new Error(`Failed traversal: ${traversalName}.\n ${e.toString()}`);
  }
});

// Caches traversal results on the elements themselves.
// Not the most elegant thing, but it's super simple and efficient
export const useCache = decorateTraversals((traversalFunc, traversalName) => (domElement) => {
  // Ensure cache exists
  if (!domElement.__tidoCache) domElement.__tidoCache = {};

  // Check for cache hit
  const cachedResult = domElement.__tidoCache[traversalName];
  if (cachedResult) return cachedResult;

  // In case of cache miss, execute traversal and cache result
  const result = traversalFunc(domElement);
  domElement.__tidoCache[traversalName] = result;
  return result;
});

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

export const useLog = decorateTraversals((traversalFunc, traversalName) => (domElement) => {
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
