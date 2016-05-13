/* eslint max-len: [0] */
import { assert } from 'chai';
import { map, flow, get, values, keys } from 'lodash/fp';
import { getMEI } from './helpers';
import { getElementsByTagName } from '../src/basic';
import _ from '../src';

const durationsToNotes = map((dur) => ({ $: 'note', dur }));

const getTstamp = (fragment, targetTagName, index = 0) =>
  flow(
    getElementsByTagName(targetTagName),
    get(index),
    _.tstamp,
  )(fragment);

const getAbsoluteTstamp = (fragment, targetTagName, index = 0) =>
  flow(
    getElementsByTagName(targetTagName),
    get(index),
    _.absoluteTstamp,
  )(fragment);

describe('tstamp traversals', () => {
  describe('tstamp', () => {
    describe('given the first durational in a layer', () => {
      it('returns 1', () => {
        const mei = getMEI('inLayer', { $: 'note', dur: 4 });
        const tstamp = getTstamp(mei, 'note');
        assert.strictEqual(tstamp, 1);
      });
    });

    describe('given an element with a tstamp attribute', () => {
      const tstampAttributeValue = 876;
      it('returns the value of the attribute as a number', () => {
        const mei = getMEI('inLayer', { $: 'note', tstamp: tstampAttributeValue });
        const tstamp = getTstamp(mei, 'note');
        assert.isNumber(tstamp);
        assert.strictEqual(tstamp, tstampAttributeValue);
      });
    });

    describe('given a note within a chord', () => {
      const chordTstamp = 4;
      it('returns the tstamp of the parent chord', () => {
        const mei = getMEI('inLayer', { $: 'chord', tstamp: chordTstamp, $has: { $: 'note' } });
        const tstamp = getTstamp(mei, 'note');
        assert.strictEqual(tstamp, chordTstamp);
      });
    });

    describe('given an mrest', () => {
      it('returns 1', () => {
        const mei = getMEI('inLayer', { $: 'mRest' });
        const tstamp = getTstamp(mei, 'mRest');
        assert.strictEqual(tstamp, 1);
      });
    });

    describe('given a sequence of notes', () => {
      const testData = [
        { durations: [8, 8, 8, 8], expectedTstamps: [1, 1.5, 2, 2.5] },
        { durations: [16, 16, 16, 16], expectedTstamps: [1, 1.25, 1.5, 1.75] },
        { durations: [4, 4, 2, 2], expectedTstamps: [1, 2, 3, 5] },
      ];

      testData.forEach(({ durations, expectedTstamps }) => {
        const tstampString = expectedTstamps.join(' ');
        const durString = durations.join(' ');
        it(`returns [${tstampString}] for the respective durations of [${durString}]`, () => {
          const mei = getMEI('inLayer', durationsToNotes(durations));
          const notes = getElementsByTagName('note', mei);
          assert.deepEqual(notes.map(_.tstamp), expectedTstamps);
        });
      });
    });

    describe('clef, time and key signatures', () => {
      ['clef', 'meterSig', 'keySig'].forEach(tagName => {
        describe(`given a ${tagName} in the initial scoreDef, preceding a measure with a note`, () => {
          it('throws an error', () => {
            const mei = getMEI('inLayer', { $: 'note' });
            const run = () => getTstamp(mei, tagName);
            assert.throws(run);
          });
        });

        describe(`given a ${tagName} at the start of a layer, preceding a note`, () => {
          it('returns the tstamp of the first note in the layer', () => {
            const mei = getMEI('inLayer', [
              { $: tagName },
              { $: 'note' },
            ]);
            const tstamp = getTstamp(mei, tagName, 1);
            assert.strictEqual(tstamp, 1);
          });
        });

        describe(`given a ${tagName} in the middle of a layer, following and preceding a note`, () => {
          it('returns the tstamp of the following durational in the same layer', () => {
            const mei = getMEI('inLayer', [
              { $: 'note', dur: 2 },
              { $: tagName },
              { $: 'note', dur: 2 },
            ]);
            const tstamp = getTstamp(mei, tagName, 1);
            assert.strictEqual(tstamp, 3);
          });
        });

        describe(`given a ${tagName} at the end of a layer, followed by another layer`, () => {
          it('returns the end tstamp of the measure', () => {
            const mei = getMEI('inLayerBeforeMeasureWithFourQuarters', [
              { $: 'note', dur: 2 },
              { $: 'note', dur: 2 },
              { $: tagName },
            ]);
            const tstamp = getTstamp(mei, tagName, 1);
            assert.strictEqual(tstamp, 5);
          });
        });

        describe(`given a ${tagName} at the end of a layer, not preceding any further durational`, () => {
          it('returns the end tstamp of the measure', () => {
            const mei = getMEI('inLayer', [
              { $: 'note', dur: 2 },
              { $: 'note', dur: 2 },
              { $: tagName },
            ]);
            const tstamp = getTstamp(mei, tagName, 1);
            assert.strictEqual(tstamp, 5);
          });
        });

        describe(`given a ${tagName} between measures`, () => {
          it('returns the end tstamp of the preceding measure', () => {
            const mei = getMEI('inStaffDefBetweenMeasures', { $: tagName });
            const tstamp = getTstamp(mei, tagName, 1);
            assert.strictEqual(tstamp, 5);
          });
        });

        describe(`given a ${tagName} after the last measure`, () => {
          it('returns the end tstamp of the preceding measure', () => {
            const mei = getMEI('inStaffDefAfterLastMeasure', { $: tagName });
            const tstamp = getTstamp(mei, tagName, 1);
            assert.strictEqual(tstamp, 5);
          });
        });
      });
    });
  });

  describe('absoluteTstamp', () => {
    describe('given the start measure with notes', () => {
      it('returns 1', () => {
        const mei = getMEI('inLayer', { $: 'note', dur: 1 });
        const tstamp = getAbsoluteTstamp(mei, 'measure', 0);
        assert.strictEqual(tstamp, 1);
      });
    });

    describe('given a measure after a start measure with four quarter notes', () => {
      it('returns 6', () => {
        const mei = getMEI('inLayerBeforeMeasureWithFourQuarters', [
          { $: 'note', dur: 4 },
          { $: 'note', dur: 4 },
          { $: 'note', dur: 4 },
          { $: 'note', dur: 4 },
        ]);
        const tstamp = getAbsoluteTstamp(mei, 'measure', 1);
        assert.strictEqual(tstamp, 6);
      });
    });

    describe('given a measure after a start measure with three quarter notes', () => {
      it('returns 5', () => {
        const mei = getMEI('inLayerBeforeMeasureWithFourQuarters', [
          { $: 'note', dur: 4 },
          { $: 'note', dur: 4 },
          { $: 'note', dur: 4 },
        ]);
        const tstamp = getAbsoluteTstamp(mei, 'measure', 1);
        assert.strictEqual(tstamp, 5);
      });
    });

    describe('given a measure after a start measure in 4/4 with an mRest', () => {
      it('returns 6', () => {
        const mei = getMEI('inLayerBeforeMeasureWithFourQuarters', [
          { $: 'mRest' },
        ]);
        const tstamp = getAbsoluteTstamp(mei, 'measure', 1);
        assert.strictEqual(tstamp, 6);
      });
    });

    describe('given a note after a start measure with a whole note', () => {
      it('returns 6', () => {
        const mei = getMEI('inLayerBeforeMeasureWithFourQuarters', [
          { $: 'note', dur: 1 },
        ]);
        const tstamp = getAbsoluteTstamp(mei, 'note', 1);
        assert.strictEqual(tstamp, 6);
      });
    });

    describe('given a note after a quarter note and a preceding measure with a whole note', () => {
      it('returns 7', () => {
        const mei = getMEI('inLayerBeforeMeasureWithFourQuarters', [
          { $: 'note', dur: 1 },
        ]);
        const tstamp = getAbsoluteTstamp(mei, 'note', 2);
        assert.strictEqual(tstamp, 7);
      });
    });

    describe('clef, time and key signatures', () => {
      ['clef', 'meterSig', 'keySig'].forEach(tagName => {
        describe(`given the initial ${tagName}`, () => {
          it('returns 1', () => {
            const mei = getMEI('inLayer', [
              { $: 'note', dur: 1 },
            ]);
            const tstamp = getAbsoluteTstamp(mei, tagName, 0);
            assert.strictEqual(tstamp, 1);
          });
        });

        describe(`given a ${tagName} as first child of a layer after a start measure with four quarter notes`, () => {
          it('returns 6', () => {
            const mei = getMEI('inLayerAfterMeasureWithFourQuarters', [
              { $: tagName },
              { $: 'note', dur: 4 },
              { $: 'note', dur: 4 },
              { $: 'note', dur: 4 },
            ]);
            const tstamp = getAbsoluteTstamp(mei, tagName, 1);
            assert.strictEqual(tstamp, 6);
          });
        });

        describe(`given a ${tagName} in a layer after a quarter note and a start measure with four quarter notes`, () => {
          it('returns 7', () => {
            const mei = getMEI('inLayerAfterMeasureWithFourQuarters', [
              { $: 'note', dur: 4 },
              { $: tagName },
              { $: 'note', dur: 4 },
              { $: 'note', dur: 4 },
              { $: 'note', dur: 4 },
            ]);
            const tstamp = getAbsoluteTstamp(mei, tagName, 1);
            assert.strictEqual(tstamp, 7);
          });
        });

        describe(`given a ${tagName} in a layer after four quarter notes, with a following layer`, () => {
          it('returns the start tstamp of the following measure', () => {
            const mei = getMEI('inLayerBeforeMeasureWithFourQuarters', [
              { $: 'note', dur: 4 },
              { $: 'note', dur: 4 },
              { $: 'note', dur: 4 },
              { $: 'note', dur: 4 },
              { $: tagName },
            ]);
            const tstamp = getAbsoluteTstamp(mei, tagName, 1);
            assert.strictEqual(tstamp, 6);
          });
        });

        describe(`given a ${tagName} in a layer after four quarter notes, without following layers`, () => {
          it('returns the imaginary start tstamp of the following measure', () => {
            const mei = getMEI('inLayer', [
              { $: 'note', dur: 4 },
              { $: 'note', dur: 4 },
              { $: 'note', dur: 4 },
              { $: 'note', dur: 4 },
              { $: tagName },
            ]);
            const tstamp = getAbsoluteTstamp(mei, tagName, 1);
            assert.strictEqual(tstamp, 6);
          });
        });

        describe(`given a ${tagName} as a staffDef child between two measures, each containing a whole note`, () => {
          it('returns the start tstamp of the following measure', () => {
            const mei = getMEI('inStaffDefBetweenMeasures', { $: tagName });
            const tstamp = getAbsoluteTstamp(mei, tagName, 1);
            assert.strictEqual(tstamp, 6);
          });
        });

        describe(`given a ${tagName} as a staffDef child after the last of two measures, each containing a whole note`, () => {
          it('returns the imaginary start tstamp of the following measure', () => {
            const mei = getMEI('inStaffDefAfterLastMeasure', { $: tagName });
            const tstamp = getAbsoluteTstamp(mei, tagName, 1);
            assert.strictEqual(tstamp, 11);
          });
        });
      });
    });

    describe('given a note within a chord', () => {
      it('returns the absolute tstamp of the parent chord', () => {
        const mei = getMEI('inLayer', [
          { $: 'note', dur: 4 },
          { $: 'chord', dur: 4, $has: [{ $: 'note' }, { $: 'note' }, { $: 'note' }] },
          { $: 'note', dur: 4 },
          { $: 'note', dur: 4 },
        ]);
        const chordTstamp = getAbsoluteTstamp(mei, 'chord', 0);
        const childNoteTstamp1 = getAbsoluteTstamp(mei, 'note', 1);
        const childNoteTstamp2 = getAbsoluteTstamp(mei, 'note', 2);
        const childNoteTstamp3 = getAbsoluteTstamp(mei, 'note', 3);
        assert.strictEqual(childNoteTstamp1, chordTstamp);
        assert.strictEqual(childNoteTstamp2, chordTstamp);
        assert.strictEqual(childNoteTstamp3, chordTstamp);
      });
    });
  });

  // TODO test case with no durationals

  describe('durationalsByTstamp', () => {
    describe('given a measure with 4 quarter notes in 1 staff and 1 layer', () => {
      let mei;
      const testData = [{
        tagName: 'measure',
        elementIndex: 0,
        expectedTstamps: ['1', '2', '3', '4'],
        expectedLengths: [1, 1, 1, 1],
      }, {
        tagName: 'staff',
        elementIndex: 0,
        expectedTstamps: ['1', '2', '3', '4'],
        expectedLengths: [1, 1, 1, 1],
      }, {
        tagName: 'layer',
        elementIndex: 0,
        expectedTstamps: ['1', '2', '3', '4'],
        expectedLengths: [1, 1, 1, 1],
      }];

      before(() => {
        mei = getMEI('inLayer', [
          { $: 'note' },
          { $: 'note' },
          { $: 'note' },
          { $: 'note' },
        ]);
      });

      testData.forEach(({ tagName, elementIndex, expectedTstamps, expectedLengths }) => {
        describe(`the ${tagName} #${elementIndex}`, () => {
          let result;

          before(() => {
            const startElement = mei.getElementsByTagName(tagName)[elementIndex];
            result = _.durationalsByTstamp(startElement);
          });

          it('returns an object', () => {
            assert.typeOf(result, 'object');
          });

          it(`the object has the tstamps ${expectedTstamps.join()} as keys`, () => {
            const resultKeys = keys(result);
            assert.deepEqual(resultKeys, expectedTstamps);
          });

          it(`the object values are arrays with lengths ${expectedLengths.join()}`, () => {
            const lengths = values(result).map(value => value.length);
            assert.deepEqual(lengths, expectedLengths);
          });
        });
      });
    });

    describe('given a measure with 1 quarter, 4 beamed eighth and 1 quarter note in 1 staff and 1 layer', () => {
      let mei;
      const testData = [{
        tagName: 'measure',
        elementIndex: 0,
        expectedTstamps: ['1', '2', '2.5', '3', '3.5', '4'],
        expectedLengths: [1, 1, 1, 1, 1, 1],
      }, {
        tagName: 'staff',
        elementIndex: 0,
        expectedTstamps: ['1', '2', '2.5', '3', '3.5', '4'],
        expectedLengths: [1, 1, 1, 1, 1, 1],
      }, {
        tagName: 'layer',
        elementIndex: 0,
        expectedTstamps: ['1', '2', '2.5', '3', '3.5', '4'],
        expectedLengths: [1, 1, 1, 1, 1, 1],
      }, {
        tagName: 'beam',
        elementIndex: 0,
        expectedTstamps: ['2', '2.5', '3', '3.5'],
        expectedLengths: [1, 1, 1, 1],
      }];

      before(() => {
        mei = getMEI('inLayer', [
          { $: 'note' },
          { $: 'beam', $has: [
            { $: 'note', dur: 8 },
            { $: 'note', dur: 8 },
            { $: 'note', dur: 8 },
            { $: 'note', dur: 8 },
          ] },
          { $: 'note' },
        ]);
      });

      testData.forEach(({ tagName, elementIndex, expectedTstamps, expectedLengths }) => {
        describe(`the ${tagName} #${elementIndex}`, () => {
          let result;

          before(() => {
            const startElement = mei.getElementsByTagName(tagName)[elementIndex];
            result = _.durationalsByTstamp(startElement);
          });

          it('returns an object', () => {
            assert.typeOf(result, 'object');
          });

          it(`the object has the tstamps ${expectedTstamps.join()} as keys`, () => {
            const resultKeys = keys(result).sort();
            assert.deepEqual(resultKeys, expectedTstamps);
          });

          it(`the object values are arrays with lengths ${expectedLengths.join()}`, () => {
            const lengths = values(result).map(value => value.length);
            assert.deepEqual(lengths, expectedLengths);
          });
        });
      });
    });
  });

  describe('durationalsByAbsoluteTstamp', () => {
    describe('given a measure with 1 quarter, 4 beamed eighth and 1 quarter note in 1 staff and 1 layer following a measure with 4 quarter notes', () => {
      let mei;
      const testData = [{
        tagName: 'measure',
        elementIndex: 1,
        expectedTstamps: ['6', '7', '7.5', '8', '8.5', '9'],
        expectedLengths: [1, 1, 1, 1, 1, 1],
      }, {
        tagName: 'staff',
        elementIndex: 1,
        expectedTstamps: ['6', '7', '7.5', '8', '8.5', '9'],
        expectedLengths: [1, 1, 1, 1, 1, 1],
      }, {
        tagName: 'layer',
        elementIndex: 1,
        expectedTstamps: ['6', '7', '7.5', '8', '8.5', '9'],
        expectedLengths: [1, 1, 1, 1, 1, 1],
      }, {
        tagName: 'beam',
        elementIndex: 0,
        expectedTstamps: ['7', '7.5', '8', '8.5'],
        expectedLengths: [1, 1, 1, 1],
      }];

      before(() => {
        mei = getMEI('inLayerAfterMeasureWithFourQuarters', [
          { $: 'note' },
          { $: 'beam', $has: [
            { $: 'note', dur: 8 },
            { $: 'note', dur: 8 },
            { $: 'note', dur: 8 },
            { $: 'note', dur: 8 },
          ] },
          { $: 'note' },
        ]);
      });

      testData.forEach(({ tagName, elementIndex, expectedTstamps, expectedLengths }) => {
        describe(`the ${tagName} #${elementIndex}`, () => {
          let result;

          before(() => {
            const startElement = mei.getElementsByTagName(tagName)[elementIndex];
            result = _.durationalsByAbsoluteTstamp(startElement);
          });

          it('returns an object', () => {
            assert.typeOf(result, 'object');
          });

          it(`the object has the tstamps ${expectedTstamps.join()} as keys`, () => {
            const resultKeys = keys(result).sort();
            assert.deepEqual(resultKeys, expectedTstamps);
          });

          it(`the object values are arrays with lengths ${expectedLengths.join()}`, () => {
            const lengths = values(result).map(value => value.length);
            assert.deepEqual(lengths, expectedLengths);
          });
        });
      });
    });
  });
});
