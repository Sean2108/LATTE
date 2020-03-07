// @flow

import { DefaultPortModel, PortModel } from 'storm-react-diagrams';

export default class DefaultDataPortModel extends DefaultPortModel {
  constructor(
    isInput: boolean,
    name: string,
    label: ?string = null,
    id?: string
  ) {
    super(isInput, name, label, id);
    this.in = isInput;
  }

  canLinkToPort(port: PortModel): boolean {
    return this.in !== port.in;
  }
}
