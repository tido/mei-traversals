import { curry, allPass, map } from 'lodash/fp';

export const hasAttribute = curry((attributeName, domElement) =>
  domElement.hasAttribute(attributeName)
);

export const hasAttributes = curry((attributeNames, domElement) =>
  allPass(map(hasAttribute, attributeNames))(domElement)
);

export const getAttribute = curry((attributeName, domElement) =>
  domElement.getAttribute(attributeName)
);

// Split an attribute's value into an array
// This assumes space seperated items
export const attributeAsArray = curry((attributeName, domElement) =>
  domElement.getAttribute(attributeName).split(' ')
);
