/* eslint max-len: [0] */

import { assert } from 'chai';
import { parseXML } from './helpers';
import {
  getElementsByTagName,
  findPreviousSibling,
  findNextSibling,
  findAncestor,
  findDescendant,
  findDescendantRight,
  getDescendants,
  findPrevious,
  findNext,
} from '../src/basic';

describe('mei/traversals/basic', () => {
  describe('#getElementsByTagName', () => {
    describe('given two arguments: "note" and a DOM Element with 2 descendant "note" elements', () => {
      let result;
      before(() => {
        const domElement = helpers.getElementWithTwoDescendantNotes();
        result = getElementsByTagName('note', domElement);
      });
      it('returns an array of 2 note elements', () => {
        assert.isArray(result);
        assert.lengthOf(result, 2);
        assert.strictEqual(result[0].tagName, 'note');
        assert.strictEqual(result[1].tagName, 'note');
      });
    });

    describe('given two arguments: "note" and a DOM Element without an "note" attribute', () => {
      let result;
      before(() => {
        const domElement = helpers.getElementWithoutDescendantNotes();
        result = getElementsByTagName('note', domElement);
      });
      it('returns an empty array', () => {
        assert.isArray(result);
        assert.lengthOf(result, 0);
      });
    });

    describe('given two arguments: null and a DOM Element', () => {
      let result;
      before(() => {
        const domElement = helpers.getElementWithTwoDescendantNotes();
        result = getElementsByTagName(null, domElement);
      });
      it('returns an empty array', () => {
        assert.isArray(result);
        assert.lengthOf(result, 0);
      });
    });

    describe('given two arguments: "note" and an object that does not have a getElementsByTagName method', () => {
      let run;
      before(() => {
        run = () => getElementsByTagName('note', {});
      });
      it('throws an error', () => {
        assert.throws(run);
      });
    });
  });

  describe('#findPreviousSibling', () => {
    describe('given a predicate function to match the tag name "note"', () => {
      let fn;
      beforeEach(() => {
        fn = findPreviousSibling((element) => element.tagName === 'note');
      });
      it('returns a function that, when passed a DOM element with multiple preceding siblings matching the predicate, returns the first match', () => {
        assert.isFunction(fn);
        const domElement = helpers.getRestWithTwoPrecedingNotes();
        const result = fn(domElement);
        assert.ok(result);
        if (result) {
          assert.strictEqual(result.getAttribute('xml:id'), 'n02');
        }
      });
      it('returns a function that, when passed a DOM element with no preceding sibling matching the predicate, returns null', () => {
        assert.isFunction(fn);
        const domElement = helpers.getRestWithTwoPrecedingSpaces();
        const result = fn(domElement);
        assert.isNull(result);
      });
    });
  });

  describe('#findNextSibling', () => {
    describe('given a predicate function to match the tag name "note"', () => {
      let fn;
      beforeEach(() => {
        fn = findNextSibling((element) => element.tagName === 'note');
      });
      it('returns a function that, when passed a DOM element with multiple next siblings matching the predicate, returns the first match', () => {
        assert.isFunction(fn);
        const domElement = helpers.getRestWithTwoFollowingNotes();
        const result = fn(domElement);
        assert.ok(result);
        if (result) {
          assert.strictEqual(result.getAttribute('xml:id'), 'n01');
        }
      });
      it('returns a function that, when passed a DOM element with no next sibling matching the predicate, returns null', () => {
        assert.isFunction(fn);
        const domElement = helpers.getRestWithTwoFollowingSpaces();
        const result = fn(domElement);
        assert.isNull(result);
      });
    });
  });

  describe('#findAncestor', () => {
    describe('given a predicate function to match the tag name "note"', () => {
      let fn;
      beforeEach(() => {
        fn = findAncestor((element) => element.tagName === 'note');
      });
      it('returns a function that, when passed a DOM element with multiple ancestor siblings matching the predicate, returns the first match', () => {
        assert.isFunction(fn);
        const domElement = helpers.getRestWithTwoAncestorNotes();
        const result = fn(domElement);
        assert.ok(result);
        if (result) {
          assert.strictEqual(result.getAttribute('xml:id'), 'n02');
        }
      });
      it('returns a function that, when passed a DOM element with no ancestor sibling matching the predicate, returns null', () => {
        assert.isFunction(fn);
        const domElement = helpers.getRestWithTwoAncestorSpaces();
        const result = fn(domElement);
        assert.isNull(result);
      });
    });
  });

  describe('#findDescendant', () => {
    describe('given a predicate function to match the tag name "note"', () => {
      let fn;
      beforeEach(() => {
        fn = findDescendant((element) => element.tagName === 'note');
      });
      it('returns a function that matches parent elements earlier than their ancestors', () => {
        assert.isFunction(fn);
        const domElement = helpers.getRestWithTwoDescendantNotes();
        const result = fn(domElement);
        assert.ok(result);
        if (result) {
          assert.strictEqual(result.getAttribute('xml:id'), 'n01');
        }
      });
      it('returns a function that matches previous siblings earlier than following siblings', () => {
        assert.isFunction(fn);
        const domElement = helpers.getRestWithTwoDescendantSiblingNotes();
        const result = fn(domElement);
        assert.ok(result);
        if (result) {
          assert.strictEqual(result.getAttribute('xml:id'), 'n01');
        }
      });
      it('returns a function that matches descendants of an element earlier than its following siblings', () => {
        assert.isFunction(fn);
        const domElement = helpers.getRestWithDescendantNoteAfterDescendantChord();
        const result = fn(domElement);
        assert.ok(result);
        if (result) {
          assert.strictEqual(result.getAttribute('xml:id'), 'n01');
        }
      });
      it('returns a function that, when passed a DOM element with no ancestor sibling matching the predicate, returns null', () => {
        assert.isFunction(fn);
        const domElement = helpers.getRestWithTwoDescendantSpaces();
        const result = fn(domElement);
        assert.isNull(result);
      });
    });
  });

  describe('#findDescendantRight', () => {
    describe('given a predicate function to match the tag name "note"', () => {
      let fn;
      beforeEach(() => {
        fn = findDescendantRight((element) => element.tagName === 'note');
      });
      it('returns a function that matches parent elements earlier than their ancestors', () => {
        assert.isFunction(fn);
        const domElement = helpers.getRestWithTwoDescendantNotes();
        const result = fn(domElement);
        assert.ok(result);
        if (result) {
          assert.strictEqual(result.getAttribute('xml:id'), 'n01');
        }
      });
      it('returns a function that matches following siblings earlier than previous siblings', () => {
        assert.isFunction(fn);
        const domElement = helpers.getRestWithTwoDescendantSiblingNotes();
        const result = fn(domElement);
        assert.ok(result);
        if (result) {
          assert.strictEqual(result.getAttribute('xml:id'), 'n02');
        }
      });
      it('returns a function that matches descendants of an element earlier than its preceding siblings', () => {
        assert.isFunction(fn);
        const domElement = helpers.getRestWithDescendantChordAfterDescendantNote();
        const result = fn(domElement);
        assert.ok(result);
        if (result) {
          assert.strictEqual(result.getAttribute('xml:id'), 'n02');
        }
      });
      it('returns a function that, when passed a DOM element with no ancestor sibling matching the predicate, returns null', () => {
        assert.isFunction(fn);
        const domElement = helpers.getRestWithTwoDescendantSpaces();
        const result = fn(domElement);
        assert.isNull(result);
      });
    });
  });

  describe('#getDescendants', () => {
    describe('given a rest element with 2 descendant note elements', () => {
      let result;
      before(() => {
        const domElement = helpers.getRestWithTwoDescendantNotes();
        result = getDescendants(domElement);
      });
      it('returns an array containing the 2 descendant note elements', () => {
        assert.isArray(result);
        assert.lengthOf(result, 2);
        assert.strictEqual(result[0].getAttribute('xml:id'), 'n01');
        assert.strictEqual(result[1].getAttribute('xml:id'), 'n02');
      });
    });
    describe('given a rest element with no descendant elements', () => {
      let result;
      before(() => {
        const domElement = helpers.getRestWithTwoAncestorSpaces();
        result = getDescendants(domElement);
      });
      it('returns an empty array', () => {
        assert.isArray(result);
        assert.lengthOf(result, 0);
      });
    });
  });

  describe('#findPrevious', () => {
    describe('given a predicate function to match the tag name "note" and no blockAscent function', () => {
      let fn;
      beforeEach(() => {
        fn = findPrevious((element) => element.tagName === 'note', undefined);
      });

      it('returns a function that matches the last matching preceding sibling', () => {
        assert.isFunction(fn);
        const domElement = helpers.getRestWithTwoPrecedingNotes();
        const result = fn(domElement);
        assert.ok(result);
        if (result) {
          assert.strictEqual(result.getAttribute('xml:id'), 'n02');
        }
      });

      it('returns a function that matches the last descendant of a preceding sibling', () => {
        assert.isFunction(fn);
        const domElement = helpers.getRestWithPrecedingChordWithTwoChildNotes();
        const result = fn(domElement);
        assert.ok(result);
        if (result) {
          assert.strictEqual(result.getAttribute('xml:id'), 'n02');
        }
      });

      it('returns a function that matches a descendant of a preceding element earlier than that element\'s preceding siblings', () => {
        assert.isFunction(fn);
        const domElement = helpers.getRestWithPrecedingChordAndNote();
        const result = fn(domElement);
        assert.ok(result);
        if (result) {
          assert.strictEqual(result.getAttribute('xml:id'), 'n02');
        }
      });

      it('returns a function that doesn\'t match an ancestor of the start element', () => {
        assert.isFunction(fn);
        const domElement = helpers.getRestWithTwoAncestorNotes();
        const result = fn(domElement);
        assert.isNull(result);
      });

      it('returns a function that doesn\'t match a descendant of the start element', () => {
        assert.isFunction(fn);
        const domElement = helpers.getRestWithTwoDescendantNotes();
        const result = fn(domElement);
        assert.isNull(result);
      });

      it('returns a function that matches the last preceding sibling of an ancestor', () => {
        assert.isFunction(fn);
        const domElement = helpers.getRestWithAncestorPrecedingSiblingNote();
        const result = fn(domElement);
        assert.ok(result);
        if (result) {
          assert.strictEqual(result.getAttribute('xml:id'), 'n02');
        }
      });

      it('returns a function that matches the last ancestor of an ancestor\'s preceding sibling', () => {
        assert.isFunction(fn);
        const domElement = helpers.getRestWithAncestorPrecedingSiblingDescendantNote();
        const result = fn(domElement);
        assert.ok(result);
        if (result) {
          assert.strictEqual(result.getAttribute('xml:id'), 'n03');
        }
      });

      it('returns a function that, when passed a DOM element with no previous element matching the predicate, returns null', () => {
        assert.isFunction(fn);
        const domElement = helpers.getRestWithTwoPrecedingSpaces();
        const result = fn(domElement);
        assert.isNull(result);
      });
    });
  });

  describe('#findNext', () => {
    describe('given a predicate function to match the tag name "note" and no blockAscent function', () => {
      let fn;
      beforeEach(() => {
        fn = findNext((element) => element.tagName === 'note', undefined);
      });

      it('returns a function that matches the first matching following sibling', () => {
        assert.isFunction(fn);
        const domElement = helpers.getRestWithTwoFollowingNotes();
        const result = fn(domElement);
        assert.ok(result);
        if (result) {
          assert.strictEqual(result.getAttribute('xml:id'), 'n01');
        }
      });

      it('returns a function that matches the first matching descendant of a following sibling', () => {
        assert.isFunction(fn);
        const domElement = helpers.getRestWithFollowingChordWithTwoChildNotes();
        const result = fn(domElement);
        assert.ok(result);
        if (result) {
          assert.strictEqual(result.getAttribute('xml:id'), 'n01');
        }
      });

      it('returns a function that matches a descendant of a following element earlier than that element\'s following siblings', () => {
        assert.isFunction(fn);
        const domElement = helpers.getRestWithFollowingChordAndNote();
        const result = fn(domElement);
        assert.ok(result);
        if (result) {
          assert.strictEqual(result.getAttribute('xml:id'), 'n01');
        }
      });

      it('returns a function that doesn\'t match an ancestor of the start element', () => {
        assert.isFunction(fn);
        const domElement = helpers.getRestWithTwoAncestorNotes();
        const result = fn(domElement);
        assert.isNull(result);
      });

      it('returns a function that doesn\'t match a descendant of the start element', () => {
        assert.isFunction(fn);
        const domElement = helpers.getRestWithTwoDescendantNotes();
        const result = fn(domElement);
        assert.isNull(result);
      });

      it('returns a function that matches the first matching following sibling of an ancestor', () => {
        assert.isFunction(fn);
        const domElement = helpers.getRestWithAncestorFollowingSiblingNote();
        const result = fn(domElement);
        assert.ok(result);
        if (result) {
          assert.strictEqual(result.getAttribute('xml:id'), 'n01');
        }
      });

      it('returns a function that matches the first matching descendant of an ancestor\'s following sibling', () => {
        assert.isFunction(fn);
        const domElement = helpers.getRestWithAncestorFollowingSiblingDescendantNote();
        const result = fn(domElement);
        assert.ok(result);
        if (result) {
          assert.strictEqual(result.getAttribute('xml:id'), 'n01');
        }
      });

      it('returns a function that, when passed a DOM element with no following element matching the predicate, returns null', () => {
        assert.isFunction(fn);
        const domElement = helpers.getRestWithTwoFollowingSpaces();
        const result = fn(domElement);
        assert.isNull(result);
      });
    });
  });
});

