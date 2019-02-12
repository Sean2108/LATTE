import React from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Modal from '@material-ui/core/Modal';
import ReturnNode from './diagram_node_options/ReturnNode';
import AssignmentNode from './diagram_node_options/AssignmentNode';
import TransferNode from './diagram_node_options/TransferNode';
import ConditionalNode from './diagram_node_options/ConditionalNode';
import EventNode from './diagram_node_options/EventNode';

function getModalStyle() {
    return {top: '50%', left: '50%', transform: 'translate(-50%, -50%)'};
}

const styles = theme => ({
    paper: {
        position: 'absolute',
        width: theme.spacing.unit * 50,
        backgroundColor: theme.palette.background.paper,
        boxShadow: theme.shadows[5],
        padding: theme.spacing.unit * 4
    },
    fab: {
        margin: theme.spacing.unit
    },
    rightIcon: {
        marginLeft: theme.spacing.unit
    },
    formControl: {
        margin: theme.spacing.unit,
        minWidth: 120
    }
});

class DiagramModal extends React.Component {
    state = {
        variableSelected: ''
    }

    render() {
        const {classes, open, close, submit, type, varList, events} = this.props;

        return (
            <div>
                <Modal
                    aria-labelledby="simple-modal-title"
                    aria-describedby="simple-modal-description"
                    open={open}>
                    <div style={getModalStyle()} className={classes.paper}>
                        <Typography variant="title" id="modal-title">
                            New {type
                                .charAt(0)
                                .toUpperCase() + type.substr(1)}&nbsp; Node
                        </Typography>
                        <Typography variant="caption" id="modal-title">
                            {this.getTypeFields(type, classes, varList, events, close, submit)}
                        </Typography>
                    </div>
                </Modal>
            </div>
        );
    }

    getTypeFields(type, classes, varList, events, close, submit) {
        switch (type) {
            case "assignment":
                return (
                    <AssignmentNode close={close} submit={submit} varList={varList}/>
                );
            case "event":
                return (
                    <EventNode close={close} submit={submit} varList={events}/>
                );
            case "transfer":
                return (
                    <TransferNode close={close} submit={submit} varList={varList}/>
                );
            case "return":
                return (
                    <ReturnNode close={close} submit={submit} varList={varList}/>
                );
            case "conditional":
                return (
                    <ConditionalNode close={close} submit={submit} varList={varList}/>
                );
        }
    }
}

DiagramModal.propTypes = {
    classes: PropTypes.object.isRequired,
    open: PropTypes.bool.isRequired,
    close: PropTypes.func.isRequired,
    submit: PropTypes.func.isRequired,
    type: PropTypes.string.isRequired,
    varList: PropTypes.object,
    events: PropTypes.object
};

export default withStyles(styles, {withTheme: true})(DiagramModal);