import { flow, first } from 'lodash/fp';
import _ from '.';
import hasTagName from './util/hasTagName';
import { attributeAsArray, hasAttribute } from './util/attribute';
import { getElementsByTagName, findAncestor } from './basic';

export const layers = [{
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
}];

export const layerN = [{
  condition: hasAttribute('layer'),
  traversal: flow(attributeAsArray('layer'), first),
}, {
  condition: findAncestor(hasTagName('layer')),
  traversal: (element) => _(element).layer().n().value(),
}];

export const layerNs = attributeAsArray('layer');