class helpers {
  static getElementWithTwoDescendantNotes() {
    return parseXML(`
      <root>
        <content>
          <chord>
            <note/>
          </chord>
          <note/>
        </content>
      </root>
      `).getElementsByTagName('content')[0];
  }

  static getElementWithoutDescendantNotes() {
    return parseXML(`
      <root>
        <note>
          <note/>
          <note> <!-- <== this element will be the value of domElement -->
            <a/>
            <b/>
          </note>
          <note>
            <note/>
          </note>
        </note>
      </root>
      `).getElementsByTagName('note')[2];
  }

  static getRestWithTwoPrecedingNotes() {
    return parseXML(`
      <root>
        <note xml:id="n01"/>
        <note xml:id="n02"/>
        <rest/>
      </root>
      `).getElementsByTagName('rest')[0];
  }

  static getRestWithTwoPrecedingSpaces() {
    return parseXML(`
      <root>
        <space xml:id="n01"/>
        <space xml:id="n02"/>
        <rest/>
      </root>
      `).getElementsByTagName('rest')[0];
  }

  static getRestWithPrecedingChordWithTwoChildNotes() {
    return parseXML(`
      <root>
        <chord>
          <note xml:id="n01"/>
          <note xml:id="n02"/>
        </chord>
        <rest/>
      </root>
      `).getElementsByTagName('rest')[0];
  }

