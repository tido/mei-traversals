/* eslint max-len: [0] */

import { assert } from 'chai';
import { getMEI } from './helpers';
import _ from '../src';

describe('clef traversals', () => {
  describe('#clefChangesByTstamp', () => {
    describe('given a measure with a clef change before tstamp 3', () => {
      it('returns an object containing exactly one property with key "3"', () => {
        const mei = getMEI('inLayer', `
          <note pname="c" oct="4" dur="2" stem.dir="up" xml:id="r12"/>
          <clef line="4" shape="C" xml:id="r13"/>
          <note pname="c" oct="4" dur="2" stem.dir="up" xml:id="r14"/>
        `);

        const measure = mei.getElementsByTagName('measure')[0];
        const result = _.clefChangesByTstamp(measure);
        const tstamps = Object.keys(result);

        const expected = ['3'];
        assert.deepEqual(tstamps, expected);
      });
    });

    describe('given a measure followed by a clef change', () => {
      it('returns an object containing exactly one property with key "6"', () => {
        const mei = getMEI('inSection', `
          <measure n="1" xml:id="r01">
            <staff n="1" xml:id="r02">
              <layer n="1" xml:id="r03">
                <note pname="c" oct="4" dur="1" stem.dir="up" xml:id="r04"/>
              </layer>
            </staff>
          </measure>
          <staffDef n="1" xml:id="r08a">
            <clef line="3" shape="C" xml:id="r08"/>
          </staffDef>
          <measure n="2" xml:id="r09">
            <staff n="1" xml:id="r10">
              <layer n="1" xml:id="r11">
                <note pname="c" oct="4" dur="2" stem.dir="up" xml:id="r12"/>
                <note pname="c" oct="4" dur="2" stem.dir="up" xml:id="r14"/>
              </layer>
            </staff>
          </measure>
        `);

        const measure = mei.getElementsByTagName('measure')[0];
        const result = _.clefChangesByTstamp(measure);
        const tstamps = Object.keys(result);

        const expected = ['6'];
        assert.deepEqual(tstamps, expected);
      });
    });

    describe('given a 2-staff measure followed by a clef change in the first staff', () => {
      it('returns an object containing exactly one property with key "6"', () => {
        const mei = getMEI('twoStavesInSection', `
          <measure n="1" xml:id="r01">
            <staff n="1" xml:id="r02">
              <layer n="1" xml:id="r03">
                <note pname="c" oct="4" dur="1" stem.dir="up" xml:id="r04"/>
              </layer>
            </staff>
            <staff n="2" xml:id="r05">
              <layer n="1" xml:id="r06">
                <note pname="c" oct="4" dur="1" stem.dir="up" xml:id="r07"/>
              </layer>
            </staff>
          </measure>
          <staffDef n="1" xml:id="r08a">
            <clef line="3" shape="C" xml:id="r08"/>
          </staffDef>
          <measure n="2" xml:id="r09">
            <staff n="1" xml:id="r10">
              <layer n="1" xml:id="r11">
                <note pname="c" oct="4" dur="2" stem.dir="up" xml:id="r12"/>
                <note pname="c" oct="4" dur="2" stem.dir="up" xml:id="r14"/>
              </layer>
            </staff>
            <staff n="2" xml:id="r15">
              <layer n="1" xml:id="r16">
                <note pname="c" oct="4" dur="1" stem.dir="up" xml:id="r17"/>
              </layer>
            </staff>
          </measure>
        `);

        const measure = mei.getElementsByTagName('measure')[0];
        const result = _.clefChangesByTstamp(measure);
        const tstamps = Object.keys(result);

        const expected = ['6'];
        assert.deepEqual(tstamps, expected);
      });
    });

    describe('given a 2-staff measure followed by a clef change in the second staff', () => {
      it('returns an object containing exactly one property with key "6"', () => {
        const mei = getMEI('twoStavesInSection', `
          <measure n="1" xml:id="r01">
            <staff n="1" xml:id="r02">
              <layer n="1" xml:id="r03">
                <note pname="c" oct="4" dur="1" stem.dir="up" xml:id="r04"/>
              </layer>
            </staff>
            <staff n="2" xml:id="r05">
              <layer n="1" xml:id="r06">
                <note pname="c" oct="4" dur="1" stem.dir="up" xml:id="r07"/>
              </layer>
            </staff>
          </measure>
          <staffDef n="2" xml:id="r08a">
            <clef line="3" shape="C" xml:id="r08"/>
          </staffDef>
          <measure n="2" xml:id="r09">
            <staff n="1" xml:id="r10">
              <layer n="1" xml:id="r11">
                <note pname="c" oct="4" dur="2" stem.dir="up" xml:id="r12"/>
                <note pname="c" oct="4" dur="2" stem.dir="up" xml:id="r14"/>
              </layer>
            </staff>
            <staff n="2" xml:id="r15">
              <layer n="1" xml:id="r16">
                <note pname="c" oct="4" dur="1" stem.dir="up" xml:id="r17"/>
              </layer>
            </staff>
          </measure>
        `);

        const measure = mei.getElementsByTagName('measure')[0];
        const result = _.clefChangesByTstamp(measure);
        const tstamps = Object.keys(result);

        const expected = ['6'];
        assert.deepEqual(tstamps, expected);
      });
    });
  });
});
