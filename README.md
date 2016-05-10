# mei-traversals

Collection of single dispatch and multiple dispatch functions to traverse the MEI structure.

The type signature for all traversals are element -> Any`

#### NOTE: This is an unstable moving target.

## Usage

Note that assumption is that the MEI is immutable.

## Performance

No benchmarks at this time. All traversals are cached.
All functions are added to the main `_` lodash object (using `_.mixin`) and that object is exported. This is a heavy dependency.

The main power of this library comes from multiple dispatch functions which allow us to navigate the MEI using common musical semantics without exposing the MEI structure. You shouldn't have to worrry about the fact that some elements are heirarchicy related, while others are related by attribute.

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

In the first example, calling `mei.staff()` with the `<note/>` will return the parent `<staff>`. In the second example, Calling `mei.staff()` with the `<dynam staff="1"/>` will return the `<staff>` which has a matching `n` attribute.

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
          </layer>
        </staff>
      </measure>
    </score>
  </mei>
`)

const staffN = mei(doc).notes().first().staff().n().value();
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
