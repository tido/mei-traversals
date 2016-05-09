import lodash, {
  negate, allPass, anyPass, constant, flow, keys, map, sortBy, concat, identity,
} from 'lodash/fp';
import { hasAttribute, getAttribute } from './util/attribute';
import { findAncestor, findPrevious, findNext } from './basic';
import hasTagName from './util/hasTagName';
import _ from '.';

const isDurational = allPass([
  hasAttribute('dur'),
  negate(hasAttribute('grace')),
]);

export const get =
  [{
    condition: hasAttribute('tstamp'),
    traversal: flow(getAttribute('tstamp'), Number),
  }, {
    condition: allPass([isDurational, element => !_.previousDurational(element)]),
    traversal: constant(1),
  }, {
    condition: isDurational,
    traversal: (element) => {
      const previousDurational = _.previousDurational(element);
      const meterUnit = _(element).measure().meterUnit().value();
      const previousTstamp = _.tstamp(previousDurational);
      return previousTstamp + (meterUnit / _.dur(previousDurational));
    },
  }, {
    condition: hasAttribute('grace'),
    // FIXME: grace note at end of measure
    traversal: (note) => _(note).nextDurational().tstamp().value(),
  }, {
    condition: allPass([hasTagName('note'), findAncestor(hasTagName('chord'))]),
    traversal: (note) => _(note).chord().tstamp().value(),
  }, {
    condition: allPass([hasTagName('verse'), findAncestor(hasTagName('chord'))]),
    traversal: (verse) => _(verse).chord().tstamp().value(),
  }, {
    condition: allPass([hasTagName('verse'), findAncestor(hasTagName('note'))]),
    traversal: (verse) => _(verse).note().tstamp().value(),
  }, {
    condition: allPass([
      hasTagName(['clef', 'meterSig', 'keySig']),
      findAncestor(hasTagName('measure')),
      findNext(isDurational, hasTagName('layer')),
    ]),
    traversal: (element) => _(element).nextDurational().tstamp().value(),
  }, {
    condition: allPass([
      hasTagName(['clef', 'meterSig', 'keySig']),
      findAncestor(hasTagName('measure')),
    ]),
    traversal: (element) => {
      const measure = _.measure(element);
      return _.actualMeterCount(measure);
    },
  }, {
    condition: hasTagName(['clef', 'meterSig', 'keySig']),
    traversal: (element) => {
      const precedingMeasure = findPrevious(hasTagName('measure'))(element);
      return _.actualMeterCount(precedingMeasure);
    },
  }, {
    condition: hasTagName('mRest'),
    traversal: constant(1),
  }];

/*
Example of absolute tstamps in a 4/4 meter:

tstamp          1     2     3     4     5     6     7     8     9
measures        m1                            m2
quarter notes   m1q1  m1q2  m1q3  m1q4        m2q1  m2q2  m2q3  m2q4
clefs           $cl1  $cl2  $cl3  $cl4        $cl5
                $cl0                          $cl6
                                              $cl7

$cl0 = clef in the initial scoreDef before the first measure
$cl1 = clef preceding m1q1
$cl1 = clef preceding m1q1
$cl2 = clef preceding m1q2
$cl3 = clef preceding m1q3
$cl4 = clef preceding m1q4
$cl5 = clef following m1q4 in the same layer
$cl6 = clef between measures 1 und 2
$cl7 = clef at the end of measure 1
*/
export const absolute = [{
  condition: hasTagName('measure'),
  traversal: (measure) => {
    const previousMeasure = findPrevious(hasTagName('measure'))(measure);
    if (!previousMeasure) return 1;
    return _.absoluteTstamp(previousMeasure) + _.actualMeterCount(previousMeasure);
  },
}, {
  condition: anyPass([
    isDurational,
    allPass([
      hasTagName(['clef', 'meterSig', 'keySig']),
      findAncestor(hasTagName('measure')),
      findNext(isDurational, hasTagName('layer')),
    ]),
  ]),
  traversal: (element) =>
    _(element).measure().absoluteTstamp().value() + _.tstamp(element) - 1,
}, {
  condition: anyPass([
    isDurational,
    allPass([hasTagName(['clef', 'meterSig', 'keySig']), findAncestor(hasTagName('measure'))]),
  ]),
  traversal: (element) =>
    _(element).measure().absoluteTstamp().value() + _.tstamp(element),
}, {
  condition: allPass([hasTagName('note'), findAncestor(hasTagName('chord'))]),
  traversal: (note) => _(note).chord().absoluteTstamp().value(),
}, {
  condition: allPass([hasTagName(['clef', 'meterSig', 'keySig']), findNext(hasTagName('measure'))]),
  traversal: (element) => {
    const nextMeasure = findNext(hasTagName('measure'))(element);
    return _.absoluteTstamp(nextMeasure);
  },
}, {
  condition: allPass([
    hasTagName(['clef', 'meterSig', 'keySig']),
    findPrevious(hasTagName('measure')),
  ]),
  traversal: (element) => {
    const previousMeasure = findPrevious(hasTagName('measure'))(element);
    return _.absoluteTstamp(previousMeasure) + _.actualMeterCount(previousMeasure);
  },
}, {
  condition: hasTagName('mRest'),
  traversal: (element) => {
    const measure = _(element).measure().value();
    return _.absoluteTstamp(measure);
  },
}];

export const durationalsByTstamp = (element) =>
  _(element)
    .descendants()
    .filter(isDurational)
    .groupBy(_.tstamp)
    .value();

export const durationalsByAbsoluteTstamp = (element) =>
  _(element)
    .descendants()
    .filter(isDurational)
    .groupBy(_.absoluteTstamp)
    .value();

export const durationalsAtStaffTstamp = (element) =>
  _(element)
    .staff()
    .durationalsByTstamp()
    .get(_.tstamp(element));

export const getAllTstampsInOrder = (measure) => flow(
  _.durationalsByTstamp,
  keys,
  map(Number),
  sortBy(identity),
  concat(lodash, _.actualMeterCount(measure))
)(measure);
