import React from 'react';
import PropTypes from 'prop-types';
import {
  withStyles
} from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import {
  TrayWidget
} from "./diagram/TrayWidget";
import {
  TrayItemWidget
} from "./diagram/TrayItemWidget";
import {
  DiamondNodeModel
} from "./diagram/DiamondNodeModel";
import {
  DiamondNodeFactory
} from "./diagram/DiamondNodeFactory";
import {
  SimplePortFactory
} from "./diagram/SimplePortFactory";
import {
  DiamondPortModel
} from "./diagram/DiamondPortModel";
import {
  DiagramEngine,
  DiagramModel,
  DefaultNodeModel,
  LinkModel,
  DiagramWidget
} from "storm-react-diagrams";

const styles = theme => ({
  paper: {
    padding: theme.spacing.unit * 2,
    textAlign: 'center',
    color: 'theme.palette.text.secondary'
  },
});

class BuildDiagram extends React.Component {

  engine;

  constructor(props) {
    super(props);
    // setup the diagram engine
    this.engine = new DiagramEngine();
    this.engine.installDefaultFactories();
    this.engine.registerPortFactory(new SimplePortFactory("diamond", config => new DiamondPortModel()));
    this.engine.registerNodeFactory(new DiamondNodeFactory());

    // setup the diagram model
    const model = new DiagramModel();

    var start = new DefaultNodeModel("Start", "rgb(0,192,255)");
    var startOut = start.addOutPort(" ");
    start.setPosition(100, 100);

    //4) add the models to the root graph
    model.addAll(start);

    // load model into engine and render
    this.engine.setDiagramModel(model);
  }

  createDefaultNode(label, color, isReturn) {
    var node = new DefaultNodeModel(label, color);
    node.addInPort(" ");
    if (!isReturn) {
      node.addOutPort(" ");
    }
    return node;
  }

  selectNode(type) {
    switch (type) {
      case "arith":
        return this.createDefaultNode("Arithmetic", "rgb(192,255,0)", false);
      case "assign":
        return this.createDefaultNode("Assignment", "rgb(192,0,0)", false);
      case "event":
        return this.createDefaultNode("Event", "rgb(0,192,0)", false);
      case "transfer":
        return this.createDefaultNode("Transfer", "rgb(255,100,0)", false);
      case "return":
        return this.createDefaultNode("Return", "rgb(192,255,0)", true);
      case "if":
        return new DiamondNodeModel();
    }
    return null;
  }

  render() {
    const {
      classes,
      theme
    } = this.props;

    return ( <
      Paper className = {
        classes.paper
      } >
      <
      Typography variant = "title"
      noWrap > Action Phase < /Typography>

      <
      div className = "body" >
      <
      div className = "header" >
      <
      div className = "title" > Nodes < /div> < /
      div > <
      div className = "content" >
      <
      TrayWidget >
      <
      TrayItemWidget model = {
        {
          type: "arith"
        }
      }
      name = "Arthmetic Node"
      color = "rgb(192,255,0)" / >
      <
      TrayItemWidget model = {
        {
          type: "assign"
        }
      }
      name = "Assignment Node"
      color = "rgb(192,0,0)" / >
      <
      TrayItemWidget model = {
        {
          type: "event"
        }
      }
      name = "Event Node"
      color = "rgb(0,192,0)" / >
      <
      TrayItemWidget model = {
        {
          type: "transfer"
        }
      }
      name = "Transfer Node"
      color = "rgb(255,0,192)" / >
      <
      TrayItemWidget model = {
        {
          type: "return"
        }
      }
      name = "Return Node"
      color = "rgb(255,100,0)" / >
      <
      TrayItemWidget model = {
        {
          type: "if"
        }
      }
      name = "Conditional Node"
      color = "rgb(192,0,255)" / >
      <
      /TrayWidget> <
      div className = "diagram-layer"
      onDrop = {
        event => {
          var data = JSON.parse(event.dataTransfer.getData("storm-diagram-node"));
          var nodesCount = _.keys(
            this.engine
            .getDiagramModel()
            .getNodes()
          ).length;

          var node = this.selectNode(data.type);
          var points = this.engine.getRelativeMousePoint(event);
          node.x = points.x;
          node.y = points.y;
          this.engine
            .getDiagramModel()
            .addNode(node);
          this.forceUpdate();
        }
      }
      onDragOver = {
        event => {
          event.preventDefault();
        }
      } >
      <
      DiagramWidget diagramEngine = {
        this.engine
      }
      className = "srd-canvas"
      allowLooseLinks = {
        false
      }
      /> < /
      div > <
      /div> < /
      div >

      <
      /Paper>
    );
  }
}

BuildDiagram.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired
};

export default withStyles(styles, {
  withTheme: true
})(BuildDiagram);
