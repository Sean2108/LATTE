import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import { TrayWidget } from './diagram/TrayWidget';
import { TrayItemWidget } from './diagram/TrayItemWidget';
import { DiamondNodeModel } from './diagram/diagram_node_declarations/DiamondNode/DiamondNodeModel';
import { DiamondNodeFactory } from './diagram/diagram_node_declarations/DiamondNode/DiamondNodeFactory';
import { SimplePortFactory } from './diagram/SimplePortFactory';
import { DiamondPortModel } from './diagram/diagram_node_declarations/DiamondNode/DiamondPortModel';
import { DefaultDataNodeModel } from './diagram/diagram_node_declarations/DefaultDataNode/DefaultDataNodeModel';
import { DefaultDataNodeFactory } from './diagram/diagram_node_declarations/DefaultDataNode/DefaultDataNodeFactory';
import {
  DiagramEngine,
  DiagramModel,
  LinkModel,
  DiagramWidget
} from 'storm-react-diagrams';
import DiagramModal from './diagram/DiagramModal';
import { BuildParser } from './BuildParser';
import Tooltip from '@material-ui/core/Tooltip';
import { Button } from '@material-ui/core';
import TrendingUpIcon from '@material-ui/icons/TrendingUp';

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
  leftInvis: {
    visibility: 'hidden'
  },
  rightIcon: {
    marginLeft: theme.spacing.unit
  }
});

class BuildDiagram extends React.Component {
  state = {
    open: false,
    type: '',
    points: null
  };

  engine;
  start;
  model;
  buildParser;

  componentWillMount() {
    this.engine = new DiagramEngine();
    this.engine.installDefaultFactories();
    this.engine.registerPortFactory(
      new SimplePortFactory('diamond', config => new DiamondPortModel())
    );
    this.engine.registerNodeFactory(new DiamondNodeFactory());
    this.engine.registerNodeFactory(new DefaultDataNodeFactory());

    this.model = new DiagramModel();
    if (Object.entries(this.props.diagram).length > 0) {
      this.model.deSerializeDiagram(this.props.diagram, this.engine);
      this.start = this.findStart();
    }
    if (!this.start) {
      this.start = new DefaultDataNodeModel('Start', 'rgb(0,192,255)');
      var startOut = this.start.addOutPort(' ');
      startOut.setMaximumLinks(1);
      this.start.setPosition(100, 100);
      this.model.addAll(this.start);
    }
    this.buildParser = new BuildParser(this.props.onVariablesChange);
    this.model.addListener({
      linksUpdated: () => {
        setTimeout(() => {
          this.buildParser.reset(
            this.props.varList,
            this.props.functionParams,
            this.props.events,
            this.props.entities,
            this.props.bitsMode
          );
          let code = this.buildParser.parse(this.start);
          this.props.onChangeLogic(code);
          this.props.onChangeReturn(this.buildParser.getReturnVar());
          this.props.onChangeView(this.buildParser.getView());
          this.props.updateDiagram(this.model.serializeDiagram());
        }, 5000);
      }
    });

    this.engine.setDiagramModel(this.model);
  }

  findStart() {
    for (let node of Object.values(this.model.getNodes())) {
      if (node.name === 'Start') {
        return node;
      }
    }
    return null;
  }

  createDefaultNode(label, color, data, isReturn) {
    var node = new DefaultDataNodeModel(label, color, data);
    node.addInPort(' ');
    if (!isReturn) {
      let outPort = node.addOutPort(' ');
      outPort.setMaximumLinks(1);
    }
    return node;
  }

  selectNode(type, desc, data) {
    switch (type) {
      case 'assignment':
        return this.createDefaultNode(
          `Assignment: ${desc}`,
          'rgb(192,0,0)',
          data,
          false
        );
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
    }
    return null;
  }

  addNode(info, data) {
    let node = this.selectNode(this.state.type, info, data);
    node.x = this.state.points.x;
    node.y = this.state.points.y;
    this.engine.getDiagramModel().addNode(node);
    this.forceUpdate();
  }

  render() {
    const {
      classes,
      theme,
      varList,
      events,
      entities,
      bitsMode,
      openDrawer
    } = this.props;

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

    return (
      <Paper className={classes.paper}>
        <Tooltip
          title="This is the main logic of the function, which will be executed when the checking phase has been successfully passed. Drag nodes from the left panel onto the diagram and connect them to create your logic for the function."
          classes={{ tooltip: classes.tooltipFont }}
        >
          <div className={classes.titleDiv}>
            <Button
              onClick={openDrawer}
              variant="contained"
              color="primary"
              className={classes.leftInvis}
            >
              View Gas Usage
              <TrendingUpIcon className={classes.rightIcon} />
            </Button>
            <Typography variant="title" noWrap>
              Action Phase
            </Typography>
            <Button onClick={openDrawer} variant="outlined" color="primary">
              View Gas Usage
              <TrendingUpIcon className={classes.rightIcon} />
            </Button>
          </div>
        </Tooltip>
        <DiagramModal
          open={this.state.open}
          close={() => {
            this.setState({ open: false });
          }}
          submit={(info, data) => this.addNode(info, data)}
          type={this.state.type}
          varList={varList}
          events={events}
          entities={entities}
          addNode={this.addNode}
          tooltipText={tooltips[this.state.type] || ''}
          bitsMode={bitsMode}
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
                var data = JSON.parse(
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

BuildDiagram.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  varList: PropTypes.object.isRequired,
  functionParams: PropTypes.object.isRequired,
  events: PropTypes.object.isRequired,
  entities: PropTypes.object.isRequired,
  onChangeLogic: PropTypes.func.isRequired,
  onVariablesChange: PropTypes.func.isRequired,
  onChangeReturn: PropTypes.func.isRequired,
  diagram: PropTypes.object.isRequired,
  onChangeView: PropTypes.func,
  updateDiagram: PropTypes.func.isRequired,
  bitsMode: PropTypes.bool.isRequired,
  openDrawer: PropTypes.func.isRequired
};

export default withStyles(styles, { withTheme: true })(BuildDiagram);
