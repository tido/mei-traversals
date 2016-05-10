# mei-traversals

Collection of single dispatch and multiple dispatch functions to traverse the MEI structure.

The type signature for all traversals are `element -> *`

Note that the API is currently considered unstable, and subject to change.

## API

[Complete list of available functions by category](api.md)

## Usage

By default, this library operates under the assumption the MEI is immutable. To change this see

Each function gets added to a pristine lodash instance (using `_.runInContext` and `_.mixin`) and that instance is then exported. This is a heavy dependency.

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

In the first example, calling `mei.staff` with the `<note/>` will return the parent `<staff>`. In the second example, Calling `mei.staff` with the `<dynam staff="1"/>` will return the `<staff>` which has a matching `n` attribute.

## Performance

No benchmarks yet.

## Example

```javascript
import mei from 'mei-traversals';
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

const staffN = mei(doc).notes().last().staff().n().value();
console.log(staffN); // => 1
```

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
