import hasTagName from './util/hasTagName';
import { getAttribute } from './util/attribute';
import _ from '.';

export const accidental =
  [{
    condition: hasTagName(['keySig', 'accid']),
    traversal: getAttribute('accid'),
  }, {
    condition: hasTagName('note'),
    traversal: (note) => {
      const accidElement = _(note)
        .descendants()
        .find(hasTagName(['keySig', 'accid']));

      if (accidElement) {
        return _.accidental(accidElement);
      }

      return '';
    },
  }];

export const accidentals =
  [{
    condition: hasTagName(['keySig', 'accid', 'note']),
    traversal: (element) => [_.accidental(element)],
  }, {
    condition: hasTagName(['chord']),
    traversal: (element) => (
      _(element)
        .notes()
        .map(_.accidental)
        .value()
    ),
  }];
