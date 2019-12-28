import * as React from 'react';
import { PortWidget, DefaultPortLabel } from 'storm-react-diagrams';
import DiamondNodeModel from './DiamondNodeModel';

export interface DiamonNodeWidgetProps {
  node: DiamondNodeModel,
  size?: number,
  text?: string
}

export interface DiamonNodeWidgetState {}

export default class DiamonNodeWidget extends React.Component<
  DiamonNodeWidgetProps,
  DiamonNodeWidgetState
> {
  constructor(props: DiamonNodeWidgetProps) {
    super(props);
    this.state = {};
  }

  render() {
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
          dangerouslySetInnerHTML={{ // eslint-disable-line react/no-danger
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
          <DefaultPortLabel
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
          <DefaultPortLabel
            name="bottom"
            node={node}
            model={node.outPortTrue}
          />
        </div>
      </div>
    );
  }
}
