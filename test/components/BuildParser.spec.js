import BuildParser from '../../app/components/build/parsers/BuildParser';
import DefaultDataNodeModel from '../../app/components/build/diagram/diagram_node_declarations/DefaultDataNode/DefaultDataNodeModel';
import NodeParser from '../../app/components/build/parsers/NodeParser';
import DiamondNodeModel from '../../app/components/build/diagram/diagram_node_declarations/DiamondNode/DiamondNodeModel';

jest.mock('../../app/components/build/parsers/NodeParser');

const INDENTATION = '    ';

function addNodeToDataNode(
  sourceNode,
  targetNodeName,
  targetNodeData = {},
  isTargetDataNode = true,
  reverseLink = false
) {
  const [targetNode, targetPort] = createTargetNode(
    isTargetDataNode,
    targetNodeName,
    targetNodeData
  );
  const sourcePort = sourceNode.addOutPort(sourceNode.name);
  (reverseLink ? addReversedLink : addLink)(sourcePort, targetPort);
  return targetNode;
}

function addBranchesToDiamondNode(
  sourceNode,
  targetNodeNameTrue,
  targetNodeNameFalse,
  targetNodeDataTrue = {},
  targetNodeDataFalse = {},
  isTargetTrueDataNode = true,
  isTargetFalseDataNode = true,
  reverseLinks = false
) {
  const targetTrueNode = addBranchToDiamondNode(
    sourceNode,
    true,
    targetNodeNameTrue,
    targetNodeDataTrue,
    isTargetTrueDataNode,
    reverseLinks
  );
  const targetFalseNode = addBranchToDiamondNode(
    sourceNode,
    false,
    targetNodeNameFalse,
    targetNodeDataFalse,
    isTargetFalseDataNode,
    reverseLinks
  );
  return [targetTrueNode, targetFalseNode];
}

function addBranchToDiamondNode(
  sourceNode,
  isTrueBranch,
  targetNodeName,
  targetNodeData,
  isTargetDataNode = true,
  reverseLinks = false
) {
  const [targetNode, targetPort] = createTargetNode(
    isTargetDataNode,
    targetNodeName,
    targetNodeData
  );
  (reverseLinks ? addReversedLink : addLink)(
    isTrueBranch ? sourceNode.outPortTrue : sourceNode.outPortFalse,
    targetPort
  );
  return targetNode;
}

function createTargetNode(isTargetDataNode, targetNodeName, targetNodeData) {
  let targetNode;
  let targetPort;
  if (isTargetDataNode) {
    targetNode = new DefaultDataNodeModel(targetNodeName, '', targetNodeData);
    targetPort = targetNode.addInPort(targetNodeName);
  } else {
    targetNode = new DiamondNodeModel(targetNodeName, targetNodeData);
    targetPort = targetNode.getPort('left');
  }
  return [targetNode, targetPort];
}

function addLink(sourcePort, targetPort) {
  const link = sourcePort.createLinkModel();
  link.setSourcePort(sourcePort);
  link.setTargetPort(targetPort);
  sourcePort.addLink(link);
}

function addReversedLink(sourcePort, targetPort) {
  const link = targetPort.createLinkModel();
  link.setSourcePort(targetPort);
  link.setTargetPort(sourcePort);
  sourcePort.addLink(link);
}

function expectFunctionCalledWithTimes(fn, expectedValArr, times, offset = 0) {
  expect(fn).toHaveBeenCalledTimes(expectedValArr.length * times + offset);
  expectedValArr.forEach(val => {
    for (let i = 0; i < times; i += 1) {
      expect(fn).toHaveBeenCalledWith(...val);
    }
  });
}

describe('BuildParser getters', () => {
  it('should work correctly', () => {
    const buildParser = new BuildParser();
    buildParser.nodeParser.returnVar = 'string';
    buildParser.nodeParser.isView = true;
    expect(buildParser.getReturnVar()).toEqual('string');
    expect(buildParser.getView()).toEqual(true);
  });
});

