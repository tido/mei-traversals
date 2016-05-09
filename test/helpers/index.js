import { DOMParser } from 'xmldom';

import wrapFragment from './wrapFragment';
export { wrapFragment };

export function getMEI(wrapperName, data, options, valid, validate) {
  const mei = wrapFragment(wrapperName, data, options, valid, validate);
  return parseXML(mei);
}

export function parseXML(str) {
  return new DOMParser().parseFromString(str, 'text/xml');
}
