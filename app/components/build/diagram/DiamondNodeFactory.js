import * as SRD from 'storm-react-diagrams';
import { DiamonNodeWidget } from './DiamondNodeWidget';
import { DiamondNodeModel } from './DiamondNodeModel';
import * as React from 'react';

export class DiamondNodeFactory extends SRD.AbstractNodeFactory {
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
