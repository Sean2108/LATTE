// @flow

import * as _ from 'lodash';
import * as React from 'react';
import {
  PortModel,
  DefaultLinkModel,
  DiagramEngine
} from 'storm-react-diagrams';

export default class DiamondPortModel extends PortModel {
  in: boolean;

  position: string;

  label: React.Node | string;

  constructor(pos: string, isInput: boolean, label: React.Node | string) {
    super(pos, 'diamond', null, 1);
    this.position = pos;
    this.in = isInput;
    this.label = label;
  }

  serialize(): {} {
    return _.merge(super.serialize(), {
      position: this.position,
      in: this.in,
      label: this.label
    });
  }

  deSerialize(
    data: { position: string, in: boolean, label: React.Node | string },
    engine: DiagramEngine
  ): void {
    super.deSerialize(data, engine);
    this.position = data.position;
    this.in = data.in;
    this.label = data.label;
  }

  canLinkToPort(port: PortModel): boolean {
    return this.in !== port.in;
  }

  createLinkModel(): DefaultLinkModel {
    return new DefaultLinkModel();
  }
}
