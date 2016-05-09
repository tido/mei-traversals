/* eslint max-len: [0] */

import { assert } from 'chai';
import { getMEI } from './helpers';
import _ from '../src';

describe('text traversals', () => {
  describe('components', () => {
    const testData = [{
      childContent: 'ff',
      expectedResult: [
        { type: 'glyph', glyphName: 'dynamicFF' },
      ],
    }, {
      childContent: 'abcde',
      expectedResult: [
        { type: 'text', content: 'abcde' },
      ],
    }, {
      childContent: 'piu f',
      expectedResult: [
        { type: 'text', content: 'piu ' },
        { type: 'glyph', glyphName: 'dynamicForte' },
      ],
    }, {
      childContent: 'p dolce',
      expectedResult: [
        { type: 'glyph', glyphName: 'dynamicPiano' },
        { type: 'text', content: ' dolce' },
      ],
    }, {
      childContent: 'p quasi pp',
      expectedResult: [
        { type: 'glyph', glyphName: 'dynamicPiano' },
        { type: 'text', content: ' quasi ' },
        { type: 'glyph', glyphName: 'dynamicPP' },
      ],
    }, {
      childContent: 'molto p quasi pp',
      expectedResult: [
        { type: 'text', content: 'molto ' },
        { type: 'glyph', glyphName: 'dynamicPiano' },
        { type: 'text', content: ' quasi ' },
        { type: 'glyph', glyphName: 'dynamicPP' },
      ],
    }, {
      childContent: 'p quasi pp dolce',
      expectedResult: [
        { type: 'glyph', glyphName: 'dynamicPiano' },
        { type: 'text', content: ' quasi ' },
        { type: 'glyph', glyphName: 'dynamicPP' },
        { type: 'text', content: ' dolce' },
      ],
    }, {
      childContent: 'molto p quasi pp dolce',
      expectedResult: [
        { type: 'text', content: 'molto ' },
        { type: 'glyph', glyphName: 'dynamicPiano' },
        { type: 'text', content: ' quasi ' },
        { type: 'glyph', glyphName: 'dynamicPP' },
        { type: 'text', content: ' dolce' },
      ],
    }, {
      childContent: 'f pp dolce',
      expectedResult: [
        { type: 'glyph', glyphName: 'dynamicForte' },
        { type: 'text', content: ' ' },
        { type: 'glyph', glyphName: 'dynamicPP' },
        { type: 'text', content: ' dolce' },
      ],
    }, {
      childContent: 'f  pp dolce',
      expectedResult: [
        { type: 'glyph', glyphName: 'dynamicForte' },
        { type: 'text', content: '  ' },
        { type: 'glyph', glyphName: 'dynamicPP' },
        { type: 'text', content: ' dolce' },
      ],
    }, {
      childContent: '<rend rend="italic" xml:id="r1">uno</rend> due p',
      expectedResult: [
        { type: 'text', content: 'uno', font: { fontStyle: 'italic' } },
        { type: 'text', content: ' due ' },
        { type: 'glyph', glyphName: 'dynamicPiano' },
      ],
    }, {
      childContent: '<rend fontstyle="italic" xml:id="r1">uno</rend> due p',
      expectedResult: [
        { type: 'text', content: 'uno', font: { fontStyle: 'italic' } },
        { type: 'text', content: ' due ' },
        { type: 'glyph', glyphName: 'dynamicPiano' },
      ],
    }, {
      childContent: '<rend fontstyle="normal" xml:id="r1">uno</rend> due p',
      expectedResult: [
        { type: 'text', content: 'uno', font: { fontStyle: '' } },
        { type: 'text', content: ' due ' },
        { type: 'glyph', glyphName: 'dynamicPiano' },
      ],
    }, {
      childContent: '<rend fontstyle="italic" xml:id="r1">uno <rend fontstyle="normal" xml:id="r2">due</rend> tre</rend> p',
      expectedResult: [
        { type: 'text', content: 'uno ', font: { fontStyle: 'italic' } },
        { type: 'text', content: 'due', font: { fontStyle: '' } },
        { type: 'text', content: ' tre', font: { fontStyle: 'italic' } },
        { type: 'text', content: ' ' },
        { type: 'glyph', glyphName: 'dynamicPiano' },
      ],
    }];

    testData.forEach(({ childContent, expectedResult }) => {
      describe(`given a dynamic with child content "${childContent}"`, () => {
        it('returns an array containing the expected glyph components', () => {
          const mei = getMEI(
            'afterStaff',
            `<dynam xml:id="d1" staff="1" layer="1" tstamp="1">${childContent}</dynam>`
          );
          const element = mei.getElementsByTagName('dynam')[0];

          const textComponents = _.textComponents(element);

          assert.isArray(textComponents);
          assert.deepEqual(textComponents, expectedResult);
        });
      });
    });
  });
});
