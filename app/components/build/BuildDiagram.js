// @flow

import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Tooltip from '@material-ui/core/Tooltip';
import { Button, IconButton, CircularProgress } from '@material-ui/core';
import TrendingUpIcon from '@material-ui/icons/TrendingUp';
import UndoIcon from '@material-ui/icons/Undo';
import RedoIcon from '@material-ui/icons/Redo';
import {
  DiagramEngine,
  DiagramModel,
  DiagramWidget,
  DefaultPortModel,
  NodeModel
} from 'storm-react-diagrams';
import TrayWidget from './diagram/TrayWidget';
import TrayItemWidget from './diagram/TrayItemWidget';
import DiamondNodeModel from './diagram/diagram_node_declarations/DiamondNode/DiamondNodeModel';
import DiamondNodeFactory from './diagram/diagram_node_declarations/DiamondNode/DiamondNodeFactory';
import SimplePortFactory from './diagram/SimplePortFactory';
import DiamondPortModel from './diagram/diagram_node_declarations/DiamondNode/DiamondPortModel';
import DefaultDataNodeModel from './diagram/diagram_node_declarations/DefaultDataNode/DefaultDataNodeModel';
import DefaultDataNodeFactory from './diagram/diagram_node_declarations/DefaultDataNode/DefaultDataNodeFactory';
import DiagramModal from './diagram/DiagramModal';
import BuildParser from './parsers/BuildParser';
import { objectEquals } from './build_utils/TypeCheckFormattingUtils';
import EditHistory from './build_utils/EditHistory';

const styles = theme => ({
  paper: {
    padding: theme.spacing.unit * 2,
    textAlign: 'center',
    color: 'theme.palette.text.secondary',
    resize: 'vertical',
    overflow: 'hidden'
  },
  tooltipFont: {
    fontSize: 14
  },
  titleDiv: {
    display: 'flex',
    'justify-content': 'space-between',
    'align-items': 'center'
  },
  invis: {
    visibility: 'hidden'
  },
  rightIcon: {
    marginLeft: theme.spacing.unit
  },
  flexChild: {
    display: 'flex',
    'justify-content': 'space-between',
    'flex-basis': '200px'
  },
  inlineBlock: {
    display: 'inline-block'
  }
});

const tooltips = {
  assignment:
    'The Assignment Node assigns and stores values to a new variable that you can later in the diagram.',
  event:
    'The Event Node announces an event that has previously been defined in the Global State Tab.',
  entity:
    'The Entity Node creates a new entity based on the entity templates defined in the Global State Tab.',
  transfer: 'The Transfer Node transfer Ether to an address.',
  return:
    'The Return Node returns a value to the external user and ends the function.',
  conditional:
    'The Conditional Node provides branching logic. Based on whether the defined condition is true or false, the execution of the function can take different paths.'
};

type NodeType = $Keys<typeof tooltips>;

type onParseFn = {
  tabsCode: string,
  tabsReturn: string,
  isView: string,
  diagrams: {}
};

type Props = {
  classes: { [key: string]: string },
  varList: {},
  functionParams: {}, // eslint-disable-line react/no-unused-prop-types
  events: {},
  entities: {},
  onParse: onParseFn => void, // eslint-disable-line react/no-unused-prop-types
  onVariablesChange: ({}) => void,
  diagram: {},
  settings: { bitsMode: boolean, indentation: string },
  openDrawer: () => void,
  updateGasHistory: () => void, // eslint-disable-line react/no-unused-prop-types
  updateBuildError: () => void,
  isConstructor: boolean,
  editHistory: EditHistory
};

type Point = {
  x: ?number,
  y: ?number
};

type State = {
  open: boolean,
  type: NodeType,
  points: Point,
  isProcessing: boolean
};

class BuildDiagram extends React.Component<Props, State> {
  engine: DiagramEngine;

  start: NodeModel;

  model: DiagramModel;

  buildParser: BuildParser;

  state = {
    open: false,
    type: 'assignment',
    points: { x: null, y: null },
    isProcessing: false
  };

  componentWillMount(): void {
    this.engine = new DiagramEngine();
    this.engine.installDefaultFactories();
    this.engine.registerPortFactory(
      new SimplePortFactory(
        'diamond',
        (): DiamondPortModel => new DiamondPortModel()
      )
    );
    this.engine.registerNodeFactory(new DiamondNodeFactory());
    this.engine.registerNodeFactory(new DefaultDataNodeFactory());
    this.renderDiagram();
  }

