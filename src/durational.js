import { flow, allPass, negate } from 'lodash/fp';
import { findPrevious, findNext, findAncestor } from './basic';
import { hasAttribute, getAttribute } from './util/attribute';
import hasTagName from './util/hasTagName';
import _ from '.';

const isDurational = allPass([hasAttribute('dur'), negate(hasAttribute('grace'))]);

export const durationals = (element) =>
  _(element).descendants().filter(isDurational).value();

export const dur = [{
  condition: hasAttribute('dur'),
  traversal: flow(getAttribute('dur'), Number),
}, {
  condition: findAncestor(hasTagName('chord')),
  traversal: (element) =>
    _(element)
      .chord()
      .dur()
      .value(),
}];

export const durational = [{
  condition: findAncestor(hasTagName(['note', 'chord', 'rest', 'space'])),
  traversal: findAncestor(hasTagName(['note', 'chord', 'rest', 'space'])),
}];

export const previousDurational = findPrevious(isDurational, hasTagName('layer'));
export const nextDurational = findNext(isDurational, hasTagName('layer'));

export const nextDurationalInAnyMeasure = (durational) => {
  const nextDurationalInLayer = _.nextDurational(durational);

  if (nextDurationalInLayer) return nextDurationalInLayer;

  const measure = _.measure(durational);
  const nextMeasure = _.nextMeasure(measure);

  if (!nextMeasure) return null;

  const startStaffN = _.n(_.staff(durational));
  const isSameStaff = (staff) => _.n(staff) === startStaffN;
  const nextStaff = find(isSameStaff, _.staffs(nextMeasure));

  if (!nextStaff) return null;

  const startLayerN = _.n(_.layer(durational));
  const isSameLayer = (layer) => _.n(layer) === startLayerN;
  const nextLayer = find(isSameLayer, _.layers(nextStaff));

  if (!nextLayer) return null;

  const layerDescendants = _.descendants(nextLayer);
  const firstLayerDurational = find(isDurational, layerDescendants);

  return firstLayerDurational;
};
