import hasTagName from './util/hasTagName';
import {
  flow, map, groupBy, sortBy, keys, findLast, identity, concat, assignWith, reduce,
} from 'lodash/fp';
import _ from '.';
import isAbsoluteTstampInMeasure from './util/isAbsoluteTstampInMeasure';

const getKeysSorted = flow(keys, map(Number), sortBy(identity));

const findClosestKeySignatureTstamp = (keySignatureTstamps, tstamp) =>
  findLast(timeSignatureTstamp => timeSignatureTstamp <= tstamp, keySignatureTstamps);

export const keySignatureChangesByTstamp =
  [{
    condition: hasTagName('measure'),
    traversal: (measure) =>
      _(measure)
        .chain()
        .score()
        .keySignaturesByAbsoluteTstamp()
        .values()
        .reduce(assignWith(concat))
        .pickBy((keySignature, absoluteTstamp) =>
          isAbsoluteTstampInMeasure(measure, absoluteTstamp))
        .mapKeys((keySignature, absoluteTstamp) =>
          Number(absoluteTstamp) - _.absoluteTstamp(measure) + 1)
        .value(),
  }];

export const keySignatureByTstamp =
  [{
    condition: hasTagName('measure'),
    traversal: (measure) =>
      _(measure)
        .staffs()
        .map(_.keySignaturesByTstamp)
        .reduce(assignWith(concat)),
  }, {
    condition: hasTagName('staff'),
    traversal: (staff) => {
      const measure = _.measure(staff);
      const keySignaturesByAbsoluteTstamp = _(measure)
        .score()
        .keySignaturesByAbsoluteTstamp()
        .get(_.n(staff));

      const keySignatureAbsoluteTstamps = getKeysSorted(keySignaturesByAbsoluteTstamp);
      const measureStartAbsoluteTstamp = _.absoluteTstamp(measure);
      const measureEndAbsoluteTstamp = measureStartAbsoluteTstamp + _.actualMeterCount(measure);

      const measureAbsoluteTstamps = flow(
        _.durationalsByAbsoluteTstamp,
        getKeysSorted,
        concat(measureEndAbsoluteTstamp)
      )(measure);

      const keySignaturesByTstampInStaff = reduce((keySignaturesByTstamp, absoluteTstamp) => {
        const closestKeyAbsoluteTstamp = findClosestKeySignatureTstamp(
          keySignatureAbsoluteTstamps, absoluteTstamp);
        // Converting the tstamp so that it's local to the measure
        const tstamp = absoluteTstamp - measureStartAbsoluteTstamp + 1;
        keySignaturesByTstamp[tstamp] = keySignaturesByAbsoluteTstamp[closestKeyAbsoluteTstamp];
        return keySignaturesByTstamp;
      }, {}, measureAbsoluteTstamps);

      return keySignaturesByTstampInStaff;
    },
  }];

// An absolute tstamp is the tstamp relative to the beginning of the score
export const keySignaturesByAbsoluteTstamp =
  [{
    condition: hasTagName('score'),
    traversal: (score) => (
      _(score)
        .keySignatures()
        .groupBy(_.staffN)
        .mapValues(groupBy(_.absoluteTstamp))
        .value()
    ),
  }];
