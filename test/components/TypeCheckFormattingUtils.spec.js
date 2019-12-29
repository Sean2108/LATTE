import {
  checkIntUintMismatch,
  bitsModeGetType,
  isSameBaseType,
  isPrimitiveType,
  toLowerCamelCase,
  isString,
  deepClone
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
});
