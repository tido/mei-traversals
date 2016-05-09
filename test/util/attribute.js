/* eslint max-len: [0] */

import { assert } from 'chai';
import { parseXML } from './util';
import { hasAttribute, hasAttributes, getAttribute, attributeAsArray } from '../src/attribute';

describe('mei/traversals/attribute', () => {
  describe('#hasAttribute', () => {
    describe('given one argument "n"', () => {
      let fn;
      beforeEach(() => {
        fn = hasAttribute('n');
      });
      it('returns a function that returns true when passed a DOM Element with an "n" attribute', () => {
        assert.isFunction(fn);
        const domElement = parseXML('<a n=""/>').getElementsByTagName('a')[0];
        const result = fn(domElement);
        assert.isTrue(result);
      });
      it('returns a function that returns false when passed a DOM Element without an "n" attribute', () => {
        assert.isFunction(fn);
        const domElement = parseXML('<a/>').getElementsByTagName('a')[0];
        const result = fn(domElement);
        assert.isFalse(result);
      });
      it('returns a function that throws an error when the first argument doesn\'t have a getAttribute method', () => {
        assert.isFunction(fn);
        const run = () => fn({});
        assert.throws(run);
      });
    });

    describe('given two arguments: "n" and a DOM Element with an "n" attribute', () => {
      let result;
      before(() => {
        const domElement = parseXML('<a n=""/>').getElementsByTagName('a')[0];
        result = hasAttribute('n', domElement);
      });
      it('returns true', () => {
        assert.isTrue(result);
      });
    });

    describe('given two arguments: "n" and a DOM Element without an "n" attribute', () => {
      let result;
      before(() => {
        const domElement = parseXML('<a/>').getElementsByTagName('a')[0];
        result = hasAttribute('n', domElement);
      });
      it('returns false', () => {
        assert.isFalse(result);
      });
    });

    describe('given two arguments: null and a DOM Element', () => {
      let result;
      before(() => {
        const domElement = parseXML('<a/>').getElementsByTagName('a')[0];
        result = hasAttribute(null, domElement);
      });
      it('returns false', () => {
        assert.isFalse(result);
      });
    });

    describe('given two arguments: "n" and an object that does not have a getAttribute method', () => {
      let run;
      before(() => {
        run = () => hasAttribute('n', {});
      });
      it('throws an error', () => {
        assert.throws(run);
      });
    });
  });

  describe('#hasAttributes', () => {
    describe('given one argument ["n", "b"]', () => {
      let fn;
      beforeEach(() => {
        fn = hasAttributes(['n', 'b']);
      });
      it('returns a function that returns true when passed a DOM Element with an "n" and a "b" attribute', () => {
        assert.isFunction(fn);
        const domElement = parseXML('<a n="" b=""/>').getElementsByTagName('a')[0];
        const result = fn(domElement);
        assert.isTrue(result);
      });
      it('returns a function that returns false when passed a DOM Element with an "n" but no "b" attribute', () => {
        assert.isFunction(fn);
        const domElement = parseXML('<a n=""/>').getElementsByTagName('a')[0];
        const result = fn(domElement);
        assert.isFalse(result);
      });
      it('returns a function that returns false when passed a DOM Element with an "b" but no "n" attribute', () => {
        assert.isFunction(fn);
        const domElement = parseXML('<a b=""/>').getElementsByTagName('a')[0];
        const result = fn(domElement);
        assert.isFalse(result);
      });
      it('returns a function that returns false when passed a DOM Element without an "n" or "b" attribute', () => {
        assert.isFunction(fn);
        const domElement = parseXML('<a x=""/>').getElementsByTagName('a')[0];
        const result = fn(domElement);
        assert.isFalse(result);
      });
      it('returns a function that throws an error when the first argument doesn\'t have a getAttribute method', () => {
        assert.isFunction(fn);
        const run = () => fn({});
        assert.throws(run);
      });
    });

    describe('given two arguments: ["n", "b"] and a DOM Element with an "n" and a "b" attribute', () => {
      let result;
      before(() => {
        const domElement = parseXML('<a n="" b=""/>').getElementsByTagName('a')[0];
        result = hasAttributes(['n', 'b'], domElement);
      });
      it('returns true', () => {
        assert.isTrue(result);
      });
    });

    describe('given two arguments: ["n", "b"] and a DOM Element with an "n" but no "b" attribute', () => {
      let result;
      before(() => {
        const domElement = parseXML('<a n=""/>').getElementsByTagName('a')[0];
        result = hasAttributes(['n', 'b'], domElement);
      });
      it('returns false', () => {
        assert.isFalse(result);
      });
    });

    describe('given two arguments: ["n", "b"] and a DOM Element with a "b" but no "n" attribute', () => {
      let result;
      before(() => {
        const domElement = parseXML('<a b=""/>').getElementsByTagName('a')[0];
        result = hasAttributes(['n', 'b'], domElement);
      });
      it('returns false', () => {
        assert.isFalse(result);
      });
    });

    describe('given two arguments: ["n", "b"] and a DOM Element without a "b" or "n" attribute', () => {
      let result;
      before(() => {
        const domElement = parseXML('<a x=""/>').getElementsByTagName('a')[0];
        result = hasAttributes(['n', 'b'], domElement);
      });
      it('returns false', () => {
        assert.isFalse(result);
      });
    });

    describe('given two arguments: ["n", "b"] and an object that does not have a getAttribute method', () => {
      let run;
      before(() => {
        run = () => hasAttributes(['n', 'b'], {});
      });
      it('throws an error', () => {
        assert.throws(run);
      });
    });

    // watch out -- this is unexpected: getAttributes returns true, getAttribute returns false in this case!
    describe('given two arguments: null and a DOM Element', () => {
      let result;
      before(() => {
        const domElement = parseXML('<a/>').getElementsByTagName('a')[0];
        result = hasAttributes(null, domElement);
      });
      it('returns true', () => {
        assert.isTrue(result);
      });
    });
  });

  describe('#getAttribute', () => {
    describe('given one argument "n"', () => {
      let fn;
      beforeEach(() => {
        fn = getAttribute('n');
      });
      it('returns a function that returns "asdf" when passed a DOM Element with n="asdf"', () => {
        assert.isFunction(fn);
        const value = 'asdf';
        const domElement = parseXML(`<a n="${value}"/>`).getElementsByTagName('a')[0];
        const result = fn(domElement);
        assert.strictEqual(result, value);
      });
      it('returns a function that returns "" when passed a DOM Element with n=""', () => {
        assert.isFunction(fn);
        const value = '';
        const domElement = parseXML(`<a n="${value}"/>`).getElementsByTagName('a')[0];
        const result = fn(domElement);
        assert.strictEqual(result, value);
      });
      it('returns a function that returns null when passed a DOM Element without an n attribute', () => {
        assert.isFunction(fn);
        const domElement = parseXML('<a/>').getElementsByTagName('a')[0];
        const result = fn(domElement);
        assert.strictEqual(result, '');
      });
      it('returns a function that throws an error when the first argument doesn\'t have a getAttribute method', () => {
        assert.isFunction(fn);
        const run = () => fn({});
        assert.throws(run);
      });
    });

    describe('given two arguments: "n" and a DOM Element n="asdf" attribute', () => {
      const value = 'asdf';
      let result;
      before(() => {
        const domElement = parseXML(`<a n="${value}"/>`).getElementsByTagName('a')[0];
        result = getAttribute('n', domElement);
      });
      it('returns "asdf"', () => {
        assert.strictEqual(result, value);
      });
    });

    describe('given two arguments: "n" and a DOM Element n="" attribute', () => {
      const value = '';
      let result;
      before(() => {
        const domElement = parseXML(`<a n="${value}"/>`).getElementsByTagName('a')[0];
        result = getAttribute('n', domElement);
      });
      it('returns ""', () => {
        assert.strictEqual(result, value);
      });
    });

    describe('given two arguments: "n" and a DOM Element without an "n" attribute', () => {
      let result;
      before(() => {
        const domElement = parseXML('<a/>').getElementsByTagName('a')[0];
        result = getAttribute('n', domElement);
      });
      it('returns ""', () => {
        assert.strictEqual(result, '');
      });
    });

    describe('given two arguments: null and a DOM Element', () => {
      let result;
      before(() => {
        const domElement = parseXML('<a/>').getElementsByTagName('a')[0];
        result = getAttribute(null, domElement);
      });
      it('returns ""', () => {
        assert.strictEqual(result, '');
      });
    });
    describe('given two arguments: "n" and an object that does not have a getAttribute method', () => {
      let run;
      before(() => {
        run = () => getAttribute('n', {});
      });
      it('throws an error', () => {
        assert.throws(run);
      });
    });
  });

  describe('#attributeAsArray', () => {
    describe('given one argument "n"', () => {
      let fn;
      beforeEach(() => {
        fn = attributeAsArray('n');
      });
      it('returns a function that returns ["as", "df"] when passed a DOM Element with n="as df"', () => {
        assert.isFunction(fn);
        const value = 'as df';
        const expectedResult = ['as', 'df'];
        const domElement = parseXML(`<a n="${value}"/>`).getElementsByTagName('a')[0];
        const result = fn(domElement);
        assert.deepEqual(result, expectedResult);
      });
      it('returns a function that returns [\'\'] when passed a DOM Element with n=""', () => {
        assert.isFunction(fn);
        const value = '';
        const expectedResult = [''];
        const domElement = parseXML(`<a n="${value}"/>`).getElementsByTagName('a')[0];
        const result = fn(domElement);
        assert.deepEqual(result, expectedResult);
      });
      it('returns a function that returns [\'\'] when passed a DOM Element without an n attribute', () => {
        assert.isFunction(fn);
        const expectedResult = [''];
        const domElement = parseXML('<a/>').getElementsByTagName('a')[0];
        const result = fn(domElement);
        assert.deepEqual(result, expectedResult);
      });
      it('returns a function that throws an error when the first argument doesn\'t have a attributeAsArray method', () => {
        assert.isFunction(fn);
        const run = () => fn({});
        assert.throws(run);
      });
    });

    describe('given two arguments: "n" and a DOM Element n="as df" attribute', () => {
      const value = 'as df';
      const expectedResult = ['as', 'df'];
      let result;
      before(() => {
        const domElement = parseXML(`<a n="${value}"/>`).getElementsByTagName('a')[0];
        result = attributeAsArray('n', domElement);
      });
      it('returns "asdf"', () => {
        assert.deepEqual(result, expectedResult);
      });
    });

    describe('given two arguments: "n" and a DOM Element n="" attribute', () => {
      const value = '';
      const expectedResult = [''];
      let result;
      before(() => {
        const domElement = parseXML(`<a n="${value}"/>`).getElementsByTagName('a')[0];
        result = attributeAsArray('n', domElement);
      });
      it('returns [\'\']', () => {
        assert.deepEqual(result, expectedResult);
      });
    });

    describe('given two arguments: "n" and a DOM Element without an "n" attribute', () => {
      const expectedResult = [''];
      let result;
      before(() => {
        const domElement = parseXML('<a/>').getElementsByTagName('a')[0];
        result = attributeAsArray('n', domElement);
      });
      it('returns [\'\']', () => {
        assert.deepEqual(result, expectedResult);
      });
    });

    describe('given two arguments: null and a DOM Element', () => {
      const expectedResult = [''];
      let result;
      before(() => {
        const domElement = parseXML('<a/>').getElementsByTagName('a')[0];
        result = attributeAsArray(null, domElement);
      });
      it('returns [\'\']', () => {
        assert.deepEqual(result, expectedResult);
      });
    });

    describe('given two arguments: "n" and an object that does not have a attributeAsArray method', () => {
      let run;
      before(() => {
        run = () => attributeAsArray('n', {});
      });
      it('throws an error', () => {
        assert.throws(run);
      });
    });
  });
});
