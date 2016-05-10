import { findNext } from './basic';
import hasTagName from './util/hasTagName';

export const nextMeasure = findNext(hasTagName('measure'), hasTagName('mDiv'));
