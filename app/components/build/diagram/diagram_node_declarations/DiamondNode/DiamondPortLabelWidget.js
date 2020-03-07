// @flow

import * as React from 'react';
import {
  PortWidget,
  BaseWidgetProps,
  BaseWidget
} from 'storm-react-diagrams';
import DiamondPortModel from './DiamondPortModel';

type DiamondPortLabelProps = BaseWidgetProps & {
  model: DiamondPortModel
};

type DiamondPortLabelState = {};

export default class DiamondPortLabel extends BaseWidget<
  DiamondPortLabelProps,
  DiamondPortLabelState
> {
  constructor(props: DiamondPortLabelProps) {
    super('srd-default-port', props);
  }

  getClassName(): string {
    return (
      super.getClassName() +
      (this.props.model.in ? this.bem('--in') : this.bem('--out'))
    );
  }

  render(): React.Node {
    const port = (
      <PortWidget
        node={this.props.model.getParent()}
        name={this.props.model.name}
      />
    );
    const label = <div className="name">{this.props.model.label}</div>;

    return (
      <div {...this.getProps()}>
        {this.props.model.in ? label : port}
        {this.props.model.in ? port : label}
      </div>
    );
  }
}
