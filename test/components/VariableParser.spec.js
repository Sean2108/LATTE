import { parseVariable } from '../../app/components/build/parsers/VariableParser';

describe('VariableParser parseVariable function', () => {
  it('should return a string for single quotes with whitespace', () => {
    expect(parseVariable('  "testStr"  ', {}, {})).toEqual({
      name: '"testStr"',
      type: 'string'
    });
  });

  it('should return a string for double quotes without whitespace', () => {
    expect(parseVariable("'testStr'", {}, {})).toEqual({
      name: "'testStr'",
      type: 'string'
    });
  });

  it('should return a uint for positive number', () => {
    expect(parseVariable('1', {}, {})).toEqual({ name: '1', type: 'uint' });
  });

  it('should return a uint for zero', () => {
    expect(parseVariable('0', {}, {})).toEqual({ name: '0', type: 'uint' });
  });

  it('should return an int for negative number', () => {
    expect(parseVariable('-1', {}, {})).toEqual({ name: '-1', type: 'int' });
  });

  it('should return the correct expression for uint * int', () => {
    expect(parseVariable('-1 * 1', {}, {})).toEqual({
      name: '-1 * uint(1)',
      type: 'uint'
    });
  });

  it('should return the correct expression for int * uint', () => {
    expect(parseVariable('1 + -1', {}, {})).toEqual({
      name: 'uint(1) + -1',
      type: 'uint'
    });
  });

  it('should return correct int type for map on lhs with positive number', () => {
    expect(parseVariable('test map of test str + 5', {}, {})).toEqual({
      name: 'test_map[test_str] + 5',
      type: 'uint'
    });
  });

  it('should return correct uint type for map on rhs with negative number', () => {
    expect(parseVariable('-5 * test map for test str', {}, {})).toEqual({
      name: '-5 * test_map[test_str]',
      type: 'int'
    });
  });

  it('operations with unknown vars return unknown var type', () => {
    expect(parseVariable('a * b', {}, {})).toEqual({
      name: 'a * b',
      type: 'var'
    });
  });

  it('parseStruct should work with bitsMode off', () => {
    expect(
      parseVariable(
        "a's b",
        { a: 'A' },
        { A: [{ name: 'b', type: 'string', bits: 8 }] },
        false
      )
    ).toEqual({
      name: 'a.b',
      type: 'string'
    });
  });

  it('parseStruct should work with bitsMode on', () => {
    expect(
      parseVariable(
        "a's b",
        { a: 'A' },
        { A: [{ name: 'b', type: 'string', bits: 8 }] },
        true
      )
    ).toEqual({
      name: 'a.b',
      type: 'bytes8'
    });
  });

  it('parseStruct should work with ints and bitsMode on', () => {
    expect(
      parseVariable(
        "a's b",
        { a: 'A' },
        { A: [{ name: 'b', type: 'int', bits: 8 }] },
        true
      )
    ).toEqual({
      name: 'a.b',
      type: 'int8'
    });
  });

  it('parseMap should work without innerKey', () => {
    expect(
      parseVariable(
        'a for b',
        { a: { from: 'string', to: 'int' }, b: 'string' },
        {}
      )
    ).toEqual({
      name: 'a[b]',
      mapName: 'a',
      keyType: 'string',
      type: 'int'
    });
  });

  it('parseMap should work with innerKey', () => {
    expect(
      parseVariable(
        'a of b of c',
        { a: { from: 'string', to: 'int' }, b: 'string', c: 'bool' },
        {}
      )
    ).toEqual({
      name: 'a[b][c]',
      mapName: 'a',
      keyType: 'string',
      innerKeyType: 'bool',
      type: 'int'
    });
  });

  it('parseKeyword should work for address', () => {
    expect(parseVariable('0x000001', {}, {})).toEqual({
      name: '0x000001',
      type: 'address payable'
    });
  });

  it('parseKeyword should work for msg sender', () => {
    expect(parseVariable('msg sender', {}, {})).toEqual({
      name: 'msg.sender',
      type: 'address payable'
    });
  });

  it('parseKeyword should work for msg value', () => {
    expect(parseVariable('msg value', {}, {})).toEqual({
      name: 'msg.value',
      type: 'uint'
    });
  });

  it('parseKeyword should work for current balance', () => {
    expect(parseVariable('current balance', {}, {})).toEqual({
      name: 'address(this).balance',
      type: 'uint'
    });
  });

  it('parseKeyword should work for current time', () => {
    expect(parseVariable('current time', {}, {})).toEqual({
      name: 'now',
      type: 'uint'
    });
  });

  it('parseKeyword should work for invalid address', () => {
    expect(parseVariable('invalid address', {}, {})).toEqual({
      name: 'address(uint160(0))',
      type: 'address payable'
    });
  });

  it('parseKeyword should work for true', () => {
    expect(parseVariable('yes', {}, {})).toEqual({
      name: 'true',
      type: 'bool'
    });
  });

  it('parseKeyword should work for false', () => {
    expect(parseVariable('no', {}, {})).toEqual({
      name: 'false',
      type: 'bool'
    });
  });

  it('lookupVariableName should work when variable is in variables', () => {
    expect(parseVariable('the var', { the_var: 'int' }, {})).toEqual({
      name: 'the_var',
      type: 'int'
    });
  });

  it('lookupVariableName should not work when variable is not in variables', () => {
    expect(parseVariable('the var', { not_the_var: 'int' }, {})).toEqual({
      name: 'the_var',
      type: 'var'
    });
  });
});
