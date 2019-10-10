import { CodeGenUtils } from '../../app/components/build/CodeGenUtils';
import { string } from 'postcss-selector-parser';

function setup() {
  const codeGen = new CodeGenUtils();
  const entities = {
    itemA: [
      {
        type: 'uint',
        bits: 8
      },
      {
        name: 'paramA',
        type: 'uint',
        bits: 8
      },
      {
        name: 'paramB',
        type: 'string',
        bits: ''
      }
    ],
    itemB: [
      {
        name: 'paramC',
        type: 'string',
        bits: 16
      },
      {
        name: 'paramD',
        type: 'address'
      },
      {
        name: 'paramE',
        type: 'bool'
      }
    ]
  };

  const variables = {
    varA: 'string',
    varB: 'uint',
    varC: {
      from: 'uint',
      to: 'bool',
      type: 'mapping'
    },
    varD: {
      from: 'uint',
      inner: 'address payable',
      to: 'string',
      type: 'mapping'
    },
    varE: {
      from: 'address payable',
      inner: 'uint',
      to: 'bool',
      type: 'mapping'
    }
  };
  return { codeGen, entities, variables };
}

describe('codeGenUtils class toLowerCamelCase function', () => {
  it('should work correctly', () => {
    const { codeGen } = setup();
    expect(codeGen.toLowerCamelCase('This is a test')).toEqual('thisIsATest');
  });

  it('should not change result if input is already in lower camel case', () => {
    const { codeGen } = setup();
    expect(codeGen.toLowerCamelCase('thisIsATest')).toEqual('thisIsATest');
  });
});

describe('codeGenUtils class formStructsEvents function', () => {
  it('should return correct result for events when bitsMode is off', () => {
    const { codeGen, entities } = setup();
    const expected =
      'event itemA (uint paramA, string paramB);\nevent itemB (string paramC, address paramD, bool paramE);\n';
    expect(codeGen.formStructsEvents(entities, false, true)).toEqual(expected);
  });

  it('should return correct result for events when bitsMode is on', () => {
    const { codeGen, entities } = setup();
    const expected =
      'event itemA (uint8 paramA, string paramB);\nevent itemB (bytes16 paramC, address paramD, bool paramE);\n';
    expect(codeGen.formStructsEvents(entities, true, true)).toEqual(expected);
  });

  it('should return correct result for structs when bitsMode is off', () => {
    const { codeGen, entities } = setup();
    const expected =
      'struct itemA {\nuint paramA;\nstring paramB;\n}\nstruct itemB {\nstring paramC;\naddress paramD;\nbool paramE;\n}\n';
    expect(codeGen.formStructsEvents(entities, false, false)).toEqual(expected);
  });

  it('should return correct result for structs when bitsMode is off', () => {
    const { codeGen, entities } = setup();
    const expected =
      'struct itemA {\nuint8 paramA;\nstring paramB;\n}\nstruct itemB {\nbytes16 paramC;\naddress paramD;\nbool paramE;\n}\n';
    expect(codeGen.formStructsEvents(entities, true, false)).toEqual(expected);
  });
});

describe('codeGenUtils class formVars function', () => {
  it('should work correctly', () => {
    const { codeGen, variables } = setup();
    const expected =
      'string private varA;\nuint private varB;\nmapping(uint => bool) varC;\nmapping(uint => mapping(address => string)) varD;\nmapping(address payable => mapping(uint => bool)) varE;\n';
    expect(codeGen.formVars(variables)).toEqual(expected);
  });
});

describe('codeGenUtils class isString function', () => {
  it('should work correctly', () => {
    const { codeGen } = setup();
    expect(codeGen.isString('   "test    ', {})).toEqual(false);
    expect(codeGen.isString('   test"    ', {})).toEqual(false);
    expect(codeGen.isString('   test    ', {})).toEqual(false);
    expect(codeGen.isString('   "test"    ', {})).toEqual(true);
    expect(codeGen.isString("   'test'    ", {})).toEqual(true);
    expect(codeGen.isString('   test    ', { test: 'uint' })).toEqual(false);
    expect(codeGen.isString('   test    ', { test: 'string' })).toEqual(true);
  });
});

describe('codeGenUtils class formReturnCode function', () => {
  it('should work correctly', () => {
    const { codeGen } = setup();
    expect(codeGen.formReturnCode('')).toEqual('');
    expect(codeGen.formReturnCode('bool')).toEqual('returns (bool)');
    expect(codeGen.formReturnCode('address')).toEqual('returns (address)');
    expect(codeGen.formReturnCode('address payable')).toEqual(
      'returns (address payable)'
    );
    expect(codeGen.formReturnCode('bytes32')).toEqual('returns (bytes32)');
    expect(codeGen.formReturnCode('bytes16')).toEqual('returns (bytes16)');
    expect(codeGen.formReturnCode('uint8')).toEqual('returns (uint8)');
    expect(codeGen.formReturnCode('uint')).toEqual('returns (uint)');
    expect(codeGen.formReturnCode('string')).toEqual('returns (string memory)');
  });
});

describe('codeGenUtils class formRequires function', () => {
  it('should work correctly', () => {
    const { codeGen } = setup();
    const input = [
      { var1: 'nocomp', var2: 'shouldfail' },
      {
        var1: 'x',
        var2: 'y',
        comp: '==',
        requireMessage: 'this should use keccak'
      },
      {
        var1: 'a',
        var2: 'b',
        comp: '>',
        requireMessage: 'this should not use keccak'
      }
    ];
    const vars = { x: 'string', y: 'string' };
    expect(codeGen.formRequires(input, vars)).toEqual(
      'require(keccak256(x) == keccak256(y), "this should use keccak");\nrequire(a > b, "this should not use keccak");\n'
    );
  });
});

describe('codeGenUtils class formParams function', () => {
  it('should work correctly with bitsMode on', () => {
    const { codeGen } = setup();
    const input = [
      { type: 'string' },
      { name: 'bitsstr', type: 'string', bits: '8' },
      { name: 'nobitsstr', type: 'string' },
      { name: 'bitsint', type: 'uint', bits: '8' },
      { name: 'nobitsint', type: 'uint' }
    ];
    expect(codeGen.formParams(input, true)).toEqual('bytes8 bitsstr, string memory nobitsstr, uint8 bitsint, uint nobitsint');
  });

  it('should work correctly with bitsMode off', () => {
    const { codeGen } = setup();
    const input = [
      { type: 'string' },
      { name: 'bitsstr', type: 'string', bits: '8' },
      { name: 'nobitsstr', type: 'string' },
      { name: 'bitsint', type: 'uint', bits: '8' },
      { name: 'nobitsint', type: 'uint' }
    ];
    expect(codeGen.formParams(input, false)).toEqual('string memory bitsstr, string memory nobitsstr, uint bitsint, uint nobitsint');
  });
});
