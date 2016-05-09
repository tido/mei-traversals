// Returns a function that performs different traversals
// depending on the input element.

const conditionalTraversal =
  (strategies, name) => (domElement, ...args) => { // eslint-disable-line
    const strategy = strategies.find(({ condition }) => condition(domElement));

    if (strategy && strategy.log) console.log(strategy.log); // eslint-disable-line

    if (!strategy) {
      throw new Error(`Could not find a traversal strategy (for: ${name}) that matched any
        condition for ${domElement.tagName}#${domElement.getAttribute('xml:id')}`);
    }

    return strategy.traversal(domElement, ...args);
  };

export default conditionalTraversal;
