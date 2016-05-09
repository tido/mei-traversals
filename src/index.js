import {
  find, flow, negate, allPass, constant, isArray, first, eq, split, last, mapValues,
} from 'lodash/fp';
import _ from 'lodash';
import { useCache } from './util/decorators';
import conditionalTraversal from './util/conditionalTraversal';
import { hasAttribute, getAttribute, attributeAsArray } from './util/attribute';
import hasTagName from './util/hasTagName';
import * as tstamp from './tstamp';
import * as spanned from './spanned';
import * as staffLine from './staffLine';
import * as notes from './notes';
import * as clefs from './clefs';
import * as timeSignatures from './timeSignatures';
import * as keySignatures from './keySignatures';
import * as meter from './meter';
import * as stem from './stem';
import * as dots from './dots';
import * as accidental from './accidental';
import * as text from './text';
import * as glyphName from './glyphName';
import * as spanning from './spanning';

const mapValuesWithKey = mapValues.convert({ cap: false });

import {
  getAncestors,
  findAncestor,
  getDescendants,
  findPrevious,
  findNext,
  getElementsByTagName,
} from './basic';

const layerDescendantTagNames = [
  'clef', 'note', 'chord', 'rest',
  'mRest', 'space', 'tuplet', 'beam',
];

const isDurational = allPass([hasAttribute('dur'), negate(hasAttribute('grace'))]);
const isMeasure = hasTagName('measure');
const isLayer = hasTagName('layer');
const getPreviousLayerDurational = findPrevious(isDurational, hasTagName('layer'));
const getNextLayerDurational = findNext(isDurational, hasTagName('layer'));
const getNextMeasure = findNext(isMeasure, hasTagName('mDiv'));
const setupConditionals = mapValuesWithKey((value, key) =>
  isArray(value)
    ? conditionalTraversal(value, key)
    : value
);

const getNextLayerDurationalInAnyMeasure = (durational) => {
  const nextDurationalInLayer = traversals.nextDurational(durational);
  if (nextDurationalInLayer) {
    return nextDurationalInLayer;
  }

  const measure = traversals.measure(durational);
  const nextMeasure = traversals.nextMeasure(measure);

  if (!nextMeasure) {
    return null;
  }

  const startStaffN = traversals.n(traversals.staff(durational));
  const isSameStaff = (staff) => traversals.n(staff) === startStaffN;
  const nextStaff = find(isSameStaff, traversals.staffs(nextMeasure));

  if (!nextStaff) {
    return null;
  }

  const startLayerN = traversals.n(traversals.layer(durational));
  const isSameLayer = (layer) => traversals.n(layer) === startLayerN;
  const nextLayer = find(isSameLayer, traversals.layers(nextStaff));

  if (!nextLayer) {
    return null;
  }

  const layerDescendants = traversals.descendants(nextLayer);
  const firstLayerDurational = find(isDurational, layerDescendants);

  return firstLayerDurational;
};

