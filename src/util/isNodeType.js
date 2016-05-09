const ELEMENT_NODE = 1;
const TEXT_NODE = 3;
const PROCESSING_INSTRUCTION_NODE = 7;
const COMMENT_NODE = 8;
const DOCUMENT_NODE = 9;
const DOCUMENT_TYPE_NODE = 10;
const DOCUMENT_FRAGMENT_NODE = 11;

export const isNodeType =
  (nodeType) => (domNode) => domNode.nodeType === nodeType;

export const isElementNode = isNodeType(ELEMENT_NODE);
export const isTextNode = isNodeType(TEXT_NODE);
export const isProcessingNode = isNodeType(PROCESSING_INSTRUCTION_NODE);
export const isCommentNode = isNodeType(COMMENT_NODE);
export const isDocumentNode = isNodeType(DOCUMENT_NODE);
export const isDocumentTypeNode = isNodeType(DOCUMENT_TYPE_NODE);
export const isDocumentFragmentNode = isNodeType(DOCUMENT_FRAGMENT_NODE);
