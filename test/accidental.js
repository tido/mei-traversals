/* eslint max-len: [0] */

import { assert } from 'chai';
import { getMEI } from './helpers';
import _ from '../src';

describe('accidental traversals', () => {
  describe('accidental', () => {
    describe('given a keySig element with @accid="s"', () => {
      it('returns "s"', () => {
        const mei = getMEI('inLayer', { $: 'keySig', accid: 's' });
        const element = mei.getElementsByTagName('keySig')[1];
        const accidental = _.accidental(element);
        const expectedAccidental = 's';
        assert.strictEqual(accidental, expectedAccidental);
      });
    });

    describe('given an accid element with @accid="n"', () => {
      it('returns "n"', () => {
        const mei = getMEI('inLayer', { $: 'note', dur: 4, $has: '<accid accid="n" xml:id="a1"/>' });
        const element = mei.getElementsByTagName('accid')[0];
        const accidental = _.accidental(element);
        const expectedAccidental = 'n';
        assert.strictEqual(accidental, expectedAccidental);
      });
    });

    describe('given a note with a child accid element with @accid="f"', () => {
      it('returns "f"', () => {
        const mei = getMEI('inLayer', { $: 'note', dur: 4, $has: '<accid accid="f" xml:id="a1"/>' });
        const element = mei.getElementsByTagName('note')[0];
        const accidental = _.accidental(element);
        const expectedAccidental = 'f';
        assert.strictEqual(accidental, expectedAccidental);
      });
    });

    describe('given a chord element', () => {
      it('throws an error', () => {
        const mei = getMEI('inLayer', { $: 'chord', dur: 4, $has: [
          { $: 'note' },
          { $: 'note' },
          { $: 'note' },
        ] });
        const element = mei.getElementsByTagName('chord')[0];
        const run = () => _.accidental(element);
        assert.throw(run);
      });
    });
  });

  describe('accidentals', () => {
    describe('given a keySig element with @accid="s"', () => {
      it('returns ["s"]', () => {
        const mei = getMEI('inLayer', { $: 'keySig', accid: 's' });
        const element = mei.getElementsByTagName('keySig')[1];
        const accidentals = _.accidentals(element);
        const expectedAccidental = ['s'];
        assert.deepEqual(accidentals, expectedAccidental);
      });
    });

    describe('given an accid element with @accid="n"', () => {
      it('returns ["n"]', () => {
        const mei = getMEI('inLayer', { $: 'note', dur: 4, $has: '<accid accid="n" xml:id="a1"/>' });
        const element = mei.getElementsByTagName('accid')[0];
        const accidentals = _.accidentals(element);
        const expectedAccidental = ['n'];
        assert.deepEqual(accidentals, expectedAccidental);
      });
    });

    describe('given a note with a child accid element with @accid="f"', () => {
      it('returns ["f"]', () => {
        const mei = getMEI('inLayer', { $: 'note', dur: 4, $has: '<accid accid="f" xml:id="a1"/>' });
        const element = mei.getElementsByTagName('note')[0];
        const accidentals = _.accidentals(element);
        const expectedAccidental = ['f'];
        assert.deepEqual(accidentals, expectedAccidental);
      });
    });

    describe('given a chord element with 3 child notes (having a sharp, no and a flat accidental)', () => {
      it('returns ["s", "", "f"]', () => {
        const mei = getMEI('inLayer', { $: 'chord', dur: 4, $has: [
          { $: 'note', pname: 'c', $has: { $: 'accid', accid: 's' } },
          { $: 'note', pname: 'e' },
          { $: 'note', pname: 'g', $has: { $: 'accid', accid: 'f' } },
        ] });
        const element = mei.getElementsByTagName('chord')[0];
        const accidentals = _.accidentals(element);
        const expectedAccidental = ['s', '', 'f'];
        assert.deepEqual(accidentals, expectedAccidental);
      });
    });
  });
});
