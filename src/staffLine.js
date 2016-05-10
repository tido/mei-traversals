import { flow, constant } from 'lodash/fp';
import { hasAttribute, hasAttributes, getAttribute } from './util/attribute';
import hasTagName from './util/hasTagName';
import _ from '.';

const absoluteLoc = ({ pname, oct }) =>
  oct * 7 + 'cdefgab'.indexOf(pname);

const clefToPitch = {
  G2: { pname: 'e', oct: 4 },
  F4: { pname: 'g', oct: 2 },
  C3: { pname: 'f', oct: 3 },
  C4: { pname: 'e', oct: 3 },
};

function getStaffLine(pitch, clef) {
  const clefPitch = clefToPitch[clef.shape + clef.line];

  if (!clefPitch) {
    throw new Error(`Invalid clef - Could not find clef pitch for clef: ${clef.shape}${clef.line}`);
  }

  const staffLine = (absoluteLoc(pitch) - absoluteLoc(clefPitch)) / 2;

  return staffLine;
}

export const staffLine =
  [{
    condition: hasAttribute('loc'),
    traversal: flow(getAttribute('loc'), (loc) => Number(loc) / 2),
  }, {
    condition: hasAttributes(['pname', 'oct']),
    traversal: (note) => {
      const FAKE_NOTE_TSTAMP = 1;
      const clef = _(note)
        .chain()
        .staff()
        .clefsByTstamp()
        .get(FAKE_NOTE_TSTAMP)
        .get(0)
        .value();

      return getStaffLine({
        pname: _.pname(note),
        oct: _.octave(note),
      }, {
        shape: _.shape(clef),
        line: _.line(clef),
      });
    },
  }, {
    condition: hasTagName('rest'),
    traversal: constant(2),
  }];
