/* eslint max-len: [0] */

import { assert } from 'chai';
import { getMEI } from './helpers';
import _ from '../src';

describe('meter traversals', () => {
  describe('#actualMeterCount', () => {
    describe('given a measure with 4 quarter notes in a layer', () => {
      it('returns 5', () => {
        const mei = getMEI('inLayer', [
          { $: 'note', dur: 4 },
          { $: 'note', dur: 4 },
          { $: 'note', dur: 4 },
          { $: 'note', dur: 4 },
        ]);
        const measure = mei.getElementsByTagName('measure')[0];
        const result = _.actualMeterCount(measure);
        const expected = 5;
        assert.strictEqual(result, expected);
      });
    });

    describe('given a measure with 4 quarter notes in a layer and a dynam referring to tstamp 1 of staff 1', () => {
      it('returns 5', () => {
        const mei = getMEI('afterStaff', `
          <dynam tstamp="1" xml:id="asdf" staff="1" place="below"/>
        `);
        const measure = mei.getElementsByTagName('measure')[0];
        const result = _.actualMeterCount(measure);
        const expected = 5;
        assert.strictEqual(result, expected);
      });
    });

    describe('given a measure with 4 quarter notes in a layer and a dynam referring to tstamp 1 of staff 1 and 2', () => {
      it('returns 5', () => {
        const mei = getMEI('afterTwoStaves', `
          <dynam tstamp="1" xml:id="asdf" staff="1 2"/>
        `);
        const measure = mei.getElementsByTagName('measure')[0];
        const result = _.actualMeterCount(measure);
        const expected = 5;
        assert.strictEqual(result, expected);
      });
    });
  });
});
