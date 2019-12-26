import { NodeParser } from '../../app/components/build/parsers/NodeParser';

describe('NodeParser getAllVariables', () => {
  let nodeParser = new NodeParser();

  it('should return correct object for empty object inputs', () => {
    nodeParser.reset({}, {});
    expect(nodeParser.getAllVariables()).toEqual({});
  });

  it('should return correct object for null object inputs', () => {
    nodeParser.reset(null, null);
    expect(nodeParser.getAllVariables()).toEqual({});
  });

  it('should return correct object for non empty object inputs', () => {
    nodeParser.reset({ a: 1, b: 2, c: 3 }, { d: 4, e: 5, f: 6 });
    expect(nodeParser.getAllVariables()).toEqual({
      a: 1,
      b: 2,
      c: 3,
      d: 4,
      e: 5,
      f: 6
    });
  });
});

describe('NodeParser parseAssignmentNodeForVariables', () => {
  let nodeParser = new NodeParser();

  it('should return false when map lhs has unknown keyType', () => {
    nodeParser.reset({ rhs: 'uint' }, {});
    const result = nodeParser.parseNodeForVariables({
      type: 'assignment',
      variableSelected: 'map of key',
      assignedVal: 'rhs'
    });
    expect(result).toBe(false);
  });

  it('should return false when map rhs has unknown keyType', () => {
    nodeParser.reset(
      { map: { from: 'string', to: 'uint' }, key: 'string' },
      {}
    );
    const result = nodeParser.parseNodeForVariables({
      type: 'assignment',
      variableSelected: 'map of key',
      assignedVal: 'rhs'
    });
    expect(result).toBe(false);
  });

  it('should return true and variables should be correct when map types are known', () => {
    nodeParser.reset(
      { map: { from: 'string', to: 'uint' }, key: 'string', rhs: 'uint' },
      {}
    );
    const result = nodeParser.parseNodeForVariables({
      type: 'assignment',
      variableSelected: 'map of key',
      assignedVal: 'rhs'
    });
    expect(result).toBe(true);
    expect(nodeParser.variables).toEqual({
      map: { type: 'mapping', from: 'string', to: 'uint' }
    });
  });

  it('should cut off address when map type is address payable', () => {
    nodeParser.reset(
      {
        map: { from: 'address payable', to: 'uint' },
        key: 'address payable',
        rhs: 'uint'
      },
      {}
    );
    const result = nodeParser.parseNodeForVariables({
      type: 'assignment',
      variableSelected: 'map of key',
      assignedVal: 'rhs'
    });
    expect(result).toBe(true);
    expect(nodeParser.variables).toEqual({
      map: { type: 'mapping', from: 'address', to: 'uint' }
    });
  });

  it('should return true and variables should be correct when map types are known and map is nested', () => {
    nodeParser.reset(
      {
        a: { from: 'string', to: 'uint' },
        b: 'string',
        c: 'bool',
        rhs: 'uint'
      },
      {}
    );
    const result = nodeParser.parseNodeForVariables({
      type: 'assignment',
      variableSelected: 'a of b of c',
      assignedVal: 'rhs'
    });
    expect(result).toBe(true);
    expect(nodeParser.variables).toEqual({
      a: { type: 'mapping', from: 'string', to: 'uint', inner: 'bool' }
    });
  });

  it('should return false for structs', () => {
    nodeParser.reset(
      { lhs: 'A', rhs: 'string' },
      {},
      {},
      { A: [{ name: 'b', type: 'string' }] }
    );
    const result = nodeParser.parseNodeForVariables({
      type: 'assignment',
      variableSelected: "lhs's b",
      assignedVal: 'rhs',
      isMemory: false
    });
    expect(result).toBe(false);
  });

  it('should return true for non structs and update variables for false isMemory', () => {
    nodeParser.reset({ lhs: 'var', rhs: 'string' }, {});
    const result = nodeParser.parseNodeForVariables({
      type: 'assignment',
      variableSelected: 'lhs',
      assignedVal: 'rhs',
      isMemory: false
    });
    expect(result).toBe(true);
    expect(nodeParser.variables).toEqual({ lhs: 'string' });
    expect(nodeParser.memoryVars).toEqual({});
    expect(nodeParser.memoryVarsDeclared).toEqual({});
  });

  it('should return true for non structs and update memoryVars for true isMemory', () => {
    nodeParser.reset({ lhs: 'var', rhs: 'string' }, {});
    const result = nodeParser.parseNodeForVariables({
      type: 'assignment',
      variableSelected: 'lhs',
      assignedVal: 'rhs',
      isMemory: true
    });
    expect(result).toBe(true);
    expect(nodeParser.variables).toEqual({});
    expect(nodeParser.memoryVars).toEqual({ lhs: 'string' });
    expect(nodeParser.memoryVarsDeclared).toEqual({ lhs: false });
  });

  it('should return false for non structs already in functionParams', () => {
    nodeParser.reset({ rhs: 'string' }, { lhs: 'uint' });
    const result = nodeParser.parseNodeForVariables({
      type: 'assignment',
      variableSelected: 'lhs',
      assignedVal: 'rhs',
      isMemory: false
    });
    expect(result).toBe(false);
    expect(nodeParser.variables).toEqual({});
    expect(nodeParser.memoryVars).toEqual({});
    expect(nodeParser.memoryVarsDeclared).toEqual({});
  });
});

