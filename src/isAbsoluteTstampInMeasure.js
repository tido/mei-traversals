import { allPass, lte, gt, flow } from 'lodash/fp';
import _ from '.';

export default function isAbsoluteTstampInMeasure(measure, absoluteTstamp) {
  const measureStartAbsoluteTstamp = _.absoluteTstamp(measure);
  const measureEndAbsoluteTstamp = measureStartAbsoluteTstamp + _.actualMeterCount(measure);
  return flow(Number, allPass([
    gt(measureEndAbsoluteTstamp),
    lte(measureStartAbsoluteTstamp),
  ]))(absoluteTstamp);
}