  componentDidUpdate(prevProps: Props): void {
    if (!objectEquals(this.props.diagram, prevProps.diagram)) {
      this.renderDiagram();
    }
  }

  renderDiagram(): void {
    const { diagram, onVariablesChange, updateBuildError } = this.props;
    // diagram: object, onVariablesChange: function, updateBuildError: function
    this.model = new DiagramModel();
    this.start = null;
    if (Object.entries(diagram).length > 0) {
      this.model.deSerializeDiagram(diagram, this.engine);
      this.start = this.findStart();
    }
    if (!this.start) {
      this.start = new DefaultDataNodeModel('Start', 'rgb(0,192,255)');
      const startOut: DefaultPortModel = this.start.addOutPort(' ');
      startOut.setMaximumLinks(1);
      this.start.setPosition(100, 100);
      this.model.addAll(this.start);
    }
    this.buildParser = new BuildParser(onVariablesChange, updateBuildError);
    this.resetListener(this.props);

    this.engine.setDiagramModel(this.model);
  }

  resetListener(props: Props) {
    this.model.clearListeners();
    this.model.addListener({
      linksUpdated: (): void => {
        this.setState({ isProcessing: true });
        setTimeout((): void => {
          this.parseNodes(props);
        }, 5000);
      }
    });
  }

  parseNodes({
    varList,
    functionParams,
    events,
    entities,
    settings,
    onParse,
    updateGasHistory
  }) {
    this.buildParser.reset(varList, functionParams, events, entities, settings);
    const code: string = this.buildParser.parse(this.start);
    onParse({
      tabsCode: code,
      tabsReturn: this.buildParser.getReturnVar(),
      isView: this.buildParser.getView(),
      diagrams: this.model.serializeDiagram()
    });
    updateGasHistory();
    this.setState({ isProcessing: false });
  }

  findStart(): NodeModel {
    for (const node: NodeModel of Object.values(this.model.getNodes())) {
      if (node.name === 'Start') {
        return node;
      }
    }
    return null;
  }

  createDefaultNode(label: string, color: string, data: {}, isReturn: boolean) {
    const node: DefaultDataNodeModel = new DefaultDataNodeModel(
      label,
      color,
      data
    );
    node.addInPort(' ');
    if (!isReturn) {
      const outPort: DefaultPortModel = node.addOutPort(' ');
      outPort.setMaximumLinks(1);
    }
    return node;
  }

  selectNode(type: NodeType, desc: string, data: {}) {
    switch (type) {
      case 'event':
        return this.createDefaultNode(
          `Emit Event: ${desc}`,
          'rgb(0,192,0)',
          data,
          false
        );
      case 'entity':
        return this.createDefaultNode(
          `New Entity: ${desc}`,
          'rgb(100,100,0)',
          data,
          false
        );
      case 'transfer':
        return this.createDefaultNode(
          `Transfer: ${desc}`,
          'rgb(255,100,0)',
          data,
          false
        );
      case 'return':
        return this.createDefaultNode(
          `Return: ${desc}`,
          'rgb(192,255,0)',
          data,
          true
        );
      case 'conditional':
        return new DiamondNodeModel(`${desc}`, data);
      case 'assignment':
      default:
        return this.createDefaultNode(
          `Assignment: ${desc}`,
          'rgb(192,0,0)',
          data,
          false
        );
    }
  }

  addNode(info: string, data: {}) {
    const { type, points } = this.state;
    const node = this.selectNode(type, info, data);
    node.x = points.x;
    node.y = points.y;
    this.engine.getDiagramModel().addNode(node);
    this.forceUpdate();
  }

