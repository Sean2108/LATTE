import * as SRD from 'storm-react-diagrams';
import { DefaultDataNodeModel } from './DefaultDataNodeModel';
import * as React from 'react';

export class DefaultDataNodeFactory extends SRD.AbstractNodeFactory {
  constructor() {
    super('data');
  }

  generateReactWidget(diagramEngine, node) {
    return React.createElement(SRD.DefaultNodeWidget, {
        node: node,
        diagramEngine: diagramEngine
    });
  }

  getNewInstance() {
    return new DefaultDataNodeModel();
  }
}
