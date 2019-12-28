import * as _ from 'lodash';
import {
  PortModel,
  DefaultLinkModel
} from 'storm-react-diagrams';

export default class DiamondPortModel extends PortModel {
  in;

  position;
  
  label;

  constructor(pos, isInput, label) {
    super(pos, 'diamond', null, 1);
    this.position = pos;
    this.in = isInput;
    this.label = label;
  }

  serialize() {
    return _.merge(super.serialize(), {
      position: this.position,
      in: this.in,
      label: this.label
    });
  }

  deSerialize(data, engine) {
    super.deSerialize(data, engine);
    this.position = data.position;
    this.in = data.in;
    this.label = data.label;
  }

  canLinkToPort(port) {
    if (port instanceof DiamondPortModel) {
      return this.in !== port.in;
    }
    return true;
  }

  createLinkModel() {
    return new DefaultLinkModel();
  }
}