  render() {
    const {
      classes,
      varList,
      events,
      entities,
      settings,
      openDrawer,
      isConstructor,
      editHistory
    } = this.props;

    const { open, type } = this.state;
    this.resetListener(this.props);

    return (
      <Paper className={classes.paper}>
        <div className={classes.titleDiv}>
          <div className={classes.flexChild}>
            <div>
              <Tooltip title="Undo" classes={{ tooltip: classes.tooltipFont }}>
                <div className={classes.inlineBlock}>
                  <IconButton
                    onClick={() => editHistory.undo()}
                    aria-label="undo"
                    color="primary"
                    disabled={!editHistory.canUndo()}
                  >
                    <UndoIcon />
                  </IconButton>
                </div>
              </Tooltip>
              <Tooltip title="Redo" classes={{ tooltip: classes.tooltipFont }}>
                <div className={classes.inlineBlock}>
                  <IconButton
                    onClick={() => editHistory.redo()}
                    aria-label="redo"
                    color="primary"
                    disabled={!editHistory.canRedo()}
                  >
                    <RedoIcon />
                  </IconButton>
                </div>
              </Tooltip>
            </div>
            <CircularProgress
              className={this.state.isProcessing ? null : classes.invis}
            />
          </div>
          <Tooltip
            title="This is the main logic of the function, which will be executed when the checking phase has been successfully passed. Drag nodes from the left panel onto the diagram and connect them to create your logic for the function."
            classes={{ tooltip: classes.tooltipFont }}
          >
            <Typography variant="title" noWrap>
              Action Phase
            </Typography>
          </Tooltip>
          <Button
            onClick={openDrawer}
            className={classes.flexChild}
            variant="outlined"
            color="primary"
          >
            View Gas Usage
            <TrendingUpIcon className={classes.rightIcon} />
          </Button>
        </div>
        <DiagramModal
          open={open}
          close={() => {
            this.setState({ open: false });
          }}
          submit={(info, data) => this.addNode(info, data)}
          type={type}
          varList={varList}
          events={events}
          entities={entities}
          addNode={this.addNode}
          tooltipText={tooltips[type] || ''}
          bitsMode={settings.bitsMode}
        />
        <div className="body">
          <div className="header">
            <div className="title"> Nodes </div>
          </div>
          <div className="content">
            <TrayWidget>
              <Tooltip
                title={tooltips.assignment}
                classes={{ tooltip: classes.tooltipFont }}
              >
                <TrayItemWidget
                  model={{
                    type: 'assignment'
                  }}
                  name="Assignment Node"
                  color="rgb(192,0,0)"
                />
              </Tooltip>
              <Tooltip
                title={tooltips.event}
                classes={{ tooltip: classes.tooltipFont }}
              >
                <TrayItemWidget
                  model={{
                    type: 'event'
                  }}
                  name="Event Node"
                  color="rgb(0,192,0)"
                />
              </Tooltip>
              <Tooltip
                title={tooltips.entity}
                classes={{ tooltip: classes.tooltipFont }}
              >
                <TrayItemWidget
                  model={{
                    type: 'entity'
                  }}
                  name="New Entity Node"
                  color="rgb(100,100,0)"
                />
              </Tooltip>
              <Tooltip
                title={tooltips.transfer}
                classes={{ tooltip: classes.tooltipFont }}
              >
                <TrayItemWidget
                  model={{
                    type: 'transfer'
                  }}
                  name="Transfer Node"
                  color="rgb(255,100,0)"
                />
              </Tooltip>
              {!isConstructor && (
                <Tooltip
                  title={tooltips.return}
                  classes={{ tooltip: classes.tooltipFont }}
                >
                  <TrayItemWidget
                    model={{
                      type: 'return'
                    }}
                    name="Return Node"
                    color="rgb(192,255,0)"
                  />
                </Tooltip>
              )}
              <Tooltip
                title={tooltips.conditional}
                classes={{ tooltip: classes.tooltipFont }}
              >
                <TrayItemWidget
                  model={{
                    type: 'conditional'
                  }}
                  name="Conditional Node"
                  color="rgb(192,0,255)"
                />
              </Tooltip>
            </TrayWidget>
            <div
              className="diagram-layer"
              onDrop={event => {
                const data = JSON.parse(
                  event.dataTransfer.getData('storm-diagram-node')
                );
                this.setState({
                  open: true,
                  type: data.type,
                  points: this.engine.getRelativeMousePoint(event)
                });
                this.model.clearSelection();
              }}
              onDragOver={event => {
                event.preventDefault();
              }}
            >
              <DiagramWidget
                diagramEngine={this.engine}
                className="srd-canvas"
                allowLooseLinks={false}
              />
            </div>
          </div>
        </div>
      </Paper>
    );
  }
}

export default withStyles(styles, { withTheme: true })(BuildDiagram);
