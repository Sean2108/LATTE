import * as React from 'react';
import {
  NodeModel,
  NodeModelListener,
  Toolkit,
  DiagramEngine,
  DefaultPortModel
} from 'storm-react-diagrams';

export class DefaultDataNodeModel extends NodeModel<NodeModelListener> {
  name;
  color;
  data;
  ports;

  constructor(name = 'Untitled', color = 'rgb(0,192,255)', data = {}) {
    super('data');
    this.name = name;
    this.color = color;
    this.data = data;
  }

  addInPort(label) {
    return this.addPort(new DefaultPortModel(true, Toolkit.UID(), label));
  }

  addOutPort(label) {
    return this.addPort(new DefaultPortModel(false, Toolkit.UID(), label));
  }

  deSerialize(object, engine) {
    super.deSerialize(object, engine);
    this.name = object.name;
    this.color = object.color;
    this.data = object.data;
  }

  serialize() {
    return _.merge(super.serialize(), {
      name: this.name,
      color: this.color,
      data: this.data
    });
  }

  getInPorts() {
    return _.filter(this.ports, portModel => {
      return portModel.in;
    });
  }

  getOutPorts() {
    return _.filter(this.ports, portModel => {
      return !portModel.in;
    });
  }
}
