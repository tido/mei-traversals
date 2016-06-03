import {
  flatMap, constant, negate, allPass, lte, gte, flow, filter,
  findIndex, slice, eq, cond, first, last, includes, isEmpty,
  dropWhile, dropRightWhile,
} from 'lodash/fp';
import { hasAttributes, hasAttribute } from './util/attribute';
import hasTagName from './util/hasTagName';
import { findAncestor } from './basic';
import _ from '.';

const isDurational = allPass([hasAttribute('dur'), negate(hasAttribute('grace'))]);

const elementFromAttribute = (attribute) => (element) => {
  const id = element.getAttribute(attribute).substring(1);
  return _(findAncestor(hasTagName('score'))(element))
    .descendants()
    .find(e => e.getAttribute('xml:id') === id);
};

const getElementInTstamp = (tstampGetter, measureGetter) => (element) => {
  const tstamp = tstampGetter(element);

  const measures = _.spannedMeasures(element);
  const measure = measureGetter(measures);
  let elements = _.durationalsByTstamp(measure)[tstamp];

  if (isEmpty(elements)) throw new Error(`Could not find elements with tstamp=${tstamp}`);

  const staff = element.getAttribute('staff');
  if (staff) {
    elements = filter(flow(_.staffN, eq(staff)), elements);
    if (isEmpty(elements)) throw new Error(`Could not find elements with staff=${staff}`);
  }

  const layer = element.getAttribute('layer');
  if (layer) {
    elements = filter(flow(_.layerN, eq(layer)), elements);
    if (isEmpty(elements)) throw new Error(`Could not find elements with layer=${layer}`);
  }

  if (elements.length !== 1) throw new Error('Could not unambiguously determine element');

  return elements[0];
};

export const startElement = [{
  condition: hasAttribute('startid'),
  traversal: elementFromAttribute('startid'),
}, {
  condition: hasAttribute('tstamp'),
  traversal: getElementInTstamp(e => _.startTstamp(e), first),
}];

export const endElement = [{
  condition: hasAttribute('endid'),
  traversal: elementFromAttribute('endid'),
}, {
  condition: hasAttribute('tstamp2'),
  traversal: getElementInTstamp(e => _.endTstamp(e), last),
}];

export const spannedDurationals =
  [{
    condition: hasAttributes(['tstamp', 'tstamp2', 'layer']),
    traversal: (element) => {
      const spannedMeasures = _(element).spannedMeasures().value();
      const staffN = _.staffN(element);
      const getDescendantDurationals = flow(
        _.descendants,
        filter(allPass([isDurational, flow(_.staffN, eq(staffN))]))
      );

      const durationals = flatMap(cond([
        [
          eq(first(spannedMeasures)),
          flow(getDescendantDurationals, filter(flow(_.tstamp, lte(_.startTstamp(element))))),
        ],
        [
          eq(last(spannedMeasures)),
          flow(getDescendantDurationals, filter(flow(_.tstamp, gte(_.endTstamp(element))))),
        ],
        [
          constant(true),
          getDescendantDurationals,
        ],
      ]), spannedMeasures);

      return durationals;
    },
  }, {
    condition: hasAttributes(['tstamp', 'tstamp2']),
    traversal: (element) => {
      const spannedMeasures = _(element).spannedMeasures().value();
      const staffNs = _.staffNs(element);
      const getDescendantDurationals = flow(
        _.descendants,
        filter(allPass([isDurational, flow(_.staffN, (staffN) => includes(staffN, staffNs))]))
      );

      const durationals = flatMap(cond([
        [
          eq(first(spannedMeasures)),
          flow(getDescendantDurationals, filter(flow(_.tstamp, lte(_.startTstamp(element))))),
        ],
        [
          eq(last(spannedMeasures)),
          flow(getDescendantDurationals, filter(flow(_.tstamp, gte(_.endTstamp(element))))),
        ],
        [
          constant(true),
          getDescendantDurationals,
        ],
      ]), spannedMeasures);

      return durationals;
    },
  }];

export const spannedMeasures = [{
  condition: hasAttribute('endid'),
  traversal: (element) => {
    const allMeasures = _(element).score().measures().value();
    const startMeasure = _(element).measure().value();
    const endMeasure = _(element).endElement().measure().value();
    const result = flow(
      dropWhile(measure => measure !== startMeasure),
      dropRightWhile(measure => measure !== endMeasure)
    )(allMeasures);

    return result;
  },
}, {
  condition: hasAttribute('tstamp2'),
  traversal: (element) => {
    const measureOffset = _.measureOffset(element);
    const result = _(element)
      .score()
      .measures()
      .thru((measures) => {
        const startIndex = findIndex(measure => measure === _.measure(element), measures);
        const endIndex = startIndex + measureOffset;
        return slice(startIndex, endIndex + 1, measures);
      })
      .value();

    return result;
  },
}];