describe('NodeParser parseEntityNodeForVariables', () => {
  let nodeParser = new NodeParser();

  it('should update memoryVars when isMemory is on', () => {
    nodeParser.reset({}, {});
    const result = nodeParser.parseNodeForVariables({
      type: 'entity',
      assignVar: 'struct A',
      variableSelected: 'StructA',
      isMemory: true
    });
    expect(nodeParser.memoryVars).toEqual({ struct_a: 'StructA' });
    expect(nodeParser.variables).toEqual({});
  });

  it('should update variables when isMemory is off', () => {
    nodeParser.reset({}, {});
    const result = nodeParser.parseNodeForVariables({
      type: 'entity',
      assignVar: 'struct A',
      variableSelected: 'StructA',
      isMemory: false
    });
    expect(nodeParser.variables).toEqual({ struct_a: 'StructA' });
    expect(nodeParser.memoryVars).toEqual({});
  });
});

describe('NodeParser parseTransferNodeForVariables', () => {
  let nodeParser = new NodeParser();

  it('should update variables when both value and variableSelected are var', () => {
    nodeParser.reset({ lhs: 'var', rhs: 'var' }, {});
    const result = nodeParser.parseNodeForVariables({
      type: 'transfer',
      variableSelected: 'lhs',
      value: 'rhs'
    });
    expect(result).toBe(true);
    expect(nodeParser.variables).toEqual({
      lhs: 'uint',
      rhs: 'address payable'
    });
  });

  it('should not update lhs when lhs already has a type', () => {
    nodeParser.reset({ lhs: 'address', rhs: 'var' }, {});
    const result = nodeParser.parseNodeForVariables({
      type: 'transfer',
      variableSelected: 'lhs',
      value: 'rhs'
    });
    expect(result).toBe(true);
    expect(nodeParser.variables).toEqual({ rhs: 'address payable' });
  });

  it('should not update rhs when rhs already has a type', () => {
    nodeParser.reset({ lhs: 'var', rhs: 'uint' }, {});
    const result = nodeParser.parseNodeForVariables({
      type: 'transfer',
      variableSelected: 'lhs',
      value: 'rhs'
    });
    expect(result).toBe(true);
    expect(nodeParser.variables).toEqual({ lhs: 'uint' });
  });

  it('should not update lhs when bitsMode is on', () => {
    nodeParser.reset({ lhs: 'var', rhs: 'var' }, {}, {}, {}, true);
    const result = nodeParser.parseNodeForVariables({
      type: 'transfer',
      variableSelected: 'lhs',
      value: 'rhs'
    });
    expect(result).toBe(true);
    expect(nodeParser.variables).toEqual({ rhs: 'address payable' });
  });
});

