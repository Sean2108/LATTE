import * as SRD from 'storm-react-diagrams';
import * as React from 'react';
import DiamondNodeWidget from './DiamondNodeWidget';
import DiamondNodeModel from './DiamondNodeModel';

export default class DiamondNodeFactory extends SRD.AbstractNodeFactory {
  constructor() {
    super('diamond');
  }

  generateReactWidget(diagramEngine, node) {
    return <DiamondNodeWidget node={node} size={150} text={node.id} />;
  }

  getNewInstance() {
    return new DiamondNodeModel();
  }
}
