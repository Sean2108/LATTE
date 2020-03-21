// @flow

import * as React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Tooltip from '@material-ui/core/Tooltip';
import TrendingUpIcon from '@material-ui/icons/TrendingUp';
import UndoIcon from '@material-ui/icons/Undo';
import RedoIcon from '@material-ui/icons/Redo';
import {
  DiagramEngine,
  DiagramModel,
  DiagramWidget,
  PointModel,
  PortModel
} from 'storm-react-diagrams';
import { Button } from '@material-ui/core';
import TrayWidget from './diagram/TrayWidget';
import TrayItemWidget from './diagram/TrayItemWidget';
import DefaultDataNodeModel from './diagram/diagram_node_declarations/DefaultDataNode/DefaultDataNodeModel';
import DiagramModal from './diagram/DiagramModal';
import { objectEquals } from './build_utils/TypeCheckFormattingUtils';
import EditHistory from './build_utils/EditHistory';
import {
  findStart,
  getNewStartNode,
  selectNode
} from './build_utils/DiagramUtils';
import UndoRedoButton from './build_components/UndoRedoButton';
import type {
  StructLookupType,
  VariablesLookupType,
  Classes
} from '../../types';

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
  }
});

const tooltips: { [key: string]: string } = {
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

type Props = {
  classes: Classes,
  varList: VariablesLookupType,
  events: StructLookupType,
  entities: StructLookupType,
  diagram: {},
  settings: { bitsMode: boolean, indentation: string },
  openDrawer: () => void,
  isConstructor: boolean,
  editHistory: EditHistory,
  updateLoading: boolean => void, // eslint-disable-line react/no-unused-prop-types
  showWarning: string => void,
  engine: DiagramEngine,
  startNode: ?DefaultDataNodeModel, // eslint-disable-line react/no-unused-prop-types
  updateStartNode: (?DefaultDataNodeModel) => void,
  triggerParse: ({}) => void
};

type State = {
  open: boolean,
  type: NodeType,
  points: PointModel
};

class BuildDiagram extends React.Component<Props, State> {
  model: DiagramModel;

  state = {
    open: false,
    type: 'assignment',
    points: { x: null, y: null }
  };

  componentWillMount(): void {
    this.renderDiagram();
  }

  componentDidUpdate(prevProps: Props): void {
    if (!objectEquals(this.props.diagram, prevProps.diagram)) {
      this.renderDiagram();
    }
  }

  renderDiagram(): void {
    const { diagram, updateStartNode, engine } = this.props;
    this.model = new DiagramModel();
    let startNode: ?DefaultDataNodeModel = null;
    if (Object.entries(diagram).length > 0) {
      this.model.deSerializeDiagram(diagram, engine);
      startNode = findStart(this.model);
    }
    if (!startNode) {
      startNode = getNewStartNode();
      this.model.addAll(startNode);
    }
    this.resetListener();

    engine.setDiagramModel(this.model);
    updateStartNode(startNode);
  }

  resetListener() {
    this.model.clearListeners();
    this.model.addListener({
      linksUpdated: this.onLinksUpdated
    });
  }

  onLinksUpdated = (event: {
    link: { sourcePort: ?PortModel, targetPort: ?PortModel }
  }): void => {
    const { showWarning, updateLoading } = this.props;
    const { sourcePort, targetPort } = event.link;
    if (sourcePort && targetPort && !sourcePort.canLinkToPort(targetPort)) {
      showWarning(
        'Invalid link - you should connect an incoming port to an outgoing port! Conditional nodes: top and left ports are incoming, bottom and right are outgoing. Other nodes: left port is incoming, right is outgoing.'
      );
      updateLoading(false);
      return;
    }
    updateLoading(true);
    setTimeout(
      (): void => this.props.triggerParse(this.model.serializeDiagram()),
      5000
    );
  };

  addNode(info: string, data: {}): void {
    const { type, points } = this.state;
    const node = selectNode(type, info, data);
    node.x = points.x;
    node.y = points.y;
    this.props.engine.getDiagramModel().addNode(node);
    this.forceUpdate();
  }

  getTrayWidgetItems(): React.Node {
    const { classes, isConstructor } = this.props;
    const trayItemWidgetProperties: Array<{
      type: string,
      name: string,
      color: string,
      hide?: boolean
    }> = [
      {
        type: 'assignment',
        name: 'Assignment Node',
        color: 'rgb(192,0,0)'
      },
      {
        type: 'event',
        name: 'Event Node',
        color: 'rgb(0,192,0)'
      },
      {
        type: 'entity',
        name: 'New Entity Node',
        color: 'rgb(100,100,0)'
      },
      {
        type: 'transfer',
        name: 'Transfer Node',
        color: 'rgb(255,100,0)'
      },
      {
        type: 'return',
        name: 'Return Node',
        color: 'rgb(192,255,0)',
        hide: isConstructor
      },
      {
        type: 'conditional',
        name: 'Conditional Node',
        color: 'rgb(192,0,255)'
      }
    ];
    return trayItemWidgetProperties.map(
      ({ type, name, color, hide }): ?React.Node =>
        !hide ? (
          <Tooltip
            title={tooltips[type]}
            classes={{ tooltip: classes.tooltipFont }}
            key={type}
          >
            <TrayItemWidget
              model={{
                type
              }}
              name={name}
              color={color}
            />
          </Tooltip>
        ) : null
    );
  }

  render(): React.Node {
    const {
      classes,
      varList,
      events,
      entities,
      settings,
      openDrawer,
      editHistory,
      engine
    } = this.props;

    const { open, type } = this.state;
    this.resetListener();

    return (
      <Paper className={classes.paper}>
        <div className={classes.titleDiv}>
          <div className={classes.flexChild}>
            <div>
              <UndoRedoButton
                tooltipText="Undo"
                onClick={editHistory.undo}
                disabled={!editHistory.canUndo()}
              >
                <UndoIcon />
              </UndoRedoButton>
              <UndoRedoButton
                tooltipText="Redo"
                onClick={editHistory.redo}
                disabled={!editHistory.canRedo()}
              >
                <RedoIcon />
              </UndoRedoButton>
            </div>
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
            <TrayWidget>{this.getTrayWidgetItems()}</TrayWidget>
            <div
              className="diagram-layer"
              onDrop={event => {
                const data = JSON.parse(
                  event.dataTransfer.getData('storm-diagram-node')
                );
                this.setState({
                  open: true,
                  type: data.type,
                  points: engine.getRelativeMousePoint(event)
                });
                this.model.clearSelection();
              }}
              onDragOver={event => {
                event.preventDefault();
              }}
            >
              <DiagramWidget
                diagramEngine={engine}
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