describe('NodeParser parseAssignmentNode', () => {
  let nodeParser = new NodeParser();

  it('should return correct code and variables should be correct for single layer map', () => {
    nodeParser.reset(
      { map: { from: 'string', to: 'uint' }, key: 'string', rhs: 'uint' },
      {}
    );
    const result = nodeParser.parseNode({
      type: 'assignment',
      variableSelected: 'map of key',
      assignedVal: 'rhs',
      assignment: '='
    });
    expect(result).toBe('map[key] = rhs;');
    expect(nodeParser.variables).toEqual({
      map: { type: 'mapping', from: 'string', to: 'uint' }
    });
  });

  it('should cut off address when map type is address payable', () => {
    nodeParser.reset(
      {
        map: { from: 'address payable', to: 'uint' },
        key: 'address payable',
        rhs: 'uint'
      },
      {}
    );
    const result = nodeParser.parseNode({
      type: 'assignment',
      variableSelected: 'map of key',
      assignedVal: 'rhs',
      assignment: '='
    });
    expect(result).toBe('map[key] = rhs;');
    expect(nodeParser.variables).toEqual({
      map: { type: 'mapping', from: 'address', to: 'uint' }
    });
  });

  it('should return correct code and variables should be correct when map types are known and map is nested', () => {
    nodeParser.reset(
      {
        a: { from: 'string', to: 'uint' },
        b: 'string',
        c: 'bool',
        rhs: 'uint'
      },
      {}
    );
    const result = nodeParser.parseNode({
      type: 'assignment',
      variableSelected: 'a of b of c',
      assignedVal: 'rhs',
      assignment: '='
    });
    expect(result).toBe('a[b][c] = rhs;');
    expect(nodeParser.variables).toEqual({
      a: { type: 'mapping', from: 'string', to: 'uint', inner: 'bool' }
    });
  });

  it('should return correct code for non structs and update variables for false isMemory', () => {
    nodeParser.reset({ lhs: 'var', rhs: 'string' }, {});
    const result = nodeParser.parseNode({
      type: 'assignment',
      variableSelected: 'lhs',
      assignedVal: 'rhs',
      isMemory: false,
      assignment: '='
    });
    expect(result).toBe('lhs = rhs;');
    expect(nodeParser.variables).toEqual({ lhs: 'string' });
    expect(nodeParser.memoryVars).toEqual({});
  });

  it('should return correct code for non structs and update memoryVars for true isMemory', () => {
    nodeParser.reset({ lhs: 'var', rhs: 'string' }, {});
    const result = nodeParser.parseNode({
      type: 'assignment',
      variableSelected: 'lhs',
      assignedVal: 'rhs',
      isMemory: true,
      assignment: '='
    });
    expect(result).toBe('string memory lhs = rhs;');
    expect(nodeParser.variables).toEqual({});
    expect(nodeParser.memoryVars).toEqual({ lhs: 'string' });
    expect(nodeParser.memoryVarsDeclared).toEqual({ lhs: true });
  });

  it('should not update variables or memoryVars for non structs already in functionParams', () => {
    nodeParser.reset({ rhs: 'string' }, { lhs: 'string' });
    const result = nodeParser.parseNode({
      type: 'assignment',
      variableSelected: 'lhs',
      assignedVal: 'rhs',
      isMemory: false,
      assignment: '='
    });
    expect(result).toBe('lhs = rhs;');
    expect(nodeParser.variables).toEqual({});
    expect(nodeParser.memoryVars).toEqual({});
  });

  it('should return correct code for structs', () => {
    nodeParser.reset(
      { lhs: 'A', rhs: 'string' },
      {},
      {},
      { A: [{ name: 'b', type: 'string' }] }
    );
    const result = nodeParser.parseNode({
      type: 'assignment',
      variableSelected: "lhs's b",
      assignedVal: 'rhs',
      isMemory: false,
      assignment: '='
    });
    expect(result).toBe('lhs.b = rhs;');
  });
});

