import { isArray, mapValues } from 'lodash/fp';
import lodash from 'lodash';
import { cacheTraversals, catchTraversalErrors } from './util/decorators';
import conditionalTraversal from './util/conditionalTraversal';
import * as accidental from './accidental';
import * as ancestorOfType from './ancestorOfType';
import * as attributes from './attributes';
import * as choice from './choice';
import * as clefs from './clefs';
import * as descendantsOfType from './descendantsOfType';
import * as dots from './dots';
import * as durational from './durational';
import * as glyphName from './glyphName';
import * as hairpin from './hairpin';
import * as keySignatures from './keySignatures';
import * as layer from './layer';
import * as measure from './measure';
import * as meter from './meter';
import * as notes from './notes';
import * as spanning from './spanning';
import * as staff from './staff';
import * as staffLine from './staffLine';
import * as stem from './stem';
import * as text from './text';
import * as timeSignatures from './timeSignatures';
import * as tstamp from './tstamp';
import { getAncestors, getDescendants } from './basic';

const _ = lodash.runInContext();
const mapValuesWithKey = mapValues.convert({ cap: false });
const setupCondtionalTraversals = mapValuesWithKey((value, key) =>
  isArray(value)
    ? conditionalTraversal(value, key)
    : value
);

const rawTraversals = setupCondtionalTraversals({
  ancestors: getAncestors,
  descendants: getDescendants,
  ...accidental,
  ...ancestorOfType,
  ...attributes,
  ...choice,
  ...clefs,
  ...descendantsOfType,
  ...dots,
  ...durational,
  ...glyphName,
  ...hairpin,
  ...keySignatures,
  ...layer,
  ...measure,
  ...meter,
  ...notes,
  ...spanning,
  ...staff,
  ...staffLine,
  ...stem,
  ...text,
  ...timeSignatures,
  ...tstamp,
});

export default _.mixin(cacheTraversals(catchTraversalErrors(rawTraversals)));