  static getRestWithPrecedingChordAndNote() {
    return parseXML(`
      <root>
        <note xml:id="n01"/>
        <chord>
          <note xml:id="n02"/>
        </chord>
        <rest/>
      </root>
      `).getElementsByTagName('rest')[0];
  }

  static getRestWithFollowingChordWithTwoChildNotes() {
    return parseXML(`
      <root>
        <rest/>
        <chord>
          <note xml:id="n01"/>
          <note xml:id="n02"/>
        </chord>
      </root>
      `).getElementsByTagName('rest')[0];
  }

  static getRestWithFollowingChordAndNote() {
    return parseXML(`
      <root>
        <rest/>
        <chord>
        <note xml:id="n01"/>
        </chord>
        <note xml:id="n02"/>
      </root>
      `).getElementsByTagName('rest')[0];
  }

  static getRestWithTwoFollowingNotes() {
    return parseXML(`
      <root>
        <rest/>
        <note xml:id="n01"/>
        <note xml:id="n02"/>
      </root>
      `).getElementsByTagName('rest')[0];
  }

  static getRestWithTwoFollowingSpaces() {
    return parseXML(`
      <root>
        <rest/>
        <space xml:id="n01"/>
        <space xml:id="n02"/>
      </root>
      `).getElementsByTagName('rest')[0];
  }

