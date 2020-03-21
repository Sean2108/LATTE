// @flow

import {
  DiagramEngine,
  DiagramModel,
  DefaultPortModel,
  NodeModel
} from 'storm-react-diagrams';
import DiamondPortModel from '../diagram/diagram_node_declarations/DiamondNode/DiamondPortModel';
import DiamondNodeFactory from '../diagram/diagram_node_declarations/DiamondNode/DiamondNodeFactory';
import DefaultDataNodeFactory from '../diagram/diagram_node_declarations/DefaultDataNode/DefaultDataNodeFactory';
import SimplePortFactory from '../diagram/SimplePortFactory';
import DefaultDataNodeModel from '../diagram/diagram_node_declarations/DefaultDataNode/DefaultDataNodeModel';
import DiamondNodeModel from '../diagram/diagram_node_declarations/DiamondNode/DiamondNodeModel';

export function setupEngine(): DiagramEngine {
  const engine: DiagramEngine = new DiagramEngine();
  engine.installDefaultFactories();
  engine.registerPortFactory(
    new SimplePortFactory(
      'diamond',
      (): DiamondPortModel => new DiamondPortModel('', true, '')
    )
  );
  engine.registerNodeFactory(new DiamondNodeFactory());
  engine.registerNodeFactory(new DefaultDataNodeFactory());
  return engine;
}

export function extractStartNodes(
  engine: DiagramEngine,
  diagrams: Array<{}>
): Array<?DefaultDataNodeModel> {
  return diagrams.map((diagram: {}): DefaultDataNodeModel => {
    const diagramModel: DiagramModel = new DiagramModel();
    if (Object.entries(diagram).length > 0) {
      diagramModel.deSerializeDiagram(diagram, engine);
    }
    return findStart(diagramModel);
  });
}

export function getNewStartNode() {
  const startNode: DefaultDataNodeModel = new DefaultDataNodeModel(
    'Start',
    'rgb(0,192,255)'
  );
  const startOut: DefaultPortModel = startNode.addOutPort(' ');
  startOut.setMaximumLinks(1);
  startNode.setPosition(100, 100);
  return startNode;
}

export function findStart(model: DiagramModel): NodeModel {
  for (const node: NodeModel of Object.values(model.getNodes())) {
    if (node.name === 'Start') {
      return node;
    }
  }
  return null;
}

function createDefaultNode(
  label: string,
  color: string,
  data: {},
  isReturn: boolean
): DefaultDataNodeModel {
  const node: DefaultDataNodeModel = new DefaultDataNodeModel(
    label,
    color,
    data
  );
  node.addInPort(' ');
  if (!isReturn) {
    const outPort: DefaultPortModel = node.addOutPort(' ');
    outPort.setMaximumLinks(1);
  }
  return node;
}

export function selectNode(type: string, desc: string, data: {}): NodeModel {
  switch (type) {
    case 'event':
      return createDefaultNode(
        `Emit Event: ${desc}`,
        'rgb(0,192,0)',
        data,
        false
      );
    case 'entity':
      return createDefaultNode(
        `New Entity: ${desc}`,
        'rgb(100,100,0)',
        data,
        false
      );
    case 'transfer':
      return createDefaultNode(
        `Transfer: ${desc}`,
        'rgb(255,100,0)',
        data,
        false
      );
    case 'return':
      return createDefaultNode(`Return: ${desc}`, 'rgb(192,255,0)', data, true);
    case 'conditional':
      return new DiamondNodeModel(`${desc}`, data);
    case 'assignment':
    default:
      return createDefaultNode(
        `Assignment: ${desc}`,
        'rgb(192,0,0)',
        data,
        false
      );
  }
}
