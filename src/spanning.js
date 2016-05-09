import _ from '.';
import { filter, flow, equals, first, last, isEmpty } from 'lodash/fp';
import { findAncestor } from './basic';
import hasTagName from './util/hasTagName';
import { hasAttribute } from './util/attribute';

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
    elements = filter(flow(_.staffN, equals(staff)), elements);
    if (isEmpty(elements)) throw new Error(`Could not find elements with staff=${staff}`);
  }

  const layer = element.getAttribute('layer');
  if (layer) {
    elements = filter(flow(_.layerN, equals(layer)), elements);
    if (isEmpty(elements)) throw new Error(`Could not find elements with layer=${layer}`);
  }

  if (elements.length !== 1) throw new Error('Could not unambiguously determine element');

  return elements[0];
};

export const startElement = [{
  condition: hasAttribute('startId'),
  traversal: elementFromAttribute('startId'),
}, {
  condition: hasAttribute('tstamp'),
  traversal: getElementInTstamp(e => _.startTstamp(e), first),
}];

export const endElement = [{
  condition: hasAttribute('endId'),
  traversal: elementFromAttribute('endId'),
}, {
  condition: hasAttribute('tstamp2'),
  traversal: getElementInTstamp(e => _.endTstamp(e), last),
}];
