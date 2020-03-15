import CodeGenUtils from '../../app/components/build/build_utils/CodeGenUtils';

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
  const buildState = {
    tabs: ['Global State', 'Initial State', 'test func', 'test func 2'],
    tabsCode: [
      '',
      '    if (test_int < 10) {\n        return test_int;\n    } else {\n        uint res = 20;\n        return res;\n    }\n',
      '    if (test_int < 10) {\n        return test_int;\n    } else {\n        return res;\n    }\n'
    ],
    variables: {},
    tabsParams: [
      [
        {
          name: '',
          displayName: '',
          type: 'uint',
          bits: ''
        }
      ],
      [
        {
          name: 'test_int',
          displayName: 'test int',
          type: 'uint',
          bits: ''
        }
      ],
      [
        {
          name: 'test_int',
          displayName: 'test int',
          type: 'uint',
          bits: ''
        }
      ]
    ],
    tabsReturn: [null, 'uint', 'uint'],
    tabsRequire: [
      [
        {
          var1: '',
          displayVar1: '',
          comp: '==',
          var2: '',
          displayVar2: '',
          requireMessage: ''
        }
      ],
      [
        {
          var1: 'test_int',
          displayVar1: 'test int',
          comp: '>',
          var2: '0',
          displayVar2: '0',
          requireMessage: 'test int must be greater than 0'
        }
      ],
      [
        {
          var1: 'test_int',
          displayVar1: 'test int',
          comp: '>',
          var2: '0',
          displayVar2: '0',
          requireMessage: 'test int must be greater than 0'
        }
      ]
    ],
    constructorParams: [],
    events: {},
    entities: {},
    isView: [false, false, true],
    diagrams: [],
    gasHistory: [0, 121761, 132283, 130879]
  };
  return { codeGen, entities, variables, buildState };
}

describe('codeGenUtils class formStructsEvents function', () => {
  it('should return correct result for events when bitsMode is off', () => {
    const { codeGen, entities } = setup();
    const expected =
      'event itemA (uint paramA, string paramB);\nevent itemB (string paramC, address paramD, bool paramE);\n';
    expect(codeGen.formStructsEvents(entities, {
      bitsMode: false,
      indentation: '    '
    }, true)).toEqual(expected);
  });

  it('should return correct result for events when bitsMode is on', () => {
    const { codeGen, entities } = setup();
    const expected =
      'event itemA (uint8 paramA, string paramB);\nevent itemB (bytes16 paramC, address paramD, bool paramE);\n';
    expect(codeGen.formStructsEvents(entities, {
      bitsMode: true,
      indentation: '    '
    }, true)).toEqual(expected);
  });

  it('should return correct result for structs when bitsMode is off', () => {
    const { codeGen, entities } = setup();
    const expected =
      'struct itemA {\n    uint paramA;\n    string paramB;\n}\nstruct itemB {\n    string paramC;\n    address paramD;\n    bool paramE;\n}\n';
    expect(codeGen.formStructsEvents(entities, {
      bitsMode: false,
      indentation: '    '
    }, false)).toEqual(expected);
  });

  it('should return correct result for structs when bitsMode is on', () => {
    const { codeGen, entities } = setup();
    const expected =
      'struct itemA {\n    uint8 paramA;\n    string paramB;\n}\nstruct itemB {\n    bytes16 paramC;\n    address paramD;\n    bool paramE;\n}\n';
    expect(codeGen.formStructsEvents(entities, {
      bitsMode: true,
      indentation: '    '
    }, false)).toEqual(expected);
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

describe('codeGenUtils class formReturnCode function', () => {
  it('should work correctly', () => {
    const { codeGen } = setup();
    expect(codeGen.formReturnCode('')).toEqual('');
    expect(codeGen.formReturnCode('bool')).toEqual('returns (bool) ');
    expect(codeGen.formReturnCode('address')).toEqual('returns (address) ');
    expect(codeGen.formReturnCode('address payable')).toEqual(
      'returns (address payable) '
    );
    expect(codeGen.formReturnCode('bytes32')).toEqual('returns (bytes32) ');
    expect(codeGen.formReturnCode('bytes16')).toEqual('returns (bytes16) ');
    expect(codeGen.formReturnCode('uint8')).toEqual('returns (uint8) ');
    expect(codeGen.formReturnCode('uint')).toEqual('returns (uint) ');
    expect(codeGen.formReturnCode('string')).toEqual(
      'returns (string memory) '
    );
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
    expect(codeGen.formRequires(input, vars, '    ')).toEqual(
      `    require(keccak256(x) == keccak256(y), "this should use keccak");\n    require(a > b, "this should not use keccak");\n`
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
    expect(codeGen.formParams(input, true)).toEqual(
      'bytes8 bitsstr, string memory nobitsstr, uint8 bitsint, uint nobitsint'
    );
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
    expect(codeGen.formParams(input, false)).toEqual(
      'string memory bitsstr, string memory nobitsstr, uint bitsint, uint nobitsint'
    );
  });
});

describe('codeGenUtils class formFunctionBody function', () => {
  it('should work correctly', () => {
    const { codeGen, buildState } = setup();
    expect(
      codeGen.formFunctionBody(buildState, 1, {
        bitsMode: false,
        indentation: '    '
      })
    ).toEqual(
      `function testFunc(uint test_int) public payable returns (uint) {
    require(test_int > 0, "test int must be greater than 0");
    if (test_int < 10) {
        return test_int;
    } else {
        uint res = 20;
        return res;
    }
}
`
    );
  });

  it('should work correctly for view functions', () => {
    const { codeGen, buildState } = setup();
    expect(
      codeGen.formFunctionBody(buildState, 2, {
        bitsMode: false,
        indentation: '    '
      })
    ).toEqual(
      `function testFunc2(uint test_int) public view returns (uint) {
    require(test_int > 0, "test int must be greater than 0");
    if (test_int < 10) {
        return test_int;
    } else {
        return res;
    }
}
`
    );
  });
});

describe('codeGenUtils class formCode function', () => {
  it('should work correctly', () => {
    const { codeGen, buildState } = setup();
    expect(
      codeGen.formCode(buildState, { bitsMode: false, indentation: '    ' })
    ).toEqual(
      `pragma solidity ^0.5.4;
contract Code {
constructor() public payable {
}
function testFunc(uint test_int) public payable returns (uint) {
    require(test_int > 0, "test int must be greater than 0");
    if (test_int < 10) {
        return test_int;
    } else {
        uint res = 20;
        return res;
    }
}
function testFunc2(uint test_int) public view returns (uint) {
    require(test_int > 0, "test int must be greater than 0");
    if (test_int < 10) {
        return test_int;
    } else {
        return res;
    }
}
}`
    );
  });
});
