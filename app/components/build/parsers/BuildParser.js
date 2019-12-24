import { DiamondNodeModel } from '../diagram/diagram_node_declarations/DiamondNode/DiamondNodeModel';
import {
  parseVariable,
  checkIntUintMismatch,
  bitsModeGetType
} from './VariableParser';
import { NodeParser } from './NodeParser';

export class BuildParser {
  constructor(onVariablesChange) {
    this.nodeParser = new NodeParser();
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
  }

  getReturnVar() {
    return this.nodeParser.returnVar;
  }

  getView() {
    return this.nodeParser.isView;
  }

  parse(start) {
    this.findVariables(start);
    let code = this.traverseNextNode(start);
    this.onVariablesChange({
      ...this.nodeParser.variables,
      ...this.nodeParser.varList
    });
    return code;
  }

  findVariables(start) {
    let unparsedStatements = new Set();
    this.traverseForVariables(start, unparsedStatements, new Set());
    let hasChanged = false;
    do {
      for (let statement of unparsedStatements) {
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
      this.parseNode(node.data, this.nodeParser.structList);
      let falseNextNode = this.getNextNode(node.outPortFalse);
      let trueNextNode = this.getNextNode(node.outPortTrue);
      this.traverseForVariables(
        falseNextNode,
        unparsedStatements,
        visitedNodes
      );
      this.traverseForVariables(trueNextNode, unparsedStatements, visitedNodes);
    }
    if (
      node.name !== 'Start' &&
      !this.nodeParser.parseNodeForVariables(node.data)
    ) {
      unparsedStatements.add(node.data);
    }
    let nextNode = this.getNextNodeForDefaultNode(node);
    this.traverseForVariables(nextNode, unparsedStatements, visitedNodes);
  }

  traverseDiamondNode(node, stopNode) {
    let falseNextNode = this.getNextNode(node.outPortFalse);
    let trueNextNode = this.getNextNode(node.outPortTrue);
    let trueWhileCode = this.generateCodeForCycle(node, true);
    let conditionCode = this.nodeParser.parseNode(node.data);
    if (trueWhileCode) {
      return `while (${conditionCode}) {\n${trueWhileCode}}\n${this.traverseNextNode(
        falseNextNode,
        stopNode
      )}`;
    }
    let falseWhileCode = this.generateCodeForCycle(node, false);
    if (falseWhileCode) {
      return `while (!(${conditionCode})) {\n${falseWhileCode}}\n${this.traverseNextNode(
        trueNextNode,
        stopNode
      )}`;
    }
    let intersection = this.getIntersection(trueNextNode, falseNextNode);
    if (intersection) {
      let elseCode = this.traverseNextNode(falseNextNode, intersection);
      return `if (${conditionCode}) {\n${this.traverseNextNode(
        trueNextNode,
        intersection
      )}} ${
        elseCode !== '' ? `else {\n${elseCode}}` : ''
      }\n${this.traverseNextNode(intersection, stopNode)}`;
    }
    let elseCode = this.traverseNextNode(falseNextNode, stopNode);
    return `if (${conditionCode}) {\n${this.traverseNextNode(
      trueNextNode,
      stopNode
    )}} ${elseCode !== '' ? `else {\n${elseCode}}` : ''}\n`;
  }

  traverseNextNode(node, stopNode = null) {
    if (!node || (stopNode && node === stopNode)) {
      return '';
    }
    if (node instanceof DiamondNodeModel) {
      return this.traverseDiamondNode(node, stopNode);
    }
    let curNodeCode =
      node.name === 'Start' ? '' : this.nodeParser.parseNode(node.data) + '\n';
    let nextNode = this.getNextNodeForDefaultNode(node);
    if (!nextNode) {
      return curNodeCode;
    }
    return curNodeCode + this.traverseNextNode(nextNode, stopNode);
  }

  generateCodeForCycle(start, isTrue) {
    let outPort = isTrue ? start.outPortTrue : start.outPortFalse;
    let node = this.getNextNode(outPort);
    let code = '';
    while (node) {
      if (node === start) {
        return code;
      }
      if (node instanceof DiamondNodeModel) {
        return null;
      }
      (code += this.nodeParser),
        parseNode(node.data, {
          ...this.memoryVarsDeclared
        }) + '\n';
      node = this.getNextNodeForDefaultNode(node);
    }
    return null;
  }

  getNextNode(outPort) {
    let links = Object.values(outPort.getLinks());
    if (links.length === 0 || !links[0].targetPort) {
      return null;
    } else {
      return links[0].targetPort.getNode();
    }
  }

  getNextNodeForDefaultNode(node) {
    if (node instanceof DiamondNodeModel || node.getOutPorts().length === 0) {
      return null;
    }
    return this.getNextNode(node.getOutPorts()[0]);
  }

  getIntersection(nodeA, nodeB) {
    let lengthDifference = this.getCount(nodeA) - this.getCount(nodeB);
    if (lengthDifference > 0) {
      return this.getIntersectionNodeTraversal(lengthDifference, nodeA, nodeB);
    }
    return this.getIntersectionNodeTraversal(-lengthDifference, nodeB, nodeA);
  }

  getCount(node) {
    let count = 0;
    while (node) {
      count += 1;
      node = this.getNextNodeForDefaultNode(node);
    }
    return count;
  }

  getIntersectionNodeTraversal(diff, longerNode, shorterNode) {
    for (let i = 0; i < diff; i++) {
      if (!longerNode) return null;
      longerNode = this.getNextNodeForDefaultNode(longerNode);
    }

    while (longerNode && shorterNode) {
      if (longerNode == shorterNode) return longerNode;
      longerNode = this.getNextNodeForDefaultNode(longerNode);
      shorterNode = this.getNextNodeForDefaultNode(shorterNode);
    }

    return null;
  }
}
