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
        <chord dur="1" stem.dir="up" xml:id="i11a">
          <note pname="c" oct="4" xml:id="i12"/>
          <note pname="e" oct="4" xml:id="i12a"/>
        </chord>
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
  describe('#spannedDurationals', () => {
    describe('given a spanning element with a tstamp2 "0m+3"', () => {
      it('returns 2', () => {
        const testData = getTestData('<slur xml:id="s1" tstamp="1" tstamp2="0m+3" staff="1" layer="1"/>');
        const mei = getMEI('inSection', testData);
        const slur = mei.getElementsByTagName('slur')[0];
        const result = _.spannedDurationals(slur);
        const expectedLength = 2;
        assert.lengthOf(result, expectedLength);
      });
    });

    describe('given a spanning element with a tstamp2 "2m+1"', () => {
      it('returns 4', () => {
        const testData = getTestData('<slur xml:id="s1" tstamp="1" tstamp2="2m+1" staff="1" layer="1"/>');
        const mei = getMEI('inSection', testData);
        const slur = mei.getElementsByTagName('slur')[0];
        const result = _.spannedDurationals(slur);
        const expectedLength = 4;
        assert.lengthOf(result, expectedLength);
      });
    });

    describe('given a spanning element with an endid in the same measure', () => {
      it('returns 2', () => {
        const testData = getTestData('<slur xml:id="s1" startid="#i04" endid="#i04a" staff="1" layer="1"/>');
        const mei = getMEI('inSection', testData);
        const slur = mei.getElementsByTagName('slur')[0];
        const result = _.spannedDurationals(slur);
        const expectedLength = 2;
        assert.lengthOf(result, expectedLength);
      });
    });

    describe('given a spanning element with an endid in the second-next measure', () => {
      it('returns 4', () => {
        const testData = getTestData('<slur xml:id="s1" startid="#i04" endid="#i12" staff="1" layer="1"/>');
        const mei = getMEI('inSection', testData);
        const slur = mei.getElementsByTagName('slur')[0];
        const result = _.spannedDurationals(slur);
        const expectedLength = 4;
        assert.lengthOf(result, expectedLength);
      });
    });
  });

  describe('#spannedMeasures', () => {
    describe('given a spanning element with a tstamp2 "0m+3"', () => {
      it('returns 1', () => {
        const testData = getTestData('<slur xml:id="s1" tstamp="1" tstamp2="0m+3" staff="1" layer="1"/>');
        const mei = getMEI('inSection', testData);
        const slur = mei.getElementsByTagName('slur')[0];
        const result = _.spannedMeasures(slur);
        const expectedLength = 1;
        assert.lengthOf(result, expectedLength);
      });
    });

    describe('given a spanning element with a tstamp2 "2m+1"', () => {
      it('returns 3', () => {
        const testData = getTestData('<slur xml:id="s1" tstamp="1" tstamp2="2m+1" staff="1" layer="1"/>');
        const mei = getMEI('inSection', testData);
        const slur = mei.getElementsByTagName('slur')[0];
        const result = _.spannedMeasures(slur);
        const expectedLength = 3;
        assert.lengthOf(result, expectedLength);
      });
    });

    describe('given a spanning element with an endid in the same measure', () => {
      it('returns 1', () => {
        const testData = getTestData('<slur xml:id="s1" startid="#i04" endid="#i04a" staff="1" layer="1"/>');
        const mei = getMEI('inSection', testData);
        const slur = mei.getElementsByTagName('slur')[0];
        const result = _.spannedMeasures(slur);
        const expectedLength = 1;
        assert.lengthOf(result, expectedLength);
      });
    });

    describe('given a spanning element with an endid in the second-next measure', () => {
      it('returns 3', () => {
        const testData = getTestData('<slur xml:id="s1" startid="#i04" endid="#i12" staff="1" layer="1"/>');
        const mei = getMEI('inSection', testData);
        const slur = mei.getElementsByTagName('slur')[0];
        const result = _.spannedMeasures(slur);
        const expectedLength = 3;
        assert.lengthOf(result, expectedLength);
      });
    });
  });
});
