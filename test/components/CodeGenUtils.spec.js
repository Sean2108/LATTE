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
    tabs: ['Global State', 'Initial State', 'test func'],
    tabsCode: [
      '',
      'if (test_int < 10) {\nreturn test_int;\n} else {\nuint res = 20;\nreturn res;\n}\n'
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
      ]
    ],
    tabsReturn: [null, 'uint'],
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
      ]
    ],
    constructorParams: [],
    events: {},
    entities: {},
    isView: [false, false],
    diagrams: [
      {},
      {
        id: 'c0789434-c98f-419a-8924-d0de64c4e446',
        offsetX: 0,
        offsetY: 0,
        zoom: 100,
        gridSize: 0,
        links: [
          {
            id: '1158a23f-0838-4b17-976a-b845724ce61e',
            type: 'default',
            selected: false,
            source: 'e706c5af-0ae4-48ad-8f06-356d2629afed',
            sourcePort: '340acfbb-1e38-47ff-af8b-9d91adbd0745',
            target: 'test int < 10',
            targetPort: '0e0de6e8-536d-418f-84c6-e92f373f7620',
            points: [
              {
                id: 'a6c11b2b-bdc0-4cb3-9d4d-0334705ede74',
                selected: false,
                x: 127.75,
                y: 140.5
              },
              {
                id: '095aac40-70be-4359-84b1-a7cf654517f5',
                selected: true,
                x: 188.5,
                y: 119.15625
              }
            ],
            extras: {},
            labels: [],
            width: 3,
            color: 'rgba(255,255,255,0.5)',
            curvyness: 50
          },
          {
            id: '2b31c699-4ed8-42ad-85c9-4467bcf98320',
            type: 'default',
            selected: false,
            source: 'test int < 10',
            sourcePort: '87f6211f-d26e-4fdb-84e5-a15985c0549d',
            target: 'b1593a32-6961-49ab-87ce-879ce543b0aa',
            targetPort: 'c6b86821-0418-4863-8051-4dca85d7bff4',
            points: [
              {
                id: '71860a02-8f00-4a54-bf88-6fa0d277cbbc',
                selected: false,
                x: 263.5,
                y: 197.65625
              },
              {
                id: '9552d417-becc-44c1-9a32-eea4f108cd56',
                selected: true,
                x: 250.5,
                y: 275.1666564941406
              }
            ],
            extras: {},
            labels: [],
            width: 3,
            color: 'rgba(255,255,255,0.5)',
            curvyness: 50
          },
          {
            id: '34451ae3-7e1f-454d-aa36-e30fde9a8b61',
            type: 'default',
            selected: false,
            source: 'test int < 10',
            sourcePort: 'db34e13e-fe93-4a6e-af79-145df66c0b34',
            target: 'b05ac7cf-a666-4d1d-9585-d89e8b498e03',
            targetPort: 'c3fc13b0-ec33-4f55-8cc1-4b0efe6bdb7b',
            points: [
              {
                id: '78cb2b8a-cf0e-41a3-b185-0306a12268d7',
                selected: false,
                x: 338.5,
                y: 122.65625
              },
              {
                id: '351d76e5-a16c-47cb-9122-31c7a88ffa84',
                selected: true,
                x: 410.5,
                y: 123.15625
              }
            ],
            extras: {},
            labels: [],
            width: 3,
            color: 'rgba(255,255,255,0.5)',
            curvyness: 50
          },
          {
            id: '49d7bc18-96cf-4ce8-b9f5-3d75eb046f60',
            type: 'default',
            selected: false,
            source: 'b05ac7cf-a666-4d1d-9585-d89e8b498e03',
            sourcePort: 'f1954cea-ffad-4b54-9a4f-c794d47a221f',
            target: '4b267646-f76c-4325-b0e2-00a6ff6389a5',
            targetPort: 'e209692e-44f4-4386-96fd-eb94455399b6',
            points: [
              {
                id: '3779f560-032a-4ae6-8791-8b2bcc029a13',
                selected: false,
                x: 509.1458740234375,
                y: 123.15625
              },
              {
                id: '79839c46-3f36-4c71-bb2a-c678d09addeb',
                selected: true,
                x: 448.5,
                y: 233.16665649414062
              }
            ],
            extras: {},
            labels: [],
            width: 3,
            color: 'rgba(255,255,255,0.5)',
            curvyness: 50
          }
        ],
        nodes: [
          {
            id: 'e706c5af-0ae4-48ad-8f06-356d2629afed',
            type: 'data',
            selected: false,
            x: 100,
            y: 100,
            extras: {},
            ports: [
              {
                id: '340acfbb-1e38-47ff-af8b-9d91adbd0745',
                type: 'default',
                selected: false,
                name: '79a66b8d-3318-4549-a371-b203e2b02026',
                parentNode: 'e706c5af-0ae4-48ad-8f06-356d2629afed',
                links: ['1158a23f-0838-4b17-976a-b845724ce61e'],
                maximumLinks: 1,
                in: false,
                label: ' '
              }
            ],
            name: 'Start',
            color: 'rgb(0,192,255)',
            data: {}
          },
          {
            id: 'test int < 10',
            type: 'diamond',
            selected: false,
            x: 189,
            y: 44.666656494140625,
            extras: {},
            ports: [
              {
                id: 'ca359ac2-6699-454c-b343-44608411a36a',
                type: 'diamond',
                selected: false,
                name: 'top',
                parentNode: 'test int < 10',
                links: [],
                maximumLinks: 1,
                position: 'top',
                in: false,
                label: ''
              },
              {
                id: '0e0de6e8-536d-418f-84c6-e92f373f7620',
                type: 'diamond',
                selected: false,
                name: 'left',
                parentNode: 'test int < 10',
                links: ['1158a23f-0838-4b17-976a-b845724ce61e'],
                maximumLinks: 1,
                position: 'left',
                in: false,
                label: ''
              },
              {
                id: '87f6211f-d26e-4fdb-84e5-a15985c0549d',
                type: 'diamond',
                selected: false,
                name: 'bottom',
                parentNode: 'test int < 10',
                links: ['2b31c699-4ed8-42ad-85c9-4467bcf98320'],
                maximumLinks: 1,
                position: 'bottom',
                in: true,
                label: {
                  type: 'font',
                  key: null,
                  ref: null,
                  props: {
                    color: 'white',
                    children: 'True'
                  },
                  _owner: null,
                  _store: {}
                }
              },
              {
                id: 'db34e13e-fe93-4a6e-af79-145df66c0b34',
                type: 'diamond',
                selected: false,
                name: 'right',
                parentNode: 'test int < 10',
                links: ['34451ae3-7e1f-454d-aa36-e30fde9a8b61'],
                maximumLinks: 1,
                position: 'right',
                in: true,
                label: {
                  type: 'font',
                  key: null,
                  ref: null,
                  props: {
                    color: 'white',
                    children: 'False'
                  },
                  _owner: null,
                  _store: {}
                }
              }
            ],
            name: 'test int < 10',
            data: {
              var1: 'test int',
              var2: '10',
              comp: '<',
              type: 'conditional'
            }
          },
          {
            id: 'b1593a32-6961-49ab-87ce-879ce543b0aa',
            type: 'data',
            selected: false,
            x: 241,
            y: 234.66665649414062,
            extras: {},
            ports: [
              {
                id: 'c6b86821-0418-4863-8051-4dca85d7bff4',
                type: 'default',
                selected: false,
                name: '20acdf2a-c679-495e-933b-be38c08684d1',
                parentNode: 'b1593a32-6961-49ab-87ce-879ce543b0aa',
                links: ['2b31c699-4ed8-42ad-85c9-4467bcf98320'],
                in: true,
                label: ' '
              }
            ],
            name: 'Return: test int',
            color: 'rgb(192,255,0)',
            data: {
              variableSelected: 'test int',
              type: 'return'
            }
          },
          {
            id: 'b05ac7cf-a666-4d1d-9585-d89e8b498e03',
            type: 'data',
            selected: false,
            x: 401,
            y: 82.66665649414062,
            extras: {},
            ports: [
              {
                id: 'c3fc13b0-ec33-4f55-8cc1-4b0efe6bdb7b',
                type: 'default',
                selected: false,
                name: 'ef4e442e-48cc-4371-8518-c4a9498da7a8',
                parentNode: 'b05ac7cf-a666-4d1d-9585-d89e8b498e03',
                links: ['34451ae3-7e1f-454d-aa36-e30fde9a8b61'],
                in: true,
                label: ' '
              },
              {
                id: 'f1954cea-ffad-4b54-9a4f-c794d47a221f',
                type: 'default',
                selected: false,
                name: 'e4b7fdab-bf68-477a-96f1-54d86a86ea84',
                parentNode: 'b05ac7cf-a666-4d1d-9585-d89e8b498e03',
                links: ['49d7bc18-96cf-4ce8-b9f5-3d75eb046f60'],
                maximumLinks: 1,
                in: false,
                label: ' '
              }
            ],
            name: 'Assignment: res = 20',
            color: 'rgb(192,0,0)',
            data: {
              variableSelected: 'res',
              assignment: '=',
              assignedVal: '20',
              isMemory: true,
              type: 'assignment'
            }
          },
          {
            id: '4b267646-f76c-4325-b0e2-00a6ff6389a5',
            type: 'data',
            selected: false,
            x: 439,
            y: 192.66665649414062,
            extras: {},
            ports: [
              {
                id: 'e209692e-44f4-4386-96fd-eb94455399b6',
                type: 'default',
                selected: false,
                name: '657ce4ce-115e-4f95-876f-ede2b8d170f8',
                parentNode: '4b267646-f76c-4325-b0e2-00a6ff6389a5',
                links: ['49d7bc18-96cf-4ce8-b9f5-3d75eb046f60'],
                in: true,
                label: ' '
              }
            ],
            name: 'Return: res',
            color: 'rgb(192,255,0)',
            data: {
              variableSelected: 'res',
              type: 'return'
            }
          }
        ]
      }
    ],
    gasHistory: [0, 121761, 132283, 130879]
  };
  return { codeGen, entities, variables, buildState };
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

  it('should return correct result for structs when bitsMode is on', () => {
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
    expect(codeGen.formReturnCode('bool')).toEqual('returns (bool) ');
    expect(codeGen.formReturnCode('address')).toEqual('returns (address) ');
    expect(codeGen.formReturnCode('address payable')).toEqual(
      'returns (address payable) '
    );
    expect(codeGen.formReturnCode('bytes32')).toEqual('returns (bytes32) ');
    expect(codeGen.formReturnCode('bytes16')).toEqual('returns (bytes16) ');
    expect(codeGen.formReturnCode('uint8')).toEqual('returns (uint8) ');
    expect(codeGen.formReturnCode('uint')).toEqual('returns (uint) ');
    expect(codeGen.formReturnCode('string')).toEqual('returns (string memory) ');
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
    expect(codeGen.formFunctionBody(buildState, 1, false)).toEqual(
      `function testFunc(uint test_int) public payable returns (uint) {
      require(test_int > 0, "test int must be greater than 0");
      if (test_int < 10) {
      return test_int;
      } else {
      uint res = 20;
      return res;
      }
      }
      `.replace(/  +/g, '')
      // 'function testFunc(uint test_int) public payable returns (uint) {\nrequire(test_int > 0, "test int must be greater than 0");\nif (test_int < 10) {\nreturn test_int;\n} else {\nuint res = 20;\nreturn res;\n}\n}\n'
    );
  });
});

describe('codeGenUtils class formCode function', () => {
  it('should work correctly', () => {
    const { codeGen, buildState } = setup();
    expect(codeGen.formCode(buildState, 1, false)).toEqual(
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
      }`.replace(/  +/g, '')
    );
  });
});