  static getRestWithTwoAncestorNotes() {
    return parseXML(`
      <root>
        <note xml:id="n01">
          <note xml:id="n02">
            <rest/>
          </note>
        </note>
      </root>
      `).getElementsByTagName('rest')[0];
  }

  static getRestWithTwoAncestorSpaces() {
    return parseXML(`
      <root>
        <space xml:id="n01">
          <space xml:id="n02">
            <rest/>
          </space>
        </space>
      </root>
      `).getElementsByTagName('rest')[0];
  }

  static getRestWithTwoDescendantNotes() {
    return parseXML(`
      <root>
        <rest>
          <note xml:id="n01">
            <note xml:id="n02"/>
          </note>
        </rest>
      </root>
      `).getElementsByTagName('rest')[0];
  }

  static getRestWithTwoDescendantSiblingNotes() {
    return parseXML(`
      <root>
        <rest>
          <note xml:id="n01"/>
          <note xml:id="n02"/>
        </rest>
      </root>
      `).getElementsByTagName('rest')[0];
  }

  static getRestWithDescendantNoteAfterDescendantChord() {
    return parseXML(`
      <root>
        <rest>
          <chord>
            <note xml:id="n01"/>
          </chord>
          <note xml:id="n02"/>
        </rest>
      </root>
      `).getElementsByTagName('rest')[0];
  }

