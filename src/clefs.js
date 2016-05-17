import hasTagName from './util/hasTagName';
import toCompactArray from './util/toCompactArray';
import {
  flow, map, groupBy, sortBy, keys, concat, findLast, identity, assignWith, filter, reduce,
} from 'lodash/fp';
import _ from '.';

const getKeysSorted = flow(keys, map(Number), sortBy(identity));
const findClosestClefTstamp = (clefTstamps, tstamp) =>
  findLast(clefTstamp => clefTstamp <= tstamp, clefTstamps);

export const clefChangesByTstamp =
  [{
    condition: hasTagName('measure'),
    traversal: (measure) => {
      const clefsByAbsoluteTstamp = _(measure)
        .score()
        .clefsByAbsoluteTstamp()
        .values()
        .reduce(assignWith(toCompactArray));

      const measureStartAbsoluteTstamp = _.absoluteTstamp(measure);
      const measureEndAbsoluteTstamp = measureStartAbsoluteTstamp + _.actualMeterCount(measure);

      const result = _(clefsByAbsoluteTstamp)
        .mapValues((arr, tstamp) => (
          filter((element) => {
            const parentMeasure = _(element).measure().value();
            const isChildOfMeasure = parentMeasure === measure;
            const isClefBetweenMeasures =
            Number(tstamp) === measureEndAbsoluteTstamp && !parentMeasure;

            return isChildOfMeasure || isClefBetweenMeasures;
          }, arr)
        ))
        .pickBy((value) => value && value.length)
        .mapKeys((value, clefAbsoluteTstamp) =>
          Number(clefAbsoluteTstamp) - measureStartAbsoluteTstamp + 1
        ).value();

      return result;
    },
  }];

export const clefsByTstamp =
  [{
    condition: hasTagName('measure'),
    traversal: (measure) =>
      _(measure)
        .staffs()
        .map(_.clefsByTstamp)
        .reduce(assignWith(concat)),
  }, {
    condition: hasTagName('staff'),
    traversal: (staff) => {
      const measure = _.measure(staff);
      const clefsByAbsoluteTstamp = _(measure)
        .score()
        .clefsByAbsoluteTstamp()
        .get(_.n(staff));

      const clefAbsoluteTstamps = getKeysSorted(clefsByAbsoluteTstamp);
      const measureStartAbsoluteTstamp = _.absoluteTstamp(measure);
      const measureEndAbsoluteTstamp = measureStartAbsoluteTstamp + _.actualMeterCount(measure);

      const measureAbsoluteTstamps = flow(
        _.durationalsByAbsoluteTstamp,
        getKeysSorted,
        concat(measureEndAbsoluteTstamp)
      )(measure);

      const clefsByTstampInStaff = reduce((clefsByTstamp, absoluteTstamp) => {
        const closestClefAbsoluteTstamp = findClosestClefTstamp(
          clefAbsoluteTstamps, absoluteTstamp);
        // Converting the tstamp so that it's local to the measure
        const tstamp = absoluteTstamp - measureStartAbsoluteTstamp + 1;
        clefsByTstamp[tstamp] = clefsByAbsoluteTstamp[closestClefAbsoluteTstamp];
        return clefsByTstamp;
      }, {}, measureAbsoluteTstamps);

      return clefsByTstampInStaff;
    },
  }];

// An absolute tstamp is the tstamp relative to the beginning of the score
export const clefsByAbsoluteTstamp =
  [{
    condition: hasTagName('score'),
    traversal: (score) => (
      _(score)
        .clefs()
        .groupBy(_.staffN)
        .mapValues(groupBy(_.absoluteTstamp))
        .value()
    ),
  }];
