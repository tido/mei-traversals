import { isString, curry } from 'lodash/fp';

// Accepts a single string, or an array of strings
const hasTagName = curry(
  (tagNames, { tagName }) =>
    (isString(tagNames) ? [tagNames] : tagNames).indexOf(tagName) > -1);

export default hasTagName;
