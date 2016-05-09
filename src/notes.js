import { flow } from 'lodash/fp';
import _ from '.';

// Sorted by staff and then staffline
export const sorted = (element) =>
  sortByY(_.notes(element));

export const sortByY = (notes) =>
  _.sortBy(notes, [
    flow(_.staff, _.n, a => -a),
    _.staffLine,
  ]);

export const outer = (chord) =>
  _.stemDir(chord) === 'up'
    ? _.lowestNote(chord)
    : _.highestNote(chord);

export const inner = (chord) =>
  _.stemDir(chord) === 'up'
    ? _.highestNote(chord)
    : _.lowestNote(chord);

export const highest = (chord) =>
  _(chord).sortedNotes().last();

export const lowest = (chord) =>
  _(chord).sortedNotes().first();
