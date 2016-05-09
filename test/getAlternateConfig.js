/* eslint max-len: [0] */

import { assert } from 'chai';
import { getMEI } from './helpers';
import { getAlternateConfig } from '../src/getAlternateConfig';

describe('#getAlternateConfig', () => {
  describe('mei with no choices', () => {
    let alternateConfig;

    before(() => {
      const mei = getMEI('inLayer', '', {}, false, 'never');

      alternateConfig = getAlternateConfig(mei);
    });

    it('returns a an object keyed by choice id whose entries are the ids of the choices, with the original first', () => {
      assert.deepEqual(alternateConfig, []);
    });
  });

  describe('mei with a single choice', () => {
    let alternateConfig;

    before(() => {
      const mei = getMEI('inLayer', `
        <choice xml:id="choice01">
          <orig xml:id="orig01">
            <note stem.dir="up" pname="c" oct="4" dur="4" xml:id="note01"/>
          </orig>
          <reg xml:id="reg01">
            <beam xml:id="beam01">
              <note stem.dir="up" pname="c" oct="4" dur="16" xml:id="note02"/>
              <note stem.dir="up" pname="b" oct="3" dur="16" xml:id="note03"/>
              <note stem.dir="up" pname="c" oct="4" dur="8" dots="1" xml:id="note04"/>
            </beam>
          </reg>
        </choice>
      `, {}, false, 'never');

      alternateConfig = getAlternateConfig(mei);
    });

    it('returns a pair of id to alternate', () => {
      assert.deepEqual([
        ['choice01', ['orig01', 'reg01']],
      ], alternateConfig);
    });
  });

  describe('mei with a two choices', () => {
    let alternateConfig;

    before(() => {
      const mei = getMEI('inLayer', `
        <choice xml:id="choice01">
          <orig xml:id="orig01">
            <note stem.dir="up" pname="c" oct="4" dur="4" xml:id="note01"/>
          </orig>
          <reg xml:id="reg01">
            <beam xml:id="beam01">
              <note stem.dir="up" pname="c" oct="4" dur="16" xml:id="note02"/>
              <note stem.dir="up" pname="b" oct="3" dur="16" xml:id="note03"/>
              <note stem.dir="up" pname="c" oct="4" dur="8" dots="1" xml:id="note04"/>
            </beam>
          </reg>
        </choice>
        <choice xml:id="choice02">
          <reg xml:id="reg02">
            <beam xml:id="beam01">
              <note stem.dir="up" pname="c" oct="4" dur="16" xml:id="note02"/>
              <note stem.dir="up" pname="b" oct="3" dur="16" xml:id="note03"/>
              <note stem.dir="up" pname="c" oct="4" dur="8" dots="1" xml:id="note04"/>
            </beam>
          </reg>
          <orig xml:id="orig02">
            <note stem.dir="up" pname="c" oct="4" dur="4" xml:id="note01"/>
          </orig>
        </choice>
      `, {}, false, 'never');

      alternateConfig = getAlternateConfig(mei);
    });

    it('returns a pair of id to alternate in source order', () => {
      assert.deepEqual([
        ['choice01', ['orig01', 'reg01']],
        ['choice02', ['orig02', 'reg02']],
      ], alternateConfig);
    });
  });
});
