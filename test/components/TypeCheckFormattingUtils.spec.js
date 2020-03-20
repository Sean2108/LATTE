import {
  checkIntUintMismatch,
  bitsModeGetType,
  isSameBaseType,
  isPrimitiveType,
  toLowerCamelCase,
  isString,
  deepClone,
  objectEquals,
  flattenParamsToObject,
  getDuplicateIndices
} from '../../app/components/build/build_utils/TypeCheckFormattingUtils';

describe('TypeCheckFormattingUtils utility functions', () => {
  it('toLowerCamelCase should work correctly', () => {
    expect(toLowerCamelCase('This is a test')).toEqual('thisIsATest');
  });

  it('toLowerCamelCase should not change result if input is already in lower camel case', () => {
    expect(toLowerCamelCase('thisIsATest')).toEqual('thisIsATest');
  });

  it('isString should work correctly', () => {
    expect(isString('   "test    ', {})).toEqual(false);
    expect(isString('   test"    ', {})).toEqual(false);
    expect(isString('   test    ', {})).toEqual(false);
    expect(isString('   "test"    ', {})).toEqual(true);
    expect(isString("   'test'    ", {})).toEqual(true);
    expect(isString('   test    ', { test: 'uint' })).toEqual(false);
    expect(isString('   test    ', { test: 'string' })).toEqual(true);
  });

  it('checkIntUintMismatch should work correctly', () => {
    expect(
      checkIntUintMismatch(
        { type: 'int' },
        { type: 'uint' },
        { res: 'left' },
        { res: 'right' }
      )
    ).toEqual({ res: 'left' });
    expect(
      checkIntUintMismatch(
        { type: 'uint' },
        { type: 'int' },
        { res: 'left' },
        { res: 'right' }
      )
    ).toEqual({ res: 'right' });
    expect(
      checkIntUintMismatch(
        { type: 'int' },
        { type: 'int' },
        { res: 'left' },
        { res: 'right' }
      )
    ).toEqual({ res: 'left' });
    expect(
      checkIntUintMismatch(
        { type: 'uint' },
        { type: 'uint' },
        { res: 'left' },
        { res: 'right' }
      )
    ).toEqual({ res: 'right' });
    expect(
      checkIntUintMismatch(
        { type: 'string' },
        { type: 'int' },
        { res: 'left' },
        { res: 'right' }
      )
    ).toEqual(null);
  });

  it('bitsModeGetType should work correctly', () => {
    expect(bitsModeGetType({ type: 'string', bits: '' })).toEqual('string');
    expect(bitsModeGetType({ type: 'string', bits: '32' })).toEqual('bytes32');
    expect(bitsModeGetType({ type: 'uint', bits: '' })).toEqual('uint');
    expect(bitsModeGetType({ type: 'uint', bits: '8' })).toEqual('uint8');
    expect(bitsModeGetType({ type: 'bool', bits: '' })).toEqual('bool');
  });

  it('isSameBaseType should work correctly', () => {
    expect(isSameBaseType('uint8', 'uint8', true)).toEqual(true);
    expect(isSameBaseType('uint8', 'uint8', false)).toEqual(true);
    expect(isSameBaseType('uint8', 'uint32', false)).toEqual(false);
    expect(isSameBaseType('uint8', 'uint32', true)).toEqual(true);
    expect(isSameBaseType('bytes8', 'uint32', true)).toEqual(false);
    expect(isSameBaseType('uint', 'uint32', true)).toEqual(true);
    expect(isSameBaseType('bytes8', 'bytes32', true)).toEqual(true);
    expect(isSameBaseType('string', 'bytes32', true)).toEqual(true);
  });

  it('isPrimitiveType should work correctly', () => {
    expect(isPrimitiveType('uint8')).toEqual(true);
    expect(isPrimitiveType('bool')).toEqual(true);
    expect(isPrimitiveType('bytes8')).toEqual(true);
    expect(isPrimitiveType('address')).toEqual(true);
    expect(isPrimitiveType('address payable')).toEqual(true);
    expect(isPrimitiveType('string')).toEqual(false);
    expect(isPrimitiveType('Voter')).toEqual(false);
  });

  it('deepClone should work correctly and prevent mutations', () => {
    const input = { x: { y: { z: ['a'] } } };
    const output = deepClone(input);
    expect(output).toEqual(input);
    output.x.y.z[0] = 'b';
    expect(input).toEqual({ x: { y: { z: ['a'] } } });
    expect(output).toEqual({ x: { y: { z: ['b'] } } });
    const shallowCopy = { ...input };
    shallowCopy.x.y.z[0] = 'c';
    expect(input).toEqual({ x: { y: { z: ['c'] } } });
    expect(shallowCopy).toEqual({ x: { y: { z: ['c'] } } });
    expect(output).toEqual({ x: { y: { z: ['b'] } } });
  });

  it('objectEquals should work correctly', () => {
    expect(
      objectEquals({ a: { b: 2 }, c: { d: 3 } }, { a: { b: 2 }, c: { d: 3 } })
    ).toEqual(true);
    expect(
      objectEquals({ a: { b: 2 }, c: { d: 3 } }, { a: { b: 2 }, c: { d: 4 } })
    ).toEqual(false);
    expect(
      objectEquals(
        { a: { b: 2 }, c: { d: 3 }, e: { f: 4 } },
        { a: { b: 2 }, c: { d: 4 } }
      )
    ).toEqual(false);
    expect(
      objectEquals(
        { a: { b: 2 }, c: { d: 3, e: { f: 4 } } },
        { a: { b: 2 }, c: { d: 4 } }
      )
    ).toEqual(false);
    expect(objectEquals({}, {})).toEqual(true);
  });
});

