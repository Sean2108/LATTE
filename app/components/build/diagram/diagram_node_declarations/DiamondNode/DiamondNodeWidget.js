// @flow

import * as React from 'react';
import { PortWidget } from 'storm-react-diagrams';
import DiamondNodeModel from './DiamondNodeModel';
import DiamondPortLabel from './DiamondPortLabelWidget';

type DiamondNodeWidgetProps = {
  node: DiamondNodeModel,
  size: number,
  text?: string
};

type DiamondNodeWidgetState = {};

export default class DiamondNodeWidget extends React.Component<
  DiamondNodeWidgetProps,
  DiamondNodeWidgetState
> {
  constructor(props: DiamondNodeWidgetProps) {
    super(props);
    this.state = {};
  }

  render(): React.Node {
    const { size, text, node } = this.props;
    return (
      <div
        className="diamond-node"
        style={{
          position: 'relative',
          width: size,
          height: size
        }}
      >
        <svg
          width={size}
          height={size}
          dangerouslySetInnerHTML={{
            // eslint-disable-line react/no-danger
            __html:
              `
          <g id="Layer_1">
          </g>
          <g id="Layer_2">
            <polygon fill="purple" stroke="#000000" stroke-width="3" stroke-miterlimit="10" points="10,` +
              size / 2 +
              ` ` +
              size / 2 +
              `,10 ` +
              (size - 10) +
              `,` +
              size / 2 +
              ` ` +
              size / 2 +
              `,` +
              (size - 10) +
              ` "/>
          </g>
        `
          }}
        />
        <div
          style={{
            width: 200,
            position: 'absolute',
            left: '50%',
            top: '45%',
            marginLeft: -100,
            color: 'white'
          }}
        >
          {text}
        </div>
        <div
          style={{
            position: 'absolute',
            zIndex: 10,
            top: size / 2 - 8,
            left: -8
          }}
        >
          <PortWidget name="left" node={node} />
        </div>
        <div
          style={{
            position: 'absolute',
            zIndex: 10,
            left: size / 2 - 8,
            top: -8
          }}
        >
          <PortWidget name="top" node={node} />
        </div>
        <div
          style={{
            position: 'absolute',
            zIndex: 10,
            left: size - 8,
            top: size / 2 - 8
          }}
        >
          <DiamondPortLabel
            name="right"
            node={node}
            model={node.outPortFalse}
          />
        </div>
        <div
          style={{
            position: 'absolute',
            zIndex: 10,
            left: size / 2 - 8,
            top: size - 8
          }}
        >
          <DiamondPortLabel
            name="bottom"
            node={node}
            model={node.outPortTrue}
          />
        </div>
      </div>
    );
  }
}
