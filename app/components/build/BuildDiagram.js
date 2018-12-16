import React from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import {TrayWidget} from "./diagram/TrayWidget";
import {TrayItemWidget} from "./diagram/TrayItemWidget";
import {DiamondNodeModel} from "./diagram/DiamondNodeModel";
import {DiamondNodeFactory} from "./diagram/DiamondNodeFactory";
import {SimplePortFactory} from "./diagram/SimplePortFactory";
import {DiamondPortModel} from "./diagram/DiamondPortModel";
import {DiagramEngine, DiagramModel, DefaultNodeModel, LinkModel, DiagramWidget} from "storm-react-diagrams";
import DiagramModal from './diagram/DiagramModal';

const styles = theme => ({
    paper: {
        padding: theme.spacing.unit * 2,
        textAlign: 'center',
        color: 'theme.palette.text.secondary'
    }
});

class BuildDiagram extends React.Component {
    state = {
        open: false,
        type: '',
        points: null
    }

    engine;

    constructor(props) {
        super(props);
        // setup the diagram engine
        this.engine = new DiagramEngine();
        this
            .engine
            .installDefaultFactories();
        this
            .engine
            .registerPortFactory(new SimplePortFactory("diamond", config => new DiamondPortModel()));
        this
            .engine
            .registerNodeFactory(new DiamondNodeFactory());

        // setup the diagram model
        const model = new DiagramModel();

        var start = new DefaultNodeModel("Start", "rgb(0,192,255)");
        var startOut = start.addOutPort(" ");
        start.setPosition(100, 100);

        //4) add the models to the root graph
        model.addAll(start);

        // load model into engine and render
        this
            .engine
            .setDiagramModel(model);
    }

    createDefaultNode(label, color, isReturn) {
        var node = new DefaultNodeModel(label, color);
        node.addInPort(" ");
        if (!isReturn) {
            node.addOutPort(" ");
        }
        return node;
    }

    selectNode(type, desc) {
        switch (type) {
            case "assignment":
                return this.createDefaultNode(`Assignment: ${desc}`, "rgb(192,0,0)", false);
            case "event":
                return this.createDefaultNode("Event", "rgb(0,192,0)", false);
            case "transfer":
                return this.createDefaultNode("Transfer", "rgb(255,100,0)", false);
            case "return":
                return this.createDefaultNode(`Return ${desc}`, "rgb(192,255,0)", true);
            case "conditional":
                return new DiamondNodeModel();
        }
        return null;
    }

    addNode(info) {
        let node = this.selectNode(this.state.type, info);
        node.x = this.state.points.x;
        node.y = this.state.points.y;
        this
            .engine
            .getDiagramModel()
            .addNode(node);
        this.forceUpdate();
    }

    render() {
        const {classes, theme, varList} = this.props;

        return (< Paper className = {
            classes.paper
        } > < Typography variant = "title" noWrap > Action Phase < /Typography>
        <DiagramModal open={this.state.open} close={() => {this.setState({open: false})}} submit={(info)=>this.addNode(info)} type={this.state.type} varList={varList} addNode={this.addNode}/ > < div className = "body" > < div className = "header" > < div className = "title" > Nodes < /div > < /div > < div className = "content" > < TrayWidget > 
        < TrayItemWidget model = {
            {
                type: "assignment"
            }
        }
        name = "Assignment Node" color = "rgb(192,0,0)" /> < TrayItemWidget model = {
            {
                type: "event"
            }
        }
        name = "Event Node" color = "rgb(0,192,0)" /> < TrayItemWidget model = {
            {
                type: "transfer"
            }
        }
        name = "Transfer Node" color = "rgb(255,0,192)" /> < TrayItemWidget model = {
            {
                type: "return"
            }
        }
        name = "Return Node" color = "rgb(255,100,0)" /> < TrayItemWidget model = {
            {
                type: "conditional"
            }
        }
        name = "Conditional Node" color = "rgb(192,0,255)" /> < /TrayWidget> <
      div className="diagram-layer"
                    onDrop={
                      event => {
                        var data = JSON.parse(event.dataTransfer.getData("storm-diagram-node"));
                        this.setState({open: true, type: data.type, points: this.engine.getRelativeMousePoint(event)});
                        // var nodesCount = _.keys(
                        //   this.engine
                        //     .getDiagramModel()
                        //     .getNodes()
                        // ).length;
                      }
                    }
                    onDragOver={
                      event => {
                        event.preventDefault();
                      }
                    } >
                    <
                      DiagramWidget diagramEngine={
                        this.engine
                      }
                      className="srd-canvas"
                      allowLooseLinks={
                        false
                      }
                    / > < /
      div > <
      /div > < /
      div >
              
      <
      /Paper >);
    }
}

BuildDiagram.propTypes = {
    classes: PropTypes.object.isRequired,
    theme: PropTypes.object.isRequired,
    varList: PropTypes.array.isRequired
};

export default withStyles(styles, {withTheme: true})(BuildDiagram);