describe('flattenParamsToObject function', () => {
  const input = [
    { name: '', type: 'uint' },
    { name: 'some_uint', type: 'uint' },
    { name: 'some_uint_bits', type: 'uint', bits: '8' },
    { name: 'some_str', type: 'string' },
    { name: 'some_str_bits', type: 'string', bits: '16' },
    { name: 'some_addr', type: 'address' },
    { name: 'some_bool', type: 'bool' }
  ];

  it('should work with bitsMode on', () => {
    const expected = {
      some_uint: 'uint',
      some_uint_bits: 'uint8',
      some_str: 'string',
      some_str_bits: 'bytes16',
      some_addr: 'address',
      some_bool: 'bool'
    };
    expect(flattenParamsToObject(input, true)).toEqual(expected);
  });

  it('should work with bitsMode off', () => {
    const expected = {
      some_uint: 'uint',
      some_uint_bits: 'uint',
      some_str: 'string',
      some_str_bits: 'string',
      some_addr: 'address',
      some_bool: 'bool'
    };
    expect(flattenParamsToObject(input, false)).toEqual(expected);
  });
});

describe('getDuplicateIndices function', () => {
  it('should return empty array when there are no duplicates', () => {
    expect(getDuplicateIndices([])).toEqual([]);
    expect(getDuplicateIndices(['a'])).toEqual([]);
    expect(getDuplicateIndices(['a', 'b', 'c'])).toEqual([]);
  });

  it('should return array with indices of last repeated item when there are duplicates', () => {
    expect(getDuplicateIndices(['a', 'a'])).toEqual([1]);
    expect(getDuplicateIndices(['a', 'a', 'a'])).toEqual([2]);
    expect(getDuplicateIndices(['a', 'a', 'a', 'b'])).toEqual([2]);
    expect(getDuplicateIndices(['a', 'a', 'b', 'a'])).toEqual([3]);
    expect(getDuplicateIndices(['a', 'a', 'b', 'a', 'b'])).toEqual([3, 4]);
    expect(getDuplicateIndices(['a', 'b', 'c', 'a', 'b', 'c', 'd'])).toEqual([
      3,
      4,
      5
    ]);
  });
});
