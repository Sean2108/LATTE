import DiamondNodeModel from '../diagram/diagram_node_declarations/DiamondNode/DiamondNodeModel';
import NodeParser from './NodeParser';

export default class BuildParser {
  constructor(onVariablesChange, updateBuildError = () => {}) {
    this.nodeParser = new NodeParser(updateBuildError);
    this.reset({}, {});
    this.onVariablesChange = onVariablesChange;
  }

  reset(
    varList,
    functionParams,
    eventList = null,
    structList = null,
    bitsMode = false
  ) {
    this.nodeParser.reset(
      varList,
      functionParams,
      eventList,
      structList,
      bitsMode
    );
    if (this.nodeParser.updateBuildError) {
      this.nodeParser.updateBuildError('');
    }
  }

  getReturnVar() {
    return this.nodeParser.returnVar;
  }

  getView() {
    return this.nodeParser.isView;
  }

  parse(start) {
    this.findVariables(start);
    const code = this.traverseNextNode(start);
    this.onVariablesChange({
      ...this.nodeParser.variables,
      ...this.nodeParser.varList
    });
    return code;
  }

  findVariables(start) {
    const unparsedStatements = new Set();
    this.traverseForVariables(start, unparsedStatements, new Set());
    let hasChanged = false;
    do {
      for (const statement of unparsedStatements) {
        if (this.nodeParser.parseNodeForVariables(statement)) {
          hasChanged = true;
          unparsedStatements.delete(statement);
        }
      }
    } while (unparsedStatements.size > 0 && hasChanged);
  }

  traverseForVariables(node, unparsedStatements, visitedNodes) {
    if (!node || visitedNodes.has(node)) {
      return;
    }
    visitedNodes.add(node);
    if (node instanceof DiamondNodeModel) {
      this.nodeParser.parseNode(node.data);
      const falseNextNode = this.getNextNode(node.outPortFalse);
      const trueNextNode = this.getNextNode(node.outPortTrue);
      this.traverseForVariables(
        falseNextNode,
        unparsedStatements,
        visitedNodes
      );
      this.traverseForVariables(trueNextNode, unparsedStatements, visitedNodes);
      return;
    }
    if (
      node.name !== 'Start' &&
      !this.nodeParser.parseNodeForVariables(node.data)
    ) {
      unparsedStatements.add(node.data);
    }
    const nextNode = this.getNextNodeForDefaultNode(node);
    this.traverseForVariables(nextNode, unparsedStatements, visitedNodes);
  }

  traverseDiamondNode(node, stopNode) {
    const falseNextNode = this.getNextNode(node.outPortFalse);
    const trueNextNode = this.getNextNode(node.outPortTrue);
    const conditionCode = this.nodeParser.parseNode(node.data);
    const trueWhileCode = this.generateCodeForCycle(node, true);
    if (trueWhileCode) {
      return `while (${conditionCode}) {\n${trueWhileCode}}\n${this.traverseNextNode(
        falseNextNode,
        stopNode
      )}`;
    }
    const falseWhileCode = this.generateCodeForCycle(node, false);
    if (falseWhileCode) {
      return `while (!(${conditionCode})) {\n${falseWhileCode}}\n${this.traverseNextNode(
        trueNextNode,
        stopNode
      )}`;
    }
    const intersection = this.getIntersection(trueNextNode, falseNextNode);
    if (intersection) {
      const elseCode = this.traverseNextNode(falseNextNode, intersection);
      return `if (${conditionCode}) {\n${this.traverseNextNode(
        trueNextNode,
        intersection
      )}}${
        elseCode !== '' ? ` else {\n${elseCode}}` : ''
      }\n${this.traverseNextNode(intersection, stopNode)}`;
    }
    const elseCode = this.traverseNextNode(falseNextNode, stopNode);
    return `if (${conditionCode}) {\n${this.traverseNextNode(
      trueNextNode,
      stopNode
    )}}${elseCode !== '' ? ` else {\n${elseCode}}` : ''}\n`;
  }

  traverseNextNode(node, stopNode = null) {
    if (!node || (stopNode && node === stopNode)) {
      return '';
    }
    if (node instanceof DiamondNodeModel) {
      return this.traverseDiamondNode(node, stopNode);
    }
    const curNodeCode =
      node.name === 'Start' ? '' : `${this.nodeParser.parseNode(node.data)}\n`;
    const nextNode = this.getNextNodeForDefaultNode(node);
    if (!nextNode) {
      return curNodeCode;
    }
    return curNodeCode + this.traverseNextNode(nextNode, stopNode);
  }

  generateCodeForCycle(start, isTrue) {
    const outPort = isTrue ? start.outPortTrue : start.outPortFalse;
    const nodeParserMemoryVarsRollback = {...this.nodeParser.memoryVarsDeclared};
    let node = this.getNextNode(outPort);
    let code = '';
    while (node) {
      if (node === start) {
        return code;
      }
      // unable to handle multiple diamond nodes in the same cycle
      if (node instanceof DiamondNodeModel) {
        this.nodeParser.memoryVarsDeclared = nodeParserMemoryVarsRollback;
        return null;
      }
      code += `${this.nodeParser.parseNode(node.data)}\n`;
      node = this.getNextNodeForDefaultNode(node);
    }
    this.nodeParser.memoryVarsDeclared = nodeParserMemoryVarsRollback;
    return null;
  }

  getNextNode(outPort) {
    const links = Object.values(outPort.getLinks());
    if (links.length === 0 || !links[0].targetPort) {
      return null;
    }
    return links[0].targetPort.getNode();
  }

  getNextNodeForDefaultNode(node) {
    if (node instanceof DiamondNodeModel || node.getOutPorts().length === 0) {
      return null;
    }
    return this.getNextNode(node.getOutPorts()[0]);
  }

  getIntersection(nodeA, nodeB) {
    const lengthDifference = this.getCount(nodeA) - this.getCount(nodeB);
    if (lengthDifference > 0) {
      return this.getIntersectionNodeTraversal(lengthDifference, nodeA, nodeB);
    }
    return this.getIntersectionNodeTraversal(-lengthDifference, nodeB, nodeA);
  }

  getCount(node) {
    let currentNode = node;
    let count = 0;
    while (currentNode) {
      count += 1;
      currentNode = this.getNextNodeForDefaultNode(currentNode);
    }
    return count;
  }

  getIntersectionNodeTraversal(diff, nodeA, nodeB) {
    let longerNode = nodeA;
    let shorterNode = nodeB;
    for (let i = 0; i < diff; i += 1) {
      if (!longerNode) return null;
      longerNode = this.getNextNodeForDefaultNode(longerNode);
    }

    while (longerNode && shorterNode) {
      if (longerNode === shorterNode) return longerNode;
      longerNode = this.getNextNodeForDefaultNode(longerNode);
      shorterNode = this.getNextNodeForDefaultNode(shorterNode);
    }

    return null;
  }
}
