/* eslint max-len: [0] */

import { assert } from 'chai';
import { getMEI } from './helpers';
import _ from '../src';

const getTestData = (spanningElementConfig) => `
  <measure n="1" xml:id="i01">
    <staff n="1" xml:id="i02">
      <layer n="1" xml:id="i03">
        <note pname="c" oct="4" stem.dir="up" dur="2" xml:id="i04"/>
        <note pname="c" oct="4" stem.dir="up" dur="2" xml:id="i04a"/>
      </layer>
    </staff>
    ${spanningElementConfig}
  </measure>
  <measure n="2" xml:id="i05">
    <staff n="1" xml:id="i06">
      <layer n="1" xml:id="i07">
        <note pname="c" oct="4" stem.dir="up" dur="1" xml:id="i08"/>
      </layer>
    </staff>
  </measure>
  <measure n="3" xml:id="i09">
    <staff n="1" xml:id="i10">
      <layer n="1" xml:id="i11">
        <note pname="c" oct="4" stem.dir="up" dur="1" xml:id="i12"/>
      </layer>
    </staff>
  </measure>
  <measure n="4" xml:id="i13">
    <staff n="1" xml:id="i14">
      <layer n="1" xml:id="i15">
        <note pname="c" oct="4" stem.dir="up" dur="1" xml:id="i16"/>
      </layer>
    </staff>
  </measure>
`;

describe('spanning element traversals', () => {
  describe('#spannedMeasures', () => {
    describe('given a spanning element with a tstamp2 starting with 0m+', () => {
      it('returns 1', () => {
        const testData = getTestData('<slur xml:id="s1" tstamp="1" tstamp2="0m+1" staff="1" layer="1"/>');
        const mei = getMEI('inSection', testData);
        const slur = mei.getElementsByTagName('slur')[0];
        const result = _.spannedMeasures(slur);
        const expected = 1;
        assert.strictEqual(result.length, expected);
      });
    });

    describe('given a spanning element with a tstamp2 starting with 2m+', () => {
      it('returns 3', () => {
        const testData = getTestData('<slur xml:id="s1" tstamp="1" tstamp2="2m+1" staff="1" layer="1"/>');
        const mei = getMEI('inSection', testData);
        const slur = mei.getElementsByTagName('slur')[0];
        const result = _.spannedMeasures(slur);
        const expected = 3;
        assert.strictEqual(result.length, expected);
      });
    });

    describe('given a spanning element with an endid in the same measure', () => {
      it('returns 1', () => {
        const testData = getTestData('<slur xml:id="s1" tstamp="1" endid="#i04a" staff="1" layer="1"/>');
        const mei = getMEI('inSection', testData);
        const slur = mei.getElementsByTagName('slur')[0];
        const result = _.spannedMeasures(slur);
        const expected = 1;
        assert.strictEqual(result.length, expected);
      });
    });

    describe('given a spanning element with an endid in the second-next measure', () => {
      it('returns 3', () => {
        const testData = getTestData('<slur xml:id="s1" tstamp="1" endid="#i12" staff="1" layer="1"/>');
        const mei = getMEI('inSection', testData);
        const slur = mei.getElementsByTagName('slur')[0];
        const result = _.spannedMeasures(slur);
        const expected = 3;
        assert.strictEqual(result.length, expected);
      });
    });
  });
});