describe('BuildParser parse', () => {
  beforeEach(() => {
    NodeParser.mockClear();
  });

  it('should return empty code when only start node exists', () => {
    const onVariableChange = jest.fn();
    const buildParser = new BuildParser(onVariableChange);
    const startNode = new DefaultDataNodeModel('Start');
    const mockNodeParserInstance = NodeParser.mock.instances[0];
    const code = buildParser.parse(startNode);
    expect(mockNodeParserInstance.parseNodeForVariables).not.toHaveBeenCalled();
    expect(mockNodeParserInstance.parseNode).not.toHaveBeenCalled();
    expect(onVariableChange).toHaveBeenCalledTimes(1);
    expect(code).toEqual('');
  });

  it('should return correct code for diagram with 1 data node', () => {
    const onVariableChange = jest.fn();
    const buildParser = new BuildParser(onVariableChange);
    const startNode = new DefaultDataNodeModel('Start', { start: 1 });
    addNodeToDataNode(startNode, 'first', { first: 2 });
    const mockNodeParserInstance = NodeParser.mock.instances[0];
    mockNodeParserInstance.parseNode.mockReturnValueOnce('code');
    const code = buildParser.parse(startNode);
    expectFunctionCalledWithTimes(
      mockNodeParserInstance.parseNodeForVariables,
      [[{ first: 2 }]],
      2
    );
    expect(mockNodeParserInstance.parseNode).toHaveBeenCalledTimes(1);
    expect(onVariableChange).toHaveBeenCalledTimes(1);
    expect(code).toEqual('code\n');
  });

  it('should return correct code for diagram with 1 data node with a reverse link', () => {
    const onVariableChange = jest.fn();
    const buildParser = new BuildParser(onVariableChange);
    const startNode = new DefaultDataNodeModel('Start', { start: 1 });
    addNodeToDataNode(startNode, 'first', { first: 2 }, {}, true, true);
    const mockNodeParserInstance = NodeParser.mock.instances[0];
    mockNodeParserInstance.parseNode.mockReturnValueOnce('code');
    const code = buildParser.parse(startNode);
    expectFunctionCalledWithTimes(
      mockNodeParserInstance.parseNodeForVariables,
      [[{ first: 2 }]],
      2
    );
    expect(mockNodeParserInstance.parseNode).toHaveBeenCalledTimes(1);
    expect(onVariableChange).toHaveBeenCalledTimes(1);
    expect(code).toEqual('code\n');
  });
});

