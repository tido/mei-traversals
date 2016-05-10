import { flow, allPass, first, eq } from 'lodash/fp';
import _ from '.';
import hasTagName from './util/hasTagName';
import { attributeAsArray, hasAttribute, getAttribute } from './util/attribute';
import { findAncestor, findNext, findPrevious, getElementsByTagName } from './basic';

const layerDescendantTagNames = [
  'clef', 'note', 'chord', 'rest',
  'mRest', 'space', 'tuplet', 'beam',
];

export const staff = [{
  condition: hasAttribute('staff'),
  traversal: (element) => _(element).staffs().first(),
}, {
  condition: allPass([hasTagName('clef'), findAncestor(hasTagName('staffDef'))]),
  traversal: (clef) => {
    const staffDefN = _.staffN(clef);
    const staff = findPrevious(
      allPass([hasTagName('staff'), flow(_.n, eq(staffDefN))]),
      hasTagName(['section', 'score'])
    )(clef);
    return staff;
  },
}, {
  condition: allPass([
    hasTagName(['meterSig', 'keySig']),
    findAncestor(hasTagName('staffDef')),
  ]),
  traversal: (timeSignature) => {
    const staffDefN = _.staffN(timeSignature);
    const staff = findNext(
      allPass([hasTagName('staff'), flow(_.n, eq(staffDefN))]),
      hasTagName(['section', 'score'])
    )(timeSignature);
    return staff;
  },
}, {
  condition: hasTagName(['layer', ...layerDescendantTagNames]),
  traversal: findAncestor(hasTagName('staff')),
}, {
  condition: findAncestor(hasTagName('staff')),
  traversal: findAncestor(hasTagName('staff')),
}];

export const staffs = [{
  condition: hasTagName('measure'),
  traversal: getElementsByTagName('staff'),
}, {
  condition: hasAttribute('staff'),
  traversal: (element) =>
    _(element)
      .measure()
      .staffs()
      .keyBy(_.n)
      .pick(_.staffNs(element))
      .values()
      .value(),
}];

export const staffN = [{
  condition: allPass([
    hasTagName(['clef', 'meterSig', 'keySig']),
    findAncestor(hasTagName('staffDef')),
  ]),
  traversal: (element) => flow(findAncestor(hasTagName('staffDef')), _.n)(element),
}, {
  condition: hasAttribute('staff'),
  traversal: flow(attributeAsArray('staff'), first),
}, {
  condition: findAncestor(hasTagName('staff')),
  traversal: (element) => _(element).staff().n().value(),
}];

export const staffNs = attributeAsArray('staff');

export const staffIndex = (element) =>
  _(element)
    .chain()
    .score()
    .scoreDefs()
    .first()
    .staffDefs()
    .map(_.n)
    .indexOf(_.staffN(element))
    .value();

export const staffIndices = (element) =>
  _(element)
    .chain()
    .score()
    .scoreDefs()
    .first()
    .staffDefs()
    .map(_.n)
    .value()
    .reduce((result, current, index) => {
      if (_.includes(_.staffNs(element), current)) {
        result.push(index);
      }
      return result;
    }, []);

export const staffLines = [{
  condition: hasTagName('staff'),
  traversal: (staff) =>
    _(staff)
      .chain()
      .score()
      .scoreDefs()
      .first()
      .staffDefs()
      .find(staffDef => _.n(staffDef) === _.n(staff))
      .thru(getAttribute('lines'))
      .value(),
}];

export const isMultivoice = [{
  condition: hasTagName('staff'),
  traversal: (element) => _(element).layers().size() > 1,
}];
