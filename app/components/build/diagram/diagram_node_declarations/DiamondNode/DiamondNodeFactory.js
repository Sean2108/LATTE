import * as SRD from 'storm-react-diagrams';
import * as React from 'react';
import DiamonNodeWidget from './DiamondNodeWidget';
import DiamondNodeModel from './DiamondNodeModel';

export default class DiamondNodeFactory extends SRD.AbstractNodeFactory {
  constructor() {
    super('diamond');
  }

  generateReactWidget(diagramEngine, node) {
    return <DiamonNodeWidget node={node} size={150} text={node.id} />;
  }

  getNewInstance() {
    return new DiamondNodeModel();
  }
}
