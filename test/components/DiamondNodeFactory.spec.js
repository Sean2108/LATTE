import { DiagramEngine } from 'storm-react-diagrams';
import DiamondNodeFactory from '../../app/components/build/diagram/diagram_node_declarations/DiamondNode/DiamondNodeFactory';

describe('DiamondNodeFactory component', () => {
  it('should work correctly', () => {
    const diamondNodeFactory = new DiamondNodeFactory();
    expect(diamondNodeFactory.type).toEqual('diamond');
    const reactWidget = diamondNodeFactory.generateReactWidget(
      new DiagramEngine(),
      { id: 'diamondNode1' }
    );
    expect(reactWidget.props).toEqual({
      node: { id: 'diamondNode1' },
      size: 150,
      text: 'diamondNode1'
    });
    const diamondNodeModel = diamondNodeFactory.getNewInstance();
    expect(diamondNodeModel.type).toEqual('diamond');
    expect(Object.keys(diamondNodeModel.getPorts())).toHaveLength(4);
    expect(diamondNodeModel.outPortTrue).toEqual(
      expect.objectContaining({
        name: 'bottom',
        position: 'bottom',
        in: true
      })
    );
    expect(diamondNodeModel.outPortFalse).toEqual(
      expect.objectContaining({
        name: 'right',
        position: 'right',
        in: true
      })
    );
  });
});
