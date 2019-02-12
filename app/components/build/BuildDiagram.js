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
        points: null,
        returnType: ''
    }

    engine;
    start;
    varList;
    variables;

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
        this.start = new DefaultNodeModel("Start", "rgb(0,192,255)");
        var startOut = this.start.addOutPort(" ");
        startOut.setMaximumLinks(1);
        this.start.setPosition(100, 100);

        //4) add the models to the root graph
        model.addAll(this.start);
        model.addListener({
            linksUpdated: () => {
                setTimeout(() => {
                    this.variables = {};
                    let code = this.traverseNextNode(this.start);
                    this.props.onChangeLogic(code);
                }, 5000);
            }
       });

        // load model into engine and render
        this
            .engine
            .setDiagramModel(model);
    }

    createDefaultNode(label, color, isReturn) {
        var node = new DefaultNodeModel(label, color);
        node.addInPort(" ");
        if (!isReturn) {
            let outPort = node.addOutPort(" ");
            outPort.setMaximumLinks(1);
        }
        return node;
    }

    selectNode(type, desc) {
        switch (type) {
            case "assignment":
                return this.createDefaultNode(`Assignment: ${desc}`, "rgb(192,0,0)", false);
            case "event":
                return this.createDefaultNode(`Emit Event: ${desc}`, "rgb(0,192,0)", false);
            case "transfer":
                return this.createDefaultNode(`Transfer: ${desc}`, "rgb(255,100,0)", false);
            case "return":
                return this.createDefaultNode(`Return: ${desc}`, "rgb(192,255,0)", true);
            case "conditional":
                return new DiamondNodeModel(`${desc}`);
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

    traverseNextNode(node) {
        if (node instanceof DiamondNodeModel) {
            let falseNextNode = this.getNextNode(node.outPortFalse);
            let trueNextNode = this.getNextNode(node.outPortTrue);
            if (!falseNextNode || !trueNextNode) {
                return '';
            }
            let trueWhileCode = this.generateCodeForCycle(node, true);
            if (trueWhileCode) {
                return `while (${this.parseNode('Compare: ' + node.name)}) {\n${trueWhileCode}}\n${this.traverseNextNode(falseNextNode)}`;
            }
            let falseWhileCode = this.generateCodeForCycle(node, false);
            if (falseWhileCode) {
                return `while (!(${this.parseNode('Compare: ' + node.name)})) {\n${falseWhileCode}}\n${this.traverseNextNode(trueNextNode)}`;
            }
            return `if (${this.parseNode('Compare: ' + node.name)}) {\n${this.traverseNextNode(trueNextNode)}} else {\n${this.traverseNextNode(falseNextNode)}}\n`;
        }
        if (!node) {
            return '';
        }
        let curNodeCode = node.name === 'Start' ? '' : this.parseNode(node.name) + '\n';
        let nextNode = this.getNextNodeForDefaultNode(node);
        if (!nextNode) {
            return curNodeCode;
        }
        return curNodeCode + this.traverseNextNode(nextNode);
    }
    
    getNextNode(outPort) {
        let links = Object.values(outPort.getLinks());
        if (links.length === 0 || !links[0].targetPort) {
            return null;
        }
        else {
            return links[0].targetPort.getNode();
        }
    }

    getNextNodeForDefaultNode(node) {
        if (node.getOutPorts().length === 0) {
            return null;
        }
        return this.getNextNode(node.getOutPorts()[0]);
    }

    parseNode(nodeCode) {
        let type, code, lhs, rhs, parsedLhs, parsedRhs;
        [type, code] = nodeCode.split(': ');
        switch (type) {
            case "Assignment":
                [lhs, rhs] = code.split(' = ');
                parsedLhs = this.parseVariable(lhs);
                parsedRhs = this.parseVariable(rhs);
                if (parsedLhs.type === 'var') {
                    this.variables[parsedLhs.name] = parsedRhs.type;
                    this.props.onVariablesChange(this.variables);
                    return `${parsedLhs.name} = ${parsedRhs.name};`;
                }
                if (parsedLhs.type !== parsedRhs.type) {
                    alert('invalid assignment');
                }
                return `${parsedLhs.name} = ${parsedRhs.name};`;
            case "Emit Event":
                return `emit ${code};`
            case "Transfer":
                [lhs, rhs] = code.split(' to ');
                parsedLhs = this.parseVariable(lhs);
                parsedRhs = this.parseVariable(rhs);
                if (parsedLhs.type !== 'int') {
                    alert('value should be an integer');
                }
                if (parsedRhs.type !== 'address') {
                    alert('transfer target should be an address');
                }
                return `${parsedRhs.name}.transfer(${parsedLhs.name});`;
            case "Return":
                let returnVar = this.parseVariable(code);
                this.setState({returnType: returnVar.type});
                return `return ${returnVar.name};`;
            case "Compare":
                let comp;
                [lhs, comp, rhs] = code.split(/ ([><=]=|>|<) /);
                parsedLhs = this.parseVariable(lhs);
                parsedRhs = this.parseVariable(rhs);
                if (parsedLhs.type !== parsedRhs.type) {
                    alert('comparing different types');
                }
                return `${parsedLhs.name} ${comp} ${parsedRhs.name}`;
        }
        return '';
    }

    parseVariable(variable) {
        let variables = {...this.props.varList, ...this.variables};
        if (variable[0] === '\"' && variable[variable.length - 1] === '\"' || variable[0] === "\'" && variable[variable.length - 1] === "\'") {
            return {name: variable, type: 'string'};
        }
        if (!isNaN(variable)) {
            return {name: variable.trim(), type: 'int'};
        }
        for (let operator of ['*', '/', '+', '-']) {
            if (variable.indexOf(operator) > 0) {
                let lhs, rhs;
                [lhs, rhs] = variable.split(operator);
                let parsedLhs = this.parseVariable(lhs);
                let parsedRhs = this.parseVariable(rhs);
                if (parsedLhs.type !== parsedRhs.type) {
                    alert('invalid types');
                    return {name: variable, type: 'invalid'};
                }
                if (parsedLhs === 'string' && operator !== '+') {
                    let varName = `${parsedLhs.name}_${parsedRhs.name}`;
                    if (!(varName in variables)) {
                        return {name: varName, type: 'var'};
                    }
                    return {name: varName, type: variables[varName]};
                }
                return {name: `${parsedLhs.name} ${operator} ${parsedRhs.name}`, type: parsedLhs.type};
            }
        }
        let varName = variable.toLowerCase().trim().replace(/\s/g, '_');
        if (varName === 'messagesender' || varName === 'msgsender' || varName === 'sender') {
            return {name: 'msg.sender', type: 'address'};
        }
        if (varName === 'messagevalue' || varName === 'msgvalue' || varName === 'value') {
            return {name: 'msg.value', type: 'int'};
        }
        if (!(varName in variables)) {
            return {name: varName, type: 'var'};
        }
        return {name: varName, type: variables[varName]};
    }

    // TODO: allow traversal for diamond nodes
    generateCodeForCycle(start, isTrue) {
        let outPort = isTrue ? start.outPortTrue : start.outPortFalse;
        let node = this.getNextNode(outPort);
        let code = '';
        while (node) {
            if (node === start) {
                return code;
            }
            code += this.parseNode(node.name) + '\n';
            node = this.getNextNodeForDefaultNode(node);
        }
        return null;
    }

    render() {
        const {classes, theme, varList, events} = this.props;

        return (< Paper className = {
            classes.paper
        } > < Typography variant = "title" noWrap > Action Phase < /Typography>
        <DiagramModal open={this.state.open} close={() => {this.setState({open: false})}} submit={(info)=>this.addNode(info)} type={this.state.type} varList={varList} events={events} addNode={this.addNode}/ > < div className = "body" > < div className = "header" > < div className = "title" > Nodes < /div > < /div > < div className = "content" > < TrayWidget > 
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
    varList: PropTypes.object.isRequired,
    events: PropTypes.object.isRequired,
    onChangeLogic: PropTypes.func.isRequired,
    onVariablesChange: PropTypes.func.isRequired
};

export default withStyles(styles, {withTheme: true})(BuildDiagram);
