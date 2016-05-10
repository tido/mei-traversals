import hasTagName from './util/hasTagName';
import { groupBy, assignWith, concat } from 'lodash/fp';
import _ from '.';
import isAbsoluteTstampInMeasure from './isAbsoluteTstampInMeasure';

export const timeSignatureChangesByTstamp =
  [{
    condition: hasTagName('measure'),
    traversal: (measure) =>
      _(measure)
        .chain()
        .score()
        .timeSignaturesByAbsoluteTstamp()
        .values()
        .reduce(assignWith(concat))
        .pickBy((timeSignatures, absoluteTstamp) =>
          isAbsoluteTstampInMeasure(measure, absoluteTstamp))
        .mapKeys((timeSignatures, absoluteTstamp) =>
          Number(absoluteTstamp) - _.absoluteTstamp(measure) + 1)
        .value(),
  }];

// An absolute tstamp is the tstamp relative to the beginning of the score
export const timeSignaturesByAbsoluteTstamp =
  [{
    condition: hasTagName('score'),
    traversal: (score) =>
      _(score)
        .timeSignatures()
        .groupBy(_.staffN)
        .mapValues(groupBy(_.absoluteTstamp))
        .value(),
  }];
