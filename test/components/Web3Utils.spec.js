import { Web3Utils } from '../../app/components/build/Web3Utils';
import { string } from 'postcss-selector-parser';

function setup() {
  const web3 = new Web3Utils(null);
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
  return { web3, entities, variables };
}

describe('Web3Utils class toLowerCamelCase function', () => {
  it('should work correctly', () => {
    const { web3 } = setup();
    expect(web3.toLowerCamelCase('This is a test')).toEqual('thisIsATest');
  });

  it('should not change result if input is already in lower camel case', () => {
    const { web3 } = setup();
    expect(web3.toLowerCamelCase('thisIsATest')).toEqual('thisIsATest');
  });
});

describe('Web3Utils class formStructsEvents function', () => {
  it('should return correct result for events when bitsMode is off', () => {
    const { web3, entities } = setup();
    const expected =
      'event itemA (uint paramA, string paramB);\nevent itemB (string paramC, address paramD, bool paramE);\n';
    expect(web3.formStructsEvents(entities, false, true)).toEqual(expected);
  });

  it('should return correct result for events when bitsMode is on', () => {
    const { web3, entities } = setup();
    const expected =
      'event itemA (uint8 paramA, string paramB);\nevent itemB (bytes16 paramC, address paramD, bool paramE);\n';
    expect(web3.formStructsEvents(entities, true, true)).toEqual(expected);
  });

  it('should return correct result for structs when bitsMode is off', () => {
    const { web3, entities } = setup();
    const expected =
      'struct itemA {\nuint paramA;\nstring paramB;\n}\nstruct itemB {\nstring paramC;\naddress paramD;\nbool paramE;\n}\n';
    expect(web3.formStructsEvents(entities, false, false)).toEqual(expected);
  });

  it('should return correct result for structs when bitsMode is off', () => {
    const { web3, entities } = setup();
    const expected =
      'struct itemA {\nuint8 paramA;\nstring paramB;\n}\nstruct itemB {\nbytes16 paramC;\naddress paramD;\nbool paramE;\n}\n';
    expect(web3.formStructsEvents(entities, true, false)).toEqual(expected);
  });
});

describe('Web3Utils class formVars function', () => {
  it('should work correctly', () => {
    const { web3, variables } = setup();
    const expected = 'string private varA;\nuint private varB;\nmapping(uint => bool) varC;\nmapping(uint => mapping(address => string)) varD;\nmapping(address payable => mapping(uint => bool)) varE;\n'
    expect(web3.formVars(variables)).toEqual(expected);
  });
});

describe('Web3Utils class isString function', () => {
    it('should work correctly', () => {
      const { web3 } = setup();
      expect(web3.isString('   "test    ', {})).toEqual(false);
      expect(web3.isString('   test"    ', {})).toEqual(false);
      expect(web3.isString('   test    ', {})).toEqual(false);
      expect(web3.isString('   "test"    ', {})).toEqual(true);
      expect(web3.isString('   \'test\'    ', {})).toEqual(true);
      expect(web3.isString('   test    ', {test: 'uint'})).toEqual(false);
      expect(web3.isString('   test    ', {test: 'string'})).toEqual(true);
    });
  });