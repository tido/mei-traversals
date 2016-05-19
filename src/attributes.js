import { flow, constant } from 'lodash/fp';
import hasTagName from './util/hasTagName';
import { getAttribute, hasAttribute } from './util/attribute';

export const n = [{
  condition: hasTagName('measure'),
  traversal: flow(getAttribute('n'), Number),
}, {
  condition: hasAttribute('n'),
  traversal: getAttribute('n'),
}, {
  condition: constant(true),
  traversal: () => { throw new Error('Provided element does not have an "n" attribute'); },
}];

export const octave = flow(getAttribute('oct'), Number);
export const pname = getAttribute('pname');
export const mode = getAttribute('mode');
export const lines = flow(getAttribute('lines'), Number);
export const line = flow(getAttribute('line'), Number);
export const count = flow(getAttribute('count'), Number);
export const unit = flow(getAttribute('unit'), Number);
export const sym = getAttribute('sym');
export const shape = getAttribute('shape');
export const place = getAttribute('place');
export const dis = getAttribute('dis');
export const disPlace = getAttribute('dis.place');
