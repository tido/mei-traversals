import { negate, flow } from 'lodash/fp';
import { findAncestor } from './basic';
import { hasAttribute, getAttribute } from './util/attribute';
import hasTagName from './util/hasTagName';
import _ from '.';

export const dots =
  [{
    condition: findAncestor(hasTagName('chord')),
    traversal: (element) => _(element).chord().dots().value(),
  }, {
    condition: hasAttribute('dots'),
    traversal: flow(getAttribute('dots'), Number),
  }, {
    condition: negate(hasAttribute('dots')),
    traversal: () => 0,
  }];
