import {
  last, isEqual, partial, flow, map, flatten,
  flattenDeep, flatMap, reduce, curry, assign,
} from 'lodash/fp';

import _ from '.';
import { isElementNode, isTextNode } from './util/isNodeType';
import hasTagName from './util/hasTagName';

const dynamTextToGlyphName = {
  ff: 'dynamicFF',
  fff: 'dynamicFFF',
  ffff: 'dynamicFFFF',
  fffff: 'dynamicFFFFF',
  ffffff: 'dynamicFFFFFF',
  f: 'dynamicForte',
  fp: 'dynamicFortePiano',
  fz: 'dynamicForzando',
  mf: 'dynamicMF',
  mp: 'dynamicMP',
  pf: 'dynamicPF',
  pp: 'dynamicPP',
  ppp: 'dynamicPPP',
  pppp: 'dynamicPPPP',
  ppppp: 'dynamicPPPPP',
  pppppp: 'dynamicPPPPPP',
  p: 'dynamicPiano',
  rf: 'dynamicRinforzando1',
  rfz: 'dynamicRinforzando2',
  sf: 'dynamicSforzando1',
  sfpp: 'dynamicSforzandoPianissimo',
  sfp: 'dynamicSforzandoPiano',
  sfz: 'dynamicSforzato',
  sffz: 'dynamicSforzatoFF',
  sfzp: 'dynamicSforzatoPiano',
};

const getTextComponents =
  curry((textToGlyphMap, element) =>
    flow(
      componentsFromElement(textToGlyphMap, {}),
      flattenDeep,
      reduce(combineSubsequentTexts, []),
    )(element));

const componentsFromElement = curry((textToGlyphMap, parentFont, element) => map(
    componentsFromChildNode(
      textToGlyphMap,
      assign(parentFont, getFontSpec(element), {})
    ),
    element.childNodes
  ));

const componentsFromChildNode = curry((textToGlyphMap, font, node) => {
  if (isTextNode(node)) {
    return componentsFromString(textToGlyphMap, font, node.nodeValue);
  } else if (isElementNode(node)) {
    switch (node.tagName) {
      case 'symbol':
        const glyphName = glyphNameFromSymbol(node);
        if (glyphName) {
          return { type: 'glyph', glyphName };
        }
        break;
      case 'stack':
        return { type: 'text', content: '\n', ...font };
      case 'rend':
        return componentsFromElement(textToGlyphMap, font, node);
      default:
        throw new Error(`unexpected child element <${node.tagName}>`);
    }
  }
  return [];
});

const glyphNameFromSymbol = (element) => {
  const ref = element.getAttribute('ref');
  if (typeof ref === 'string' && ref.substr(0, 1) === '#') {
    return ref.substr(1);
  }
  return null;
};

const componentsFromString = (textToGlyphMap, font, text) => flow(
  (text) => text.split(/(?=[\s,])/),
  map(separateSpaces),
  flatten,
  map(partial(createComponent, [textToGlyphMap, font]))
)(text);

const separateSpaces = (token) => {
  const match = token.match(/([\s,]+)?(.*)/);
  if (match) {
    if (match[1]) {
      return match.slice(1);
    } else {
      return match[2];
    }
  }
  return null;
};

const createComponent = (textToGlyphMap, font, token) =>
  (textToGlyphMap[token])
    ? { type: 'glyph', glyphName: textToGlyphMap[token] }
    : { type: 'text', content: token, ...font };

const getFontSpec = (element) => {
  if (element.getAttribute('fontstyle') === 'italic' ||
      element.getAttribute('rend') === 'italic') {
    return { font: { fontStyle: 'italic' } };
  } else if (element.getAttribute('fontstyle') === 'normal') {
    return { font: { fontStyle: '' } };
  }
  return {};
};

const combineSubsequentTexts = (result, component) => {
  const previousComponent = last(result);
  if (
    isText(component) &&
    isText(previousComponent) &&
    isEqual(component.font, previousComponent.font)
  ) {
    previousComponent.content += component.content;
  } else {
    result.push(component);
  }
  return result;
};

const isText = (component) => !!component && component.type === 'text';

export const components =
  [{
    condition: hasTagName('dynam'),
    traversal: getTextComponents(dynamTextToGlyphName),
  }, {
    condition: hasTagName('fing'),
    traversal: getTextComponents({}),
  }, {
    condition: hasTagName('fingGrp'),
    traversal: (element) => {
      const textComponentGroups = flow(
        _.fings,
        map(_.textComponents),
      )(element);
      if (element.getAttribute('form') === 'subst') {
        textComponentGroups.forEach((group, index) => {
          if (index < textComponentGroups.length - 1) {
            // TODO check if there is a more suitable glyph in Bravura
            const glyphName = element.getAttribute('place') === 'above'
              ? 'articLaissezVibrerAbove'
              : 'articLaissezVibrerBelow';
            group.push({ type: 'glyph', glyphName });
          }
        });
      }
      return reduce(combineSubsequentTexts, [], flatten(textComponentGroups));
    },
  }, {
    condition: hasTagName('syl'),
    traversal: (element) => {
      const textComponents = getTextComponents({})(element);
      if (element.getAttribute('con') === 'b') {
        textComponents.push({ type: 'glyph', glyphName: 'lyricsElisionNarrow' });
      }

      return textComponents;
    },
  }, {
    condition: hasTagName('verse'),
    traversal: (element) => flow(
        _.syllables,
        flatMap(_.textComponents),
        reduce(combineSubsequentTexts, [])
      )(element),
  }];
