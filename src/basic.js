import { allPass, curry, toArray } from 'lodash/fp';
import { isElementNode, isTextNode } from './util/isNodeType';

export const getElementsByTagName = curry(
  (tagName, domElement) =>
    toArray(domElement.getElementsByTagName(tagName)));

export const findPreviousSibling = (predicate) => ({ previousSibling }) => {
  let currentPrevious = previousSibling;
  const isMatch = allPass([isElementNode, predicate]);
  while (currentPrevious) {
    if (isMatch(currentPrevious)) return currentPrevious;
    else currentPrevious = currentPrevious.previousSibling;
  }

  return null;
};

export const findNextSibling = (predicate) => ({ nextSibling }) => {
  let currentNext = nextSibling;
  const isMatch = allPass([isElementNode, predicate]);
  while (currentNext) {
    if (isMatch(currentNext)) return currentNext;
    else currentNext = currentNext.nextSibling;
  }

  return null;
};

export const findAncestor = (predicate) => ({ parentNode }) => {
  let currentAncestor = parentNode;
  while (currentAncestor) {
    if (predicate(currentAncestor)) return currentAncestor;
    else currentAncestor = currentAncestor.parentNode;
  }

  return null;
};

export const getAncestors = ({ parentNode }) => {
  const ancestors = [];

  let currentAncestor = parentNode;
  while (currentAncestor) {
    ancestors.push(currentAncestor);
    currentAncestor = currentAncestor.parentNode;
  }

  return ancestors;
};

export const findDescendant = (predicate) => (domElement) => {
  const { childNodes } = domElement;
  if (!childNodes) return null;

  for (let i = 0; i < childNodes.length; i += 1) {
    const childNode = childNodes.item(i);
    const isMatch = allPass([isElementNode, predicate]);
    const matches = isMatch(childNode);
    if (matches) return childNode;
    const childsDescendant = findDescendant(predicate)(childNode);
    if (childsDescendant) return childsDescendant;
  }

  return null;
};

export const findDescendantRight = (predicate) => (domElement) => {
  const { childNodes } = domElement;
  if (!childNodes) return null;

  for (let i = childNodes.length - 1; i > -1; i -= 1) {
    const childNode = childNodes.item(i);
    const isMatch = allPass([isElementNode, predicate]);
    const matches = isMatch(childNode);
    if (matches) return childNode;
    const childsDescendant = findDescendantRight(predicate)(childNode);
    if (childsDescendant) return childsDescendant;
  }

  return null;
};

// eslint-disable-next-line
export const getDescendants = (domElement, descendants = []) => {
  const { childNodes } = domElement;
  if (!childNodes) return [];

  for (let i = 0; i < childNodes.length; i += 1) {
    const childNode = childNodes.item(i);
    if (isElementNode(childNode)) descendants.push(childNode);

    // FIXME only elements have descendants
    descendants = descendants.concat(getDescendants(childNode));
  }

  return descendants;
};

export const findPrevious =
  (predicate, blockAscent) => ({ previousSibling, parentNode }) => {
    if (previousSibling && isTextNode(previousSibling)) {
      previousSibling = findPreviousSibling(isElementNode)(previousSibling);
    }

    if (previousSibling) {
      if (predicate(previousSibling)) return previousSibling;
      return findDescendantRight(predicate)(previousSibling)
        || findPrevious(predicate, blockAscent)(previousSibling);
    } else if (parentNode && (!blockAscent || !blockAscent(parentNode))) {
      return findPrevious(predicate, blockAscent)(parentNode);
    } else {
      return null;
    }
  };

export const findNext =
  (predicate, blockAscent) => ({ nextSibling, parentNode }) => {
    if (nextSibling && isTextNode(nextSibling)) {
      nextSibling = findNextSibling(isElementNode)(nextSibling);
    }

    if (nextSibling) {
      if (predicate(nextSibling)) return nextSibling;
      return findDescendant(predicate)(nextSibling)
        || findNext(predicate, blockAscent)(nextSibling);
    } else if (parentNode && (!blockAscent || !blockAscent(parentNode))) {
      return findNext(predicate, blockAscent)(parentNode);
    } else {
      return null;
    }
  };
