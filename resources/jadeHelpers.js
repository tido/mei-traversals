'use strict'; // eslint-disable-line

const _ = require('lodash');
const cartesian = require('cartesian');

const notes = 'cdefgab';
const notesLength = notes.length;

const baseOct = 4;

let measure;
let staff;
let layer;
let elementCounters;

module.exports = {
  _: _, // eslint-disable-line
  cartesian,
  beginIds() {
    measure = 0;
    staff = 0;
  },
  // Use measure&attributes(measure()) etc for these!
  measure() {
    if (measure === undefined) throw new Error('Call beginIds() first!');
    measure += 1;
    staff = 0;
    layer = undefined;
    elementCounters = undefined;
    return {
      'xml:id': `measure-${measure}`,
      n: measure,
    };
  },
  staff() {
    if (staff === undefined) throw new Error('Call beginIds() first!');
    elementCounters = undefined;
    staff += 1;
    layer = 0;
    return {
      'xml:id': `measure-${measure}-staff-${staff}`,
      n: staff,
    };
  },
  layer() {
    if (layer === undefined) throw new Error('Call beginIds() first!');
    layer += 1;
    elementCounters = {};
    return {
      'xml:id': `measure-${measure}-staff-${staff}-layer-${layer}`,
      n: layer,
    };
  },
  element(element = 'element') {
    if (elementCounters === undefined) throw new Error('Call beginIds() first!');
    const count = (elementCounters[element] || 0) + 1;
    elementCounters[element] = count;
    return {
      'xml:id': `measure-${measure}-staff-${staff}-layer-${layer}-${element}-${count}`,
    };
  },
  chordPermutations(amount) {
    const binaryPermutations = _.range(1, Math.pow(2, amount));
    return _.map(binaryPermutations, (value) => {
      const allNoteOptionIndices = _.range(amount);
      const usedNoteOptionIndices = _.filter(
        allNoteOptionIndices,
        option => (Math.pow(2, option) & value) !== 0
      );
      const noteOptions = _.map(usedNoteOptionIndices, value => ({
        pname: notes[value % notesLength],
        oct: baseOct + Math.floor(value / notesLength),
      }));
      return noteOptions;
    });
  },
};