  static getRestWithDescendantNoteAfterDescendantChord() {
    return parseXML(`
      <root>
        <rest>
          <chord>
            <note xml:id="n01"/>
          </chord>
          <note xml:id="n02"/>
        </rest>
      </root>
      `).getElementsByTagName('rest')[0];
  }

  static getRestWithDescendantChordAfterDescendantNote() {
    return parseXML(`
      <root>
        <rest>
          <note xml:id="n01"/>
          <chord>
            <note xml:id="n02"/>
          </chord>
        </rest>
      </root>
      `).getElementsByTagName('rest')[0];
  }

  static getRestWithAncestorPrecedingSiblingNote() {
    return parseXML(`
      <root>
        <note xml:id="n01"/>
        <note xml:id="n02"/>
        <beam>
          <rest/>
        </beam>
      </root>
      `).getElementsByTagName('rest')[0];
  }

  static getRestWithAncestorPrecedingSiblingDescendantNote() {
    return parseXML(`
      <root>
        <note xml:id="n01"/>
        <beam>
          <chord>
            <note xml:id="n02"/>
            <note xml:id="n03"/>
          </chord>
        </beam>
        <beam>
          <rest/>
        </beam>
      </root>
      `).getElementsByTagName('rest')[0];
  }

  static getRestWithAncestorFollowingSiblingNote() {
    return parseXML(`
      <root>
        <beam>
          <rest/>
        </beam>
        <note xml:id="n01"/>
        <note xml:id="n02"/>
      </root>
      `).getElementsByTagName('rest')[0];
  }

  static getRestWithAncestorFollowingSiblingDescendantNote() {
    return parseXML(`
      <root>
        <beam>
          <rest/>
        </beam>
        <beam>
          <chord>
            <note xml:id="n01"/>
            <note xml:id="n02"/>
          </chord>
        </beam>
        <note xml:id="n03"/>
      </root>
      `).getElementsByTagName('rest')[0];
  }

  static getRestWithTwoDescendantSpaces() {
    return parseXML(`
      <root>
        <rest>
          <space xml:id="n01">
            <space xml:id="n02"/>
          </space>
        </rest>
      </root>
      `).getElementsByTagName('rest')[0];
  }
}
