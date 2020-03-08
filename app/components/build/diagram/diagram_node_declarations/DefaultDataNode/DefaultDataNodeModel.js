// @flow

import * as _ from 'lodash';
import {
  NodeModel,
  NodeModelListener,
  Toolkit,
  DiagramEngine,
  DefaultPortModel
} from 'storm-react-diagrams';
import DefaultDataPortModel from './DefaultDataPortModel';

export default class DefaultDataNodeModel extends NodeModel<NodeModelListener> {
  name: string;

  color: string;

  data: {};

  ports: Array<DefaultPortModel>;

  constructor(
    name: string = 'Untitled',
    color: string = 'rgb(0,192,255)',
    data: {} = {}
  ) {
    super('data');
    this.name = name;
    this.color = color;
    this.data = data;
  }

  addInPort(label: string): DefaultPortModel {
    return this.addPort(new DefaultDataPortModel(true, Toolkit.UID(), label));
  }

  addOutPort(label: string): DefaultPortModel {
    return this.addPort(new DefaultDataPortModel(false, Toolkit.UID(), label));
  }

  deSerialize(
    object: { name: string, color: string, data: {} },
    engine: DiagramEngine
  ) {
    super.deSerialize(object, engine);
    this.name = object.name;
    this.color = object.color;
    this.data = object.data;
  }

  serialize(): {} {
    return _.merge(super.serialize(), {
      name: this.name,
      color: this.color,
      data: this.data
    });
  }

  getInPorts(): Array<DefaultPortModel> {
    return _.filter(this.ports, (portModel: DefaultPortModel): boolean => portModel.in);
  }

  getOutPorts(): Array<DefaultPortModel> {
    return _.filter(this.ports, (portModel: DefaultPortModel): boolean => !portModel.in);
  }
}
