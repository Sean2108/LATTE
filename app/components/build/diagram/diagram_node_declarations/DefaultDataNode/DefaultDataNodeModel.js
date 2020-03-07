import * as _ from 'lodash';
import {
  NodeModel,
  NodeModelListener,
  Toolkit
} from 'storm-react-diagrams';
import DefaultDataPortModel from './DefaultDataPortModel';

export default class DefaultDataNodeModel extends NodeModel<NodeModelListener> {
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
    return this.addPort(new DefaultDataPortModel(true, Toolkit.UID(), label));
  }

  addOutPort(label) {
    return this.addPort(new DefaultDataPortModel(false, Toolkit.UID(), label));
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
    return _.filter(this.ports, portModel => portModel.in);
  }

  getOutPorts() {
    return _.filter(this.ports, portModel => !portModel.in);
  }
}
