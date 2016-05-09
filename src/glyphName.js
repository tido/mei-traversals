import { allPass, constant, flow, split, last, eq } from 'lodash/fp';
import hasTagName from './util/hasTagName';
import { hasAttribute, getAttribute } from './util/attribute';

export const altsym = flow(getAttribute('altsym'), split('#'), last);
export const isInverted = flow(getAttribute('form'), eq('inv'));
export const isLong = flow(getAttribute('long'), eq('true'));

export const get = [{
  condition: hasAttribute('altsym'),
  traversal: altsym,
}, {
  // NB: a 'regular' mordent in MEI is an 'inverted' mordent in SMuFL and reverse
  condition: allPass([hasTagName('mordent'), isInverted]),
  traversal: constant('ornamentMordent'),
}, {
  condition: allPass([hasTagName('mordent'), isLong]),
  traversal: constant('ornamentTremblement'),
}, {
  // NB: a 'regular' mordent in MEI is an 'inverted' mordent in SMuFL and reverse
  condition: hasTagName('mordent'),
  traversal: constant('ornamentMordentInverted'),
}, {
  condition: hasTagName('trill'),
  traversal: constant('ornamentTrill'),
}, {
  condition: allPass([hasTagName('turn'), isInverted]),
  traversal: constant('ornamentTurnSlash'),
}, {
  condition: hasTagName('trill'),
  traversal: constant('ornamentTurn'),
}];
