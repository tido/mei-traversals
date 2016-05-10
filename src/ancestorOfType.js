import { findAncestor } from './basic';
import hasTagName from './util/hasTagName';

export const fingGrp = findAncestor(hasTagName('fingGrp'));
export const choice = findAncestor(hasTagName('choice'));
export const reg = findAncestor(hasTagName('reg'));
export const orig = findAncestor(hasTagName('orig'));
export const beam = findAncestor(hasTagName('beam'));
export const chord = findAncestor(hasTagName('chord'));
export const measure = findAncestor(hasTagName('measure'));
export const layer = findAncestor(hasTagName('layer'));
export const note = findAncestor(hasTagName('note'));
export const score = findAncestor(hasTagName('score'));
export const tuplet = findAncestor(hasTagName('tuplet'));
