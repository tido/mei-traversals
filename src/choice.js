import hasTagName from './util/hasTagName';
import _ from '.';

export const choices = (element) =>
  _(element)
    .ancestors()
    .filter(hasTagName('choice'))
    .value();

export const choiceOptions = (element) =>
  _(element)
    .ancestors()
    .filter(hasTagName(['orig', 'reg']))
    .value();
