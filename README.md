# mei-traversals

Collection of single dispatch and multiple dispatch functions to traverse the MEI structure.

The type signature for all traversals are `element -> *`

Note that the API is currently considered unstable, and subject to change.

## API

[Complete list of available functions by category](api.md)

## Usage

By default, this library operates under the assumption the MEI is immutable. To change this see the next section on configuration.

Each function gets added to a pristine [lodash](https://github.com/lodash/lodash) instance (using `_.runInContext` and `_.mixin`) and that instance is exported. This is a heavy dependency.

The main power of this library comes from multiple dispatch functions which allow us to navigate the MEI using common musical semantics without exposing the MEI structure. You shouldn't have to worrry about the fact that some elements are hierarchically related, while others are related by attribute.

Consider the following MEI snippets:

```xml
<staff>
  <note/>
</staff>
```

```xml
<measure>
  <staff n="1"/>
  <dynam staff="1"/>
<measure/>
```

In the first example, calling `traversals.staff` with the `<note/>` will return the parent `<staff>`. In the second example, Calling `traversals.staff` with the `<dynam staff="1"/>` will return the `<staff>` which has a matching `n` attribute.

##### Example

```javascript
import traversals from 'mei-traversals';
import { DOMParser } from 'xmldom';

const domParser = new DOMParser();

const doc = domParser.parseFromString(`
  <mei>
    <score>
      <measure>
        <staff n="1">
          <layer>
            <note />
            <note />
          </layer>
        </staff>
      </measure>
    </score>
  </mei>
`)

const notes = traversals.notes(doc);
const staffN = traversals.staffN(notes[1]);
console.log(staffN); // => 1
```


## Configuration

To configure the traversals, use the `.configure(options)` function provided on the main traversals object.

* `options`
  * `cache`
    - If `true`, the result of each function is cached on the associated input DOM element.
    - default: `true`
  * `log`
    - If `true`, each traversal is logged with the input element, output data, and duration
    - default: `false`
  * `tryCatch`
    - If `true`, each traversal is wrapped in a `try catch`
    - default: `true`

##### Example:

```javascript
import traversals from 'mei-traversals';

traversals.configure({ log: true, cache: true, tryCatch: true });
```

## Performance

No benchmarks yet.

## Installation

(Not actually published yet so this won't work...)

```
npm install --save mei-traversals
```

## Compiling from source

If you are not installing from `npm`, you can compile the source on your own. To compile, run the following command:

```
npm run prepublish
```

## Run the Tests

```
npm install
npm test
```

## Dependencies

* [lodash](https://github.com/lodash/lodash)
