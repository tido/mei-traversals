import { getAttribute } from './util/attribute';

export const form = (element) => ({
  cres: 'crescendo',
  dim: 'diminuendo',
}[getAttribute('form', element)]);