const traversals = _.mixin(useCache(setupConditionals({
  fings: getElementsByTagName('fing'),
  fingGrp: findAncestor(hasTagName('fingGrp')),
  choice: findAncestor(hasTagName('choice')),
  reg: findAncestor(hasTagName('reg')),
  orig: findAncestor(hasTagName('orig')),
  beam: findAncestor(hasTagName('beam')),
  chord: findAncestor(hasTagName('chord')),
  measure: findAncestor(isMeasure),
  layer: findAncestor(isLayer),
  note: findAncestor(hasTagName('note')),
  score: findAncestor(hasTagName('score')),
  tuplet: findAncestor(hasTagName('tuplet')),
  accids: getElementsByTagName('accid'),
  beams: getElementsByTagName('beam'),
  clefs: getElementsByTagName('clef'),
  keySignatures: getElementsByTagName('keySig'),
  measures: getElementsByTagName('measure'),
  notes: getElementsByTagName('note'),
  scoreDefs: getElementsByTagName('scoreDef'),
  slurs: getElementsByTagName('slur'),
  ties: getElementsByTagName('tie'),
  hairpins: getElementsByTagName('hairpin'),
  verses: getElementsByTagName('verse'),
  syllables: getElementsByTagName('syl'),
  staffDefs: getElementsByTagName('staffDef'),
  timeSignatures: getElementsByTagName('meterSig'),
  tuplets: getElementsByTagName('tuplet'),
  durational: [{
    condition: findAncestor(hasTagName(['note', 'chord', 'rest', 'space'])),
    traversal: findAncestor(hasTagName(['note', 'chord', 'rest', 'space'])),
  }],
  ancestors: getAncestors,
  descendants: getDescendants,
  previousDurational: getPreviousLayerDurational,
  nextDurational: getNextLayerDurational,
  nextDurationalInAnyMeasure: getNextLayerDurationalInAnyMeasure,
  nextMeasure: getNextMeasure,
  accidental: accidental.getFirst,
  accidentals: accidental.getAll,
  sortedNotes: notes.sorted,
  sortNotesByY: notes.sortByY,
  highestNote: notes.highest,
  lowestNote: notes.lowest,
  outerNote: notes.outer,
  innerNote: notes.inner,
  staffLine: staffLine.get,
  meterUnit: meter.unit,
  meterCount: meter.count,
  actualMeterCount: meter.actualMeterCount,
  textComponents: text.components,
  altsym: glyphName.altsym,
  tstamp: tstamp.get,
  startTstamp: tstamp.get,
  measureOffset: flow(getAttribute('tstamp2'), split('m+'), first, Number),
  endTstamp: flow(getAttribute('tstamp2'), split('m+'), last, Number),
  absoluteTstamp: tstamp.absolute,
  isGrace: [{
    condition: findAncestor(hasTagName(('chord'))),
    traversal: flow(findAncestor(hasTagName('chord')), hasAttribute('grace')),
  }, {
    condition: findAncestor(hasTagName(('beam'))),
    traversal: flow(findAncestor(hasTagName('beam')), hasAttribute('grace')),
  }, {
    condition: hasAttribute('dur'),
    traversal: hasAttribute('grace'),
  }, {
    condition: constant(true),
    traversal: constant(false),
  }],
  durationalsAndGraceElements: (element) =>
    _(element)
      .descendants()
      .filter(hasAttribute('dur'))
      .value(),
  graceElements: (element) =>
    _(element)
      .descendants()
      .filter(e => _(e).isGrace().value())
      .value(),
  durationals: (element) => _(element).descendants().filter(isDurational).value(),
  durationalsByTstamp: tstamp.durationalsByTstamp,
  durationalsByAbsoluteTstamp: tstamp.durationalsByAbsoluteTstamp,
  durationalsAtStaffTstamp: tstamp.durationalsAtStaffTstamp,
  allTstampsInOrder: tstamp.getAllTstampsInOrder,
  spannedMeasures: spanned.measures,
  spannedDurationals: spanned.durationals,
  clefsByTstamp: clefs.byTstamp,
  clefsByAbsoluteTstamp: clefs.byAbsoluteTstamp,
  clefChangesByTstamp: clefs.changesByTstamp,
  timeSignaturesByAbsoluteTstamp: timeSignatures.byAbsoluteTstamp,
  timeSignatureChangesByTstamp: timeSignatures.changesByTstamp,
  keySignaturesByTstamp: keySignatures.byTstamp,
  keySignaturesByAbsoluteTstamp: keySignatures.byAbsoluteTstamp,
  keySignatureChangesByTstamp: keySignatures.changesByTstamp,
  startElement: spanning.startElement,
  endElement: spanning.endElement,
  stemDir: stem.direction,
  dots: dots.count,
  lines: flow(getAttribute('lines'), Number),
  line: flow(getAttribute('line'), Number),
  count: flow(getAttribute('count'), Number),
  unit: flow(getAttribute('unit'), Number),
  sym: getAttribute('sym'),
  shape: getAttribute('shape'),
  place: getAttribute('place'),
  form: (element) => ({
    cres: 'crescendo',
    dim: 'diminuendo',
  }[getAttribute('form', element)]),
  choices: (element) =>
    _(element)
      .ancestors()
      .filter(hasTagName('choice'))
      .value(),

  choiceOptions: (element) =>
    _(element)
      .ancestors()
      .filter(hasTagName(['orig', 'reg']))
      .value(),
  glyphName: glyphName.get,
  isInverted: glyphName.isInverted,
  isLong: glyphName.isLong,
  staffN: [{
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
  }],
  staffLines: [{
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
  }],
  staffIndex: (element) =>
    _(element)
      .chain()
      .score()
      .scoreDefs()
      .first()
      .staffDefs()
      .map(_.n)
      .indexOf(_.staffN(element))
      .value(),

  staffIndices: (element) =>
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
      }, []),

  staffNs: attributeAsArray('staff'),
  layerNs: attributeAsArray('layer'),
  octave: flow(getAttribute('oct'), Number),
  pname: getAttribute('pname'),
  mode: getAttribute('mode'),

  layers: [{
    condition: hasTagName(['measure', 'staff']),
    traversal: getElementsByTagName('layer'),
  }, {
    condition: hasAttribute('layer'),
    traversal: (element) => {
      const staffNs = _.staffNs(element);
      const getLayers = staffNs.length > 1
        ? _.layers
        : (layer) => _(layer)
        .layers()
        .keyBy(_.n)
        .pick(_.layerNs(element))
        .values()
        .value();

      return _(element)
        .measure()
        .staffs()
        .keyBy(_.n)
        .pick(staffNs)
        .values()
        .flatMap(getLayers)
        .value();
    },
  }],

  layerN: [{
    condition: hasAttribute('layer'),
    traversal: flow(attributeAsArray('layer'), first),
  }, {
    condition: findAncestor(hasTagName('layer')),
    traversal: (element) => _(element).layer().n().value(),
  }],

  n: [{
    condition: hasTagName('measure'),
    traversal: flow(getAttribute('n'), Number),
  }, {
    condition: hasAttribute('n'),
    traversal: getAttribute('n'),
  }, {
    condition: constant(true),
    traversal: () => { throw new Error('Provided element does not have an "n" attribute'); },
  }],

  staff: [{
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
  }],

  isMultivoice: [{
    condition: hasTagName('staff'),
    traversal: (element) => _(element).layers().size() > 1,
  }],

  staffs: [{
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
  }],

  dur: [{
    condition: hasAttribute('dur'),
    traversal: flow(getAttribute('dur'), Number),
  }, {
    condition: findAncestor(hasTagName('chord')),
    traversal: (element) =>
      _(element)
        .chord()
        .dur()
        .value(),
  }],
})));

export default traversals;
