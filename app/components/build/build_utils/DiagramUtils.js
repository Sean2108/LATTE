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
  return diagrams
    .map((diagram: {}): DiagramModel => {
      const diagramModel: DiagramModel = new DiagramModel();
      if (Object.entries(diagram).length > 0) {
        diagramModel.deSerializeDiagram(diagram, engine);
      }
      return diagramModel;
    })
    .map((model: DiagramModel): DefaultDataNodeModel => {
      const startNode = findStart(model);
      if (!startNode) {
        model.addAll(getNewStartNode());
      }
      return startNode;
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
