import { flow, constant } from 'lodash/fp';
import { findAncestor } from './basic';
import hasTagName from './util/hasTagName';
import { hasAttribute } from './util/attribute';
import _ from '.';

export const sortNotesByY = (notes) =>
  _.sortBy(notes, [
    flow(_.staff, _.n, a => -a),
    _.staffLine,
  ]);

// Sorted by staff and then staffline
export const sortedNotes = (element) =>
  _.sortNotesByY(_.notes(element));

export const outerNote = (chord) =>
  _.stemDir(chord) === 'up'
    ? _.lowestNote(chord)
    : _.highestNote(chord);

export const innerNote = (chord) =>
  _.stemDir(chord) === 'up'
    ? _.highestNote(chord)
    : _.lowestNote(chord);

export const highestNote = (chord) =>
  _(chord).sortedNotes().last();

export const lowestNote = (chord) =>
  _(chord).sortedNotes().first();

// FIXME: Should the following traversals should probably be in a different file?

export const isGrace = [{
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
}];

export const graceElements = (element) =>
  _(element)
    .descendants()
    .filter(e => _(e).isGrace().value())
    .value();

export const durationalsAndGraceElements = (element) =>
  _(element)
    .descendants()
    .filter(hasAttribute('dur'))
    .value();