// parseNodeForVariables is called twice for each default node and parseNode is called once for each diamond node
describe('BuildParser findVariables', () => {
  beforeEach(() => {
    NodeParser.mockClear();
  });

  it('should not call node parser for diagram with only start node', () => {
    const buildParser = new BuildParser();
    const startNode = new DefaultDataNodeModel('Start');
    const mockNodeParserInstance = NodeParser.mock.instances[0];
    buildParser.findVariables(startNode);
    expect(mockNodeParserInstance.parseNodeForVariables).not.toHaveBeenCalled();
    expect(mockNodeParserInstance.parseNode).not.toHaveBeenCalled();
  });

  it('should call node parser twice for diagram with 1 data node', () => {
    const buildParser = new BuildParser();
    const startNode = new DefaultDataNodeModel('Start', { start: 1 });
    addNodeToDataNode(startNode, 'first', { first: 2 });
    const mockNodeParserInstance = NodeParser.mock.instances[0];
    mockNodeParserInstance.parseNodeForVariables.mockReturnValueOnce(true);
    buildParser.findVariables(startNode);
    expectFunctionCalledWithTimes(
      mockNodeParserInstance.parseNodeForVariables,
      [[{ first: 2 }]],
      1
    );
    expect(mockNodeParserInstance.parseNode).not.toHaveBeenCalled();
  });

  it('should call node parser correct times for diagram with conditional node and 4 data nodes', () => {
    const buildParser = new BuildParser();
    const startNode = new DefaultDataNodeModel('Start', { start: 1 });
    const compareNode = addNodeToDataNode(
      startNode,
      'compare',
      { c: 2 },
      false
    );
    const [targetTrueNode, targetFalseNode] = addBranchesToDiamondNode(
      compareNode,
      't1',
      'f1',
      { t1: 3 },
      { f1: 4 }
    );
    addNodeToDataNode(targetTrueNode, 't2', { t2: 5 });
    addNodeToDataNode(targetFalseNode, 'f2', { f2: 6 });
    const mockNodeParserInstance = NodeParser.mock.instances[0];
    mockNodeParserInstance.parseNodeForVariables
      .mockReturnValueOnce(true)
      .mockReturnValue(false);
    buildParser.findVariables(startNode);
    expectFunctionCalledWithTimes(
      mockNodeParserInstance.parseNodeForVariables,
      [[{ t1: 3 }], [{ f1: 4 }], [{ t2: 5 }], [{ f2: 6 }]],
      1,
      3
    );
    expect(mockNodeParserInstance.parseNode).toHaveBeenCalledTimes(1);
    expect(mockNodeParserInstance.parseNode).toHaveBeenCalledWith({ c: 2 });
  });

  it('should call node parser correct times for diagram with conditional node and 4 data nodes with reversed links', () => {
    const buildParser = new BuildParser();
    const startNode = new DefaultDataNodeModel('Start', { start: 1 });
    const compareNode = addNodeToDataNode(
      startNode,
      'compare',
      { c: 2 },
      false
    );
    const [targetTrueNode, targetFalseNode] = addBranchesToDiamondNode(
      compareNode,
      't1',
      'f1',
      { t1: 3 },
      { f1: 4 },
      true,
      true,
      true
    );
    addNodeToDataNode(targetTrueNode, 't2', { t2: 5 }, true, true);
    addNodeToDataNode(targetFalseNode, 'f2', { f2: 6 }, true, true);
    const mockNodeParserInstance = NodeParser.mock.instances[0];
    buildParser.findVariables(startNode);
    expectFunctionCalledWithTimes(
      mockNodeParserInstance.parseNodeForVariables,
      [[{ t1: 3 }], [{ f1: 4 }], [{ t2: 5 }], [{ f2: 6 }]],
      2
    );
    expect(mockNodeParserInstance.parseNode).toHaveBeenCalledTimes(1);
    expect(mockNodeParserInstance.parseNode).toHaveBeenCalledWith({ c: 2 });
  });

  it('should not break when there is a cycle', () => {
    const buildParser = new BuildParser();
    const startNode = new DefaultDataNodeModel('Start', { start: 1 });
    const compareNode = addNodeToDataNode(
      startNode,
      'compare',
      { c: 2 },
      false
    );
    const [targetTrueNode, targetFalseNode] = addBranchesToDiamondNode(
      compareNode,
      't1',
      'f1',
      { t1: 3 },
      { f1: 4 }
    );
    addNodeToDataNode(targetTrueNode, 't2', { t2: 5 });
    const f2Node = addNodeToDataNode(targetFalseNode, 'f2', { f2: 6 });
    addLink(f2Node.addOutPort('f2'), compareNode.getPort('left'));
    const mockNodeParserInstance = NodeParser.mock.instances[0];
    buildParser.findVariables(startNode);
    expectFunctionCalledWithTimes(
      mockNodeParserInstance.parseNodeForVariables,
      [[{ t1: 3 }], [{ f1: 4 }], [{ t2: 5 }], [{ f2: 6 }]],
      2
    );
    expect(mockNodeParserInstance.parseNode).toHaveBeenCalledTimes(1);
    expect(mockNodeParserInstance.parseNode).toHaveBeenCalledWith({ c: 2 });
  });
});