describe('NodeParser parseEventNode', () => {
  let nodeParser = new NodeParser();

  it('should return empty parens for empty params', () => {
    const result = nodeParser.parseNode({
      type: 'event',
      variableSelected: 'eventA',
      params: []
    });
    expect(result).toEqual('emit eventA();');
  });

  it('should return correct result for given params', () => {
    const result = nodeParser.parseNode({
      type: 'event',
      variableSelected: 'eventA',
      params: ['5', '10', '0', '-1', '"testStr"']
    });
    expect(result).toEqual('emit eventA(5, 10, 0, -1, "testStr");');
  });
});

describe('NodeParser parseEntityNode', () => {
  let nodeParser = new NodeParser();

  it('should return empty parens for empty params', () => {
    const result = nodeParser.parseNode({
      type: 'entity',
      assignVar: 'a',
      variableSelected: 'EntityA',
      params: [],
      isMemory: false
    });
    expect(result).toEqual('a = EntityA();');
  });

  it('should return correct result for given params and false isMemory', () => {
    const result = nodeParser.parseNode({
      type: 'entity',
      assignVar: 'a',
      variableSelected: 'EntityA',
      params: ['5', '10', '0', '-1', '"testStr"'],
      isMemory: false
    });
    expect(result).toEqual('a = EntityA(5, 10, 0, -1, "testStr");');
  });

  it('should return correct result for given params and true isMemory', () => {
    const result = nodeParser.parseNode({
      type: 'entity',
      assignVar: 'a',
      variableSelected: 'EntityA',
      params: ['5', '10', '0', '-1', '"testStr"'],
      isMemory: true
    });
    expect(result).toEqual(
      'EntityA memory a = EntityA(5, 10, 0, -1, "testStr");'
    );
  });
});

describe('NodeParser parseReturnNode', () => {
  let nodeParser = new NodeParser();

  it('should return correct code and update return type for int', () => {
    const result = nodeParser.parseNode({
      type: 'return',
      variableSelected: '5'
    });
    expect(result).toEqual('return 5;');
    expect(nodeParser.returnVar).toEqual('uint');
  });

  it('should return correct code and update return type for string', () => {
    const result = nodeParser.parseNode({
      type: 'return',
      variableSelected: '"result"'
    });
    expect(result).toEqual('return "result";');
    expect(nodeParser.returnVar).toEqual('string');
  });
});

describe('NodeParser parseTransferNode', () => {
  let nodeParser = new NodeParser();

  it('should return correct code for literal address', () => {
    const result = nodeParser.parseNode({
      type: 'transfer',
      variableSelected: '0x0000005',
      value: '5'
    });
    expect(result).toEqual('0x0000005.transfer(5);');
  });

  it('should return correct code for address keyword', () => {
    const result = nodeParser.parseNode({
      type: 'transfer',
      variableSelected: 'an address',
      value: '5'
    });
    expect(result).toEqual('address(uint160(0)).transfer(5);');
  });
});

describe('NodeParser parseCompareNode', () => {
  let nodeParser = new NodeParser();

  it('should return correct code when comparing 2 uints', () => {
    const result = nodeParser.parseNode({
      type: 'conditional',
      var1: '5',
      var2: '6',
      comp: '>'
    });
    expect(result).toEqual('5 > 6');
  });

  it('should return correct code when comparing uint and int', () => {
    const result = nodeParser.parseNode({
      type: 'conditional',
      var1: '5',
      var2: '-6',
      comp: '>'
    });
    expect(result).toEqual('int(5) > -6');
  });

  it('should return correct code when comparing uint and int', () => {
    const result = nodeParser.parseNode({
      type: 'conditional',
      var1: '-5',
      var2: '6',
      comp: '>'
    });
    expect(result).toEqual('-5 > int(6)');
  });

  it('should return have keccak when comparing strings for equality', () => {
    const result = nodeParser.parseNode({
      type: 'conditional',
      var1: '"strA"',
      var2: '"strB"',
      comp: '=='
    });
    expect(result).toEqual('keccak256("strA") == keccak256("strB")');
  });
});
