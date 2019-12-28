import BuildParser from '../../app/components/build/parsers/BuildParser';
import DefaultDataNodeModel from '../../app/components/build/diagram/diagram_node_declarations/DefaultDataNode/DefaultDataNodeModel';
import NodeParser from '../../app/components/build/parsers/NodeParser';
import DiamondNodeModel from '../../app/components/build/diagram/diagram_node_declarations/DiamondNode/DiamondNodeModel';

jest.mock('../../app/components/build/parsers/NodeParser');

function addNodeToDataNode(
  sourceNode,
  targetNodeName,
  targetNodeData = {},
  isTargetDataNode = true
) {
  const [targetNode, targetPort] = createTargetNode(
    isTargetDataNode,
    targetNodeName,
    targetNodeData
  );
  const sourcePort = sourceNode.addOutPort(sourceNode.name);
  addLink(sourcePort, targetPort);
  return targetNode;
}

function addNodeToDiamondNode(
  sourceNode,
  targetNodeNameTrue,
  targetNodeNameFalse,
  targetNodeDataTrue = {},
  targetNodeDataFalse = {},
  isTargetTrueDataNode = true,
  isTargetFalseDataNode = true
) {
  const [targetTrueNode, targetTruePort] = createTargetNode(
    isTargetTrueDataNode,
    targetNodeNameTrue,
    targetNodeDataTrue
  );
  const [targetFalseNode, targetFalsePort] = createTargetNode(
    isTargetFalseDataNode,
    targetNodeNameFalse,
    targetNodeDataFalse
  );
  addLink(sourceNode.outPortTrue, targetTruePort);
  addLink(sourceNode.outPortFalse, targetFalsePort);
  return [targetTrueNode, targetFalseNode];
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
  link.setTargetPort(targetPort);
  sourcePort.addLink(link);
}

function expectFunctionCalledWithTimes(fn, expectedValArr, times, offset = 0) {
  expect(fn).toHaveBeenCalledTimes(expectedValArr.length * times + offset);
  expectedValArr.forEach(val => {
    for (let i = 0; i < times; i += 1) {
      expect(fn).toHaveBeenCalledWith(val);
    }
  });
}

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
    buildParser.findVariables(startNode);
    expectFunctionCalledWithTimes(
      mockNodeParserInstance.parseNodeForVariables,
      [{ first: 2 }],
      2
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
    const [targetTrueNode, targetFalseNode] = addNodeToDiamondNode(
      compareNode,
      't1',
      'f1',
      { t1: 3 },
      { f1: 4 }
    );
    addNodeToDataNode(targetTrueNode, 't2', { t2: 5 });
    addNodeToDataNode(targetFalseNode, 'f2', { f2: 6 });
    const mockNodeParserInstance = NodeParser.mock.instances[0];
    buildParser.findVariables(startNode);
    expectFunctionCalledWithTimes(
      mockNodeParserInstance.parseNodeForVariables,
      [{ t1: 3 }, { f1: 4 }, { t2: 5 }, { f2: 6 }],
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
    const [targetTrueNode, targetFalseNode] = addNodeToDiamondNode(
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
      [{ t1: 3 }, { f1: 4 }, { t2: 5 }, { f2: 6 }],
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
    const code = buildParser.traverseNextNode(startNode);
    expect(mockNodeParserInstance.parseNode).not.toHaveBeenCalled();
    expect(code).toEqual('');
  });

  it('should call node parser once for diagram with 1 data node', () => {
    const buildParser = new BuildParser();
    const startNode = new DefaultDataNodeModel('Start', { start: 1 });
    addNodeToDataNode(startNode, 'first', { first: 2 });
    const mockNodeParserInstance = NodeParser.mock.instances[0];
    mockNodeParserInstance.parseNode.mockReturnValueOnce('first');
    const code = buildParser.traverseNextNode(startNode);
    expectFunctionCalledWithTimes(
      mockNodeParserInstance.parseNode,
      [{ first: 2 }],
      1
    );
    expect(code).toEqual('first\n');
  });

  it('should output correct code for diagram with conditional node and 4 data nodes', () => {
    const buildParser = new BuildParser();
    const startNode = new DefaultDataNodeModel('Start', { start: 1 });
    const compareNode = addNodeToDataNode(
      startNode,
      'compare',
      { c: 2 },
      false
    );
    const [targetTrueNode, targetFalseNode] = addNodeToDiamondNode(
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
      .mockReturnValueOnce('f1')
      .mockReturnValueOnce('f2')
      .mockReturnValueOnce('t1')
      .mockReturnValueOnce('t2');
    const code = buildParser.traverseNextNode(startNode);
    expectFunctionCalledWithTimes(
      mockNodeParserInstance.parseNode,
      [{ c: 2 }, { t1: 3 }, { f1: 4 }, { t2: 5 }, { f2: 6 }],
      1,
      4 // offset is 4 because generateCodeForCycle is called 2 times for each branch
    );
    expect(code).toEqual('if (c) {\nt1\nt2\n} else {\nf1\nf2\n}\n');
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
    const [targetTrueNode, targetFalseNode] = addNodeToDiamondNode(
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
      .mockReturnValueOnce('t1')
      .mockReturnValueOnce('t2')
      .mockReturnValueOnce('f1')
      .mockReturnValueOnce('f2');
    const code = buildParser.traverseNextNode(startNode);
    expect(code).toEqual('while (c) {\nt1\nt2\n}\nf1\nf2\n');
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
    const [targetTrueNode, targetFalseNode] = addNodeToDiamondNode(
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
      .mockReturnValueOnce('f1')
      .mockReturnValueOnce('f2')
      .mockReturnValueOnce('t1')
      .mockReturnValueOnce('t2');
    const code = buildParser.traverseNextNode(startNode);
    expect(code).toEqual('while (!(c)) {\nf1\nf2\n}\nt1\nt2\n');
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
    const [t1Node, f1Node] = addNodeToDiamondNode(
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
      .mockReturnValueOnce('f1')
      .mockReturnValueOnce('t1')
      .mockReturnValueOnce('i1')
      .mockReturnValueOnce('i2');
    const code = buildParser.traverseNextNode(startNode);
    expect(code).toEqual('if (c) {\nt1\n} else {\nf1\n}\ni1\ni2\n');
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
    const [t1Node, f1Node] = addNodeToDiamondNode(
      compareNode,
      't1',
      'f1',
      { t1: 3 },
      { f1: 4 }
    );
    const t2Node = addNodeToDataNode(t1Node, 't2', { t2: 5 });
    const i1Node = addNodeToDataNode(t2Node, 'i1', { i1: 5 });
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
      .mockReturnValueOnce('_')
      .mockReturnValueOnce('f1')
      .mockReturnValueOnce('t1')
      .mockReturnValueOnce('t2')
      .mockReturnValueOnce('i1')
      .mockReturnValueOnce('i2');
    const code = buildParser.traverseNextNode(startNode);
    expect(code).toEqual('if (c) {\nt1\nt2\n} else {\nf1\n}\ni1\ni2\n');
  });
});
