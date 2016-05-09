import { allPass, negate } from 'lodash/fp';
import { hasAttribute } from './util/attribute';
import hasTagName from './util/hasTagName';
import _ from '.';

const isDurational = allPass([hasAttribute('dur'), negate(hasAttribute('grace'))]);

export const actualMeterCount =
  [{
    condition: hasTagName('measure'),
    traversal: (measure) =>
      _(measure)
        .layers()
        .map(_.actualMeterCount)
        .max(),
  }, {
    condition: hasTagName('layer'),
    traversal: (layer) => {
      const meterUnit = _(layer).measure().meterUnit().value();

      const lastDurational = _(layer).descendants().findLast(isDurational);
      if (lastDurational) {
        const lastTstamp = _.tstamp(lastDurational);
        const duration = _.dur(lastDurational);

        return lastTstamp + (meterUnit / duration);
      }

      return 1 + _(layer).measure().meterCount().value();
    },
  }];

export const count =
  [{
    condition: hasTagName('measure'),
    traversal: () => 4, // FIXME: Get actual meter count
  }];

export const unit =
  [{
    condition: hasTagName('measure'),
    traversal: () => 4, // FIXME: Get actual meter unit
  }];