describe('BuildParser traverseNextNode', () => {
  beforeEach(() => {
    NodeParser.mockClear();
  });

  it('should not call node parser for diagram with only start node', () => {
    const buildParser = new BuildParser();
    const startNode = new DefaultDataNodeModel('Start');
    const mockNodeParserInstance = NodeParser.mock.instances[0];
    const code = buildParser.traverseNextNode(startNode, 1);
    expect(mockNodeParserInstance.parseNode).not.toHaveBeenCalled();
    expect(code).toEqual('');
  });

  it('should call node parser once for diagram with 1 data node', () => {
    const buildParser = new BuildParser();
    const startNode = new DefaultDataNodeModel('Start', { start: 1 });
    addNodeToDataNode(startNode, 'first', { first: 2 });
    const mockNodeParserInstance = NodeParser.mock.instances[0];
    mockNodeParserInstance.parseNode.mockReturnValueOnce('first');
    const code = buildParser.traverseNextNode(startNode, 1);
    expectFunctionCalledWithTimes(
      mockNodeParserInstance.parseNode,
      [[{ first: 2 }, INDENTATION]],
      1
    );
    expect(code).toEqual(`first\n`);
  });

  it('should output correct code for diagram with conditional node and 4 data nodes in 2 branches', () => {
    const buildParser = new BuildParser();
    const startNode = new DefaultDataNodeModel('Start', { start: 1 });
    const compareNode = addNodeToDataNode(
      startNode,
      'compare',
      { c: 2 },
      false
    );
    const [targetTrueNode, targetFalseNode] = addBranchesToDiamondNode(
      compareNode,
      't1',
      'f1',
      { t1: 3 },
      { f1: 4 }
    );
    addNodeToDataNode(targetTrueNode, 't2', { t2: 5 });
    addNodeToDataNode(targetFalseNode, 'f2', { f2: 6 });
    const mockNodeParserInstance = NodeParser.mock.instances[0];
    mockNodeParserInstance.parseNode
      .mockReturnValueOnce('c')
      .mockReturnValueOnce('_')
      .mockReturnValueOnce('_')
      .mockReturnValueOnce('_')
      .mockReturnValueOnce('_')
      .mockReturnValueOnce(`${INDENTATION.repeat(2)}f1`)
      .mockReturnValueOnce(`${INDENTATION.repeat(2)}f2`)
      .mockReturnValueOnce(`${INDENTATION.repeat(2)}t1`)
      .mockReturnValueOnce(`${INDENTATION.repeat(2)}t2`);
    const code = buildParser.traverseNextNode(startNode, 1);
    expectFunctionCalledWithTimes(
      mockNodeParserInstance.parseNode,
      [
        [{ c: 2 }, ''],
        [{ t1: 3 }, INDENTATION.repeat(2)],
        [{ f1: 4 }, INDENTATION.repeat(2)],
        [{ t2: 5 }, INDENTATION.repeat(2)],
        [{ f2: 6 }, INDENTATION.repeat(2)]
      ],
      1,
      4 // offset is 4 because generateCodeForCycle is called 2 times for each branch
    );
    expect(code).toEqual(
      `${INDENTATION}if (c) {
${INDENTATION.repeat(2)}t1
${INDENTATION.repeat(2)}t2
${INDENTATION}} else {
${INDENTATION.repeat(2)}f1
${INDENTATION.repeat(2)}f2
${INDENTATION}}
`
    );
  });

  it('generateCodeForCycle should fail for consecutive diamond nodes', () => {
    const buildParser = new BuildParser();
    const startNode = new DefaultDataNodeModel('Start', { start: 1 });
    const compareNode = addNodeToDataNode(
      startNode,
      'compare1',
      { c: 2 },
      false
    );
    const [compareNode2, compareTargetPort] = createTargetNode(
      false,
      'compare2',
      { c: 3 }
    );
    addLink(compareNode.outPortTrue, compareTargetPort);
    const mockNodeParserInstance = NodeParser.mock.instances[0];
    const result = buildParser.generateCodeForCycle(compareNode, 1, true);
    expect(result).toBe(null);
  });

  it('should output correct code for diagram with conditional node and 2 data nodes in 1 branch', () => {
    const buildParser = new BuildParser();
    const startNode = new DefaultDataNodeModel('Start', { start: 1 });
    const compareNode = addNodeToDataNode(
      startNode,
      'compare',
      { c: 2 },
      false
    );
    const targetTrueNode = addBranchToDiamondNode(compareNode, true, 't1', {
      t1: 3
    });
    addNodeToDataNode(targetTrueNode, 't2', { t2: 5 });
    const mockNodeParserInstance = NodeParser.mock.instances[0];
    mockNodeParserInstance.parseNode
      .mockReturnValueOnce('c')
      .mockReturnValueOnce('_')
      .mockReturnValueOnce('_')
      .mockReturnValueOnce(`${INDENTATION.repeat(2)}t1`)
      .mockReturnValueOnce(`${INDENTATION.repeat(2)}t2`);
    const code = buildParser.traverseNextNode(startNode, 1);
    expectFunctionCalledWithTimes(
      mockNodeParserInstance.parseNode,
      [
        [{ c: 2 }, ''],
        [{ t1: 3 }, INDENTATION.repeat(2)],
        [{ t2: 5 }, INDENTATION.repeat(2)]
      ],
      1,
      2
    );
    expect(code).toEqual(
      `${INDENTATION}if (c) {
${INDENTATION.repeat(2)}t1
${INDENTATION.repeat(2)}t2
${INDENTATION}}
`
    );
  });

  it('should use true while loop if true branch has a cycle', () => {
    const buildParser = new BuildParser();
    const startNode = new DefaultDataNodeModel('Start', { start: 1 });
    const compareNode = addNodeToDataNode(
      startNode,
      'compare',
      { c: 2 },
      false
    );
    const [targetTrueNode, targetFalseNode] = addBranchesToDiamondNode(
      compareNode,
      't1',
      'f1',
      { t1: 3 },
      { f1: 4 }
    );
    const t2Node = addNodeToDataNode(targetTrueNode, 't2', { t2: 5 });
    addNodeToDataNode(targetFalseNode, 'f2', { f2: 6 });
    addLink(t2Node.addOutPort('t2'), compareNode.getPort('left'));
    const mockNodeParserInstance = NodeParser.mock.instances[0];
    mockNodeParserInstance.parseNode
      .mockReturnValueOnce('c')
      .mockReturnValueOnce(`${INDENTATION.repeat(2)}t1`)
      .mockReturnValueOnce(`${INDENTATION.repeat(2)}t2`)
      .mockReturnValueOnce(`${INDENTATION}f1`)
      .mockReturnValueOnce(`${INDENTATION}f2`);
    const code = buildParser.traverseNextNode(startNode, 1);
    expectFunctionCalledWithTimes(
      mockNodeParserInstance.parseNode,
      [
        [{ c: 2 }, ''],
        [{ t1: 3 }, INDENTATION.repeat(2)],
        [{ f1: 4 }, INDENTATION],
        [{ t2: 5 }, INDENTATION.repeat(2)],
        [{ f2: 6 }, INDENTATION]
      ],
      1,
      0
    );
    expect(code).toEqual(
      `${INDENTATION}while (c) {
${INDENTATION.repeat(2)}t1
${INDENTATION.repeat(2)}t2
${INDENTATION}}
${INDENTATION}f1
${INDENTATION}f2
`
    );
  });

  it('should use false while loop if false branch has a cycle', () => {
    const buildParser = new BuildParser();
    const startNode = new DefaultDataNodeModel('Start', { start: 1 });
    const compareNode = addNodeToDataNode(
      startNode,
      'compare',
      { c: 2 },
      false
    );
    const [targetTrueNode, targetFalseNode] = addBranchesToDiamondNode(
      compareNode,
      't1',
      'f1',
      { t1: 3 },
      { f1: 4 }
    );
    addNodeToDataNode(targetTrueNode, 't2', { t2: 5 });
    const f2Node = addNodeToDataNode(targetFalseNode, 'f2', { f2: 6 });
    addLink(f2Node.addOutPort('f2'), compareNode.getPort('left'));
    const mockNodeParserInstance = NodeParser.mock.instances[0];
    mockNodeParserInstance.parseNode
      .mockReturnValueOnce('c')
      .mockReturnValueOnce('_')
      .mockReturnValueOnce('_')
      .mockReturnValueOnce(`${INDENTATION.repeat(2)}f1`)
      .mockReturnValueOnce(`${INDENTATION.repeat(2)}f2`)
      .mockReturnValueOnce(`${INDENTATION}t1`)
      .mockReturnValueOnce(`${INDENTATION}t2`);
    const code = buildParser.traverseNextNode(startNode, 1);
    expectFunctionCalledWithTimes(
      mockNodeParserInstance.parseNode,
      [
        [{ c: 2 }, ''],
        [{ t1: 3 }, INDENTATION],
        [{ f1: 4 }, INDENTATION.repeat(2)],
        [{ t2: 5 }, INDENTATION],
        [{ f2: 6 }, INDENTATION.repeat(2)]
      ],
      1,
      2
    );
    expect(code).toEqual(
      `${INDENTATION}while (!(c)) {
${INDENTATION.repeat(2)}f1
${INDENTATION.repeat(2)}f2
${INDENTATION}}
${INDENTATION}t1
${INDENTATION}t2
`
    );
  });

  it('should output correct code for diagram with intersection and same length branches', () => {
    const buildParser = new BuildParser();
    const startNode = new DefaultDataNodeModel('Start', { start: 1 });
    const compareNode = addNodeToDataNode(
      startNode,
      'compare',
      { c: 2 },
      false
    );
    const [t1Node, f1Node] = addBranchesToDiamondNode(
      compareNode,
      't1',
      'f1',
      { t1: 3 },
      { f1: 4 }
    );
    const i1Node = addNodeToDataNode(t1Node, 'i1', { i1: 5 });
    addLink(f1Node.addOutPort('f1'), i1Node.getInPorts()[0]);
    addNodeToDataNode(i1Node, 'i2', { i2: 6 });
    const mockNodeParserInstance = NodeParser.mock.instances[0];
    mockNodeParserInstance.parseNode
      .mockReturnValueOnce('c')
      .mockReturnValueOnce('_')
      .mockReturnValueOnce('_')
      .mockReturnValueOnce('_')
      .mockReturnValueOnce('_')
      .mockReturnValueOnce('_')
      .mockReturnValueOnce('_')
      .mockReturnValueOnce(`${INDENTATION.repeat(2)}f1`)
      .mockReturnValueOnce(`${INDENTATION.repeat(2)}t1`)
      .mockReturnValueOnce(`${INDENTATION}i1`)
      .mockReturnValueOnce(`${INDENTATION}i2`);
    const code = buildParser.traverseNextNode(startNode, 1);
    expectFunctionCalledWithTimes(
      mockNodeParserInstance.parseNode,
      [
        [{ c: 2 }, ''],
        [{ t1: 3 }, INDENTATION.repeat(2)],
        [{ f1: 4 }, INDENTATION.repeat(2)],
        [{ i1: 5 }, INDENTATION],
        [{ i2: 6 }, INDENTATION]
      ],
      1,
      6
    );
    expect(code).toEqual(
      `${INDENTATION}if (c) {
${INDENTATION.repeat(2)}t1
${INDENTATION}} else {
${INDENTATION.repeat(2)}f1
${INDENTATION}}
${INDENTATION}i1
${INDENTATION}i2
`
    );
  });

  it('should output correct code for diagram with intersection and different length branches', () => {
    const buildParser = new BuildParser();
    const startNode = new DefaultDataNodeModel('Start', { start: 1 });
    const compareNode = addNodeToDataNode(
      startNode,
      'compare',
      { c: 2 },
      false
    );
    const [t1Node, f1Node] = addBranchesToDiamondNode(
      compareNode,
      't1',
      'f1',
      { t1: 3 },
      { f1: 4 }
    );
    const t2Node = addNodeToDataNode(t1Node, 't2', { t2: 5 });
    const i1Node = addNodeToDataNode(t2Node, 'i1', { i1: 6 });
    addLink(f1Node.addOutPort('f1'), i1Node.getInPorts()[0]);
    addNodeToDataNode(i1Node, 'i2', { i2: 7 });
    const mockNodeParserInstance = NodeParser.mock.instances[0];
    mockNodeParserInstance.parseNode
      .mockReturnValueOnce('c')
      .mockReturnValueOnce('_')
      .mockReturnValueOnce('_')
      .mockReturnValueOnce('_')
      .mockReturnValueOnce('_')
      .mockReturnValueOnce('_')
      .mockReturnValueOnce('_')
      .mockReturnValueOnce('_')
      .mockReturnValueOnce(`${INDENTATION.repeat(2)}f1`)
      .mockReturnValueOnce(`${INDENTATION.repeat(2)}t1`)
      .mockReturnValueOnce(`${INDENTATION.repeat(2)}t2`)
      .mockReturnValueOnce(`${INDENTATION}i1`)
      .mockReturnValueOnce(`${INDENTATION}i2`);
    const code = buildParser.traverseNextNode(startNode, 1);
    expectFunctionCalledWithTimes(
      mockNodeParserInstance.parseNode,
      [
        [{ c: 2 }, ''],
        [{ t1: 3 }, INDENTATION.repeat(2)],
        [{ f1: 4 }, INDENTATION.repeat(2)],
        [{ t2: 5 }, INDENTATION.repeat(2)],
        [{ i1: 6 }, INDENTATION],
        [{ i2: 7 }, INDENTATION]
      ],
      1,
      7
    );
    expect(code).toEqual(
      `${INDENTATION}if (c) {
${INDENTATION.repeat(2)}t1
${INDENTATION.repeat(2)}t2
${INDENTATION}} else {
${INDENTATION.repeat(2)}f1
${INDENTATION}}
${INDENTATION}i1
${INDENTATION}i2
`
    );
  });
});
