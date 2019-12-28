import * as SRD from 'storm-react-diagrams';
import * as React from 'react';
import DefaultDataNodeModel from './DefaultDataNodeModel';

export default class DefaultDataNodeFactory extends SRD.AbstractNodeFactory {
  constructor() {
    super('data');
  }

  generateReactWidget(diagramEngine, node) {
    return React.createElement(SRD.DefaultNodeWidget, {
      node,
      diagramEngine
    });
  }

  getNewInstance() {
    return new DefaultDataNodeModel();
  }
}
