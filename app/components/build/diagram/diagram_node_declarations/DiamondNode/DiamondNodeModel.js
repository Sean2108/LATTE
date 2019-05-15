import * as React from 'react';
import { NodeModel, DiagramEngine } from 'storm-react-diagrams';
import { DiamondPortModel } from './DiamondPortModel';

export class DiamondNodeModel extends NodeModel {
  outPortTrue;
  outPortFalse;
  name;
  data;

  constructor(message, data = {}) {
    super('diamond', message);
    this.name = message;
    this.data = data;
    this.addPort(new DiamondPortModel('top', false, ''));
    this.addPort(new DiamondPortModel('left', false, ''));
    this.outPortTrue = this.addPort(
      new DiamondPortModel('bottom', true, <font color="white">True</font>)
    );
    this.outPortFalse = this.addPort(
      new DiamondPortModel('right', true, <font color="white">False</font>)
    );
  }

  deSerialize(object, engine: DiagramEngine) {
    super.deSerialize(object, engine);
    this.name = object.name;
    this.data = object.data;
    this.outPortTrue = this.getPort('bottom');
    this.outPortTrue.label = <font color="white">True</font>;
    this.outPortFalse = this.getPort('right');
    this.outPortFalse.label = <font color="white">False</font>;
  }

  serialize() {
    return _.merge(super.serialize(), {
      name: this.name,
      data: this.data
    });
  }
}
