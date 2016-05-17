import { isArray } from 'lodash/fp';

const toCompactArray = (objValue, srcValue) => {
  const objIsArray = isArray(objValue);
  const srcIsArray = isArray(srcValue);

  if (objIsArray && srcIsArray) return objValue.concat(srcValue);
  if (objIsArray) return objValue;
  if (srcIsArray) return srcValue;
  return [];
};

export default toCompactArray;
