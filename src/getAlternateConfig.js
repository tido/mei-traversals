import { map, find, filter, flow, first } from 'lodash/fp';

const getId = element => element.getAttribute('xml:id');

export const getAlternateConfig = (mei) =>
  map(choice => {
    const id = getId(choice);
    const orig = find({ tagName: 'orig' }, choice.childNodes);
    const regs = filter({ tagName: 'reg' }, choice.childNodes);
    const options = map(getId, [orig, ...regs]);

    return [id, options];
  }, mei.getElementsByTagName('choice'));

export const getDefaultAlternates = flow(
  getAlternateConfig,
  map(([id, values]) => [id, first(values)])
);
