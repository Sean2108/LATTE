// @flow

import * as _ from 'lodash';
import * as React from 'react';
import { NodeModel, DiagramEngine } from 'storm-react-diagrams';
import DiamondPortModel from './DiamondPortModel';

export default class DiamondNodeModel extends NodeModel {
  outPortTrue: DiamondPortModel;

  outPortFalse: DiamondPortModel;

  name: string;
  
  data: {};

  constructor(message: string, data: {} = {}) {
    super('diamond', message);
    this.name = message;
    this.data = data;
    this.addPort(new DiamondPortModel('top', true, ''));
    this.addPort(new DiamondPortModel('left', true, ''));
    this.outPortTrue = this.addPort(
      new DiamondPortModel('bottom', false, <font color="white">True</font>)
    );
    this.outPortFalse = this.addPort(
      new DiamondPortModel('right', false, <font color="white">False</font>)
    );
  }

  deSerialize(object: {name: string, data: {}}, engine: DiagramEngine): void {
    super.deSerialize(object, engine);
    this.name = object.name;
    this.data = object.data;
    this.outPortTrue = this.getPort('bottom');
    this.outPortTrue.label = <font color="white">True</font>;
    this.outPortFalse = this.getPort('right');
    this.outPortFalse.label = <font color="white">False</font>;
  }

  serialize(): {} {
    return _.merge(super.serialize(), {
      name: this.name,
      data: this.data
    });
  }
}
