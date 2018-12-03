import React from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Modal from '@material-ui/core/Modal';
import DoneIcon from '@material-ui/icons/Done';
import Button from '@material-ui/core/Button';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

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
        const {classes, open, close, type, varList} = this.props;

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
                            {this.getTypeFields(type, classes, varList, close)}
                        </Typography>
                    </div>
                </Modal>
            </div>
        );
    }

    getTypeFields(type, classes, varList, close) {
        switch (type) {
            case "arithmetic":
                return "Arithmetic placeholder";
            case "assignment":
                return "Assigment placeholder";
            case "event":
                return "Event placeholder";
            case "transfer":
                return "Transfer placeholder";
            case "return":
                return (
                    <FormControl className={classes.formControl}>
                        <InputLabel htmlFor="age-simple">Return Variable</InputLabel>
                        <Select
                            value={this.state.variableSelected}
                            onChange={(event) => this.setState({variableSelected: event.target.value})}
                            inputProps={{
                            name: 'var',
                            id: 'var'
                        }}>
                            <MenuItem value="">
                                <em>None</em>
                            </MenuItem>
                            {varList.map((element) => <MenuItem key={element} value={element}>{element}</MenuItem>)}
                        </Select>

                        <Button
                            variant="contained"
                            color="primary"
                            className={classes.button}
                            onClick={() => close(this.state.variableSelected)}>
                            Done
                            <DoneIcon className={classes.rightIcon}/>
                        </Button>
                    </FormControl>
                );
            case "conditional":
                return "If placeholder";
        }
    }
}

DiagramModal.propTypes = {
    classes: PropTypes.object.isRequired,
    open: PropTypes.bool.isRequired,
    close: PropTypes.func.isRequired,
    type: PropTypes.string.isRequired,
    varList: PropTypes.array
};

export default withStyles(styles, {withTheme: true})(DiagramModal);