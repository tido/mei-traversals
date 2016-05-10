import hasTagName from './util/hasTagName';
import { findAncestor } from './basic';
import { negate } from 'lodash/fp';
import { hasAttribute, getAttribute } from './util/attribute';
import _ from '.';

export const stemDir =
  [{
    condition: findAncestor(hasTagName('chord')),
    traversal: (element) => _(element).chord().stemDir().value(),
  }, {
    condition: hasAttribute('stem.dir'),
    traversal: getAttribute('stem.dir'),
  }, {
    condition: negate(hasAttribute('stem.dir')),
    traversal: () => null, // FIXME: What should this actually return?
  }];
