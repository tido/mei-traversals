import {
  flatMap, constant, negate, allPass, lte, gte, flow, filter,
  findIndex, slice, eq, cond, first, last, includes,
} from 'lodash/fp';
import { hasAttributes, hasAttribute } from './util/attribute';
import _ from '.';

const isDurational = allPass([hasAttribute('dur'), negate(hasAttribute('grace'))]);

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

export const spannedMeasures = (element) => {
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
};
