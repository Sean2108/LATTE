// @flow

import {
  DiagramEngine,
  DiagramModel,
  DiagramWidget,
  DefaultPortModel,
  NodeModel,
  PointModel,
  PortModel
} from 'storm-react-diagrams';
import DiamondPortModel from '../diagram/diagram_node_declarations/DiamondNode/DiamondPortModel';
import DiamondNodeFactory from '../diagram/diagram_node_declarations/DiamondNode/DiamondNodeFactory';
import DefaultDataNodeFactory from '../diagram/diagram_node_declarations/DefaultDataNode/DefaultDataNodeFactory';
import SimplePortFactory from '../diagram/SimplePortFactory';
import DefaultDataNodeModel from '../diagram/diagram_node_declarations/DefaultDataNode/DefaultDataNodeModel';
import type { DiagramState } from '../../../types';

export function setupDiagram(): {
  engine: DiagramEngine,
  model: DiagramModel,
  startNode: DefaultDataNodeModel
} {
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

  return { engine, ...getNewModel() };
}

export function extractDiagramState(engine, diagrams: Array<{}>): DiagramState {
  const models: Array<DiagramModel> = diagrams.map(
    (diagram: {}): DiagramModel => {
      const diagramModel: DiagramModel = new DiagramModel();
      if (Object.entries(diagram).length > 0) {
        diagramModel.deSerializeDiagram(diagram, engine);
      }
      return diagramModel;
    }
  );
  const startNodes: Array<DefaultDataNodeModel> = models.map(
    (model: DiagramModel): DefaultDataNodeModel => {
      const startNode = findStart(model);
      if (!startNode) {
        model.addAll(getNewStartNode());
      }
      return startNode;
    }
  );
  return { engine, startNodes, models };
}

export function getNewModel(): {
  model: DiagramModel,
  startNode: DefaultDataNodeModel
} {
  const model: DiagramModel = new DiagramModel();
  const startNode: DefaultDataNodeModel = getNewStartNode();
  model.addAll(startNode);
  return { model, startNode };
}

function getNewStartNode() {
  const startNode: DefaultDataNodeModel = new DefaultDataNodeModel(
    'Start',
    'rgb(0,192,255)'
  );
  const startOut: DefaultPortModel = startNode.addOutPort(' ');
  startOut.setMaximumLinks(1);
  startNode.setPosition(100, 100);
  return startNode;
}

function findStart(model: DiagramModel): NodeModel {
  for (const node: NodeModel of Object.values(model.getNodes())) {
    if (node.name === 'Start') {
      return node;
    }
  }
  return null;
}
