import React from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import DoneIcon from '@material-ui/icons/Done';
import CancelIcon from '@material-ui/icons/Cancel';
import Button from '@material-ui/core/Button';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import { Typography } from '@material-ui/core';

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
        display: 'flex',
        'justify-content': 'flex-end'
    },
    formControl: {
        margin: theme.spacing.unit,
        minWidth: 400
    },
    button: {
        margin: theme.spacing.unit
    },
    inline: {
        display: 'flex',
        'justify-content': 'space-evenly',
        'text-align': 'center'
    },
    equals: {
        margin: 'auto'
    },
    varSelect: {
        margin: theme.spacing.unit,
        minWidth: 150
    }
});

class ReturnNode extends React.Component {
    state = {
        variableSelected: '',
        assignedVal: ''
    }

    render() {
        const {classes, close, submit, varList} = this.props;

        return (
            <FormControl className={classes.formControl}>
                <div className={classes.inline}>
                <InputLabel htmlFor="var">Variable Name</InputLabel>
                <Select
                    className={classes.varSelect}
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
                <Typography className={classes.equals}> = </Typography>
                <
                TextField id = "standard-name"
                label = "Assigned Value"
                className = {
                    classes.textField
                }
                onChange = {
                    (event) => this.setState({assignedVal: event.target.value})
                }
                value = {this.state.assignedVal}
                margin = "normal" / > 
                </div>
                <br/>

                <div className={classes.rightIcon}>
                    <Button
                        variant="contained"
                        color="primary"
                        className={classes.button}
                        onClick={close}>
                        Cancel
                        <CancelIcon />
                    </Button>

                    <Button
                        variant="contained"
                        color="primary"
                        className={classes.button}
                        onClick={() => {close(); submit(`${this.state.variableSelected} = ${this.state.assignedVal};`)}}>
                        Done
                        <DoneIcon/>
                    </Button>
                </div>
            </FormControl>
        );
    }
}

ReturnNode.propTypes = {
    classes: PropTypes.object.isRequired,
    close: PropTypes.func.isRequired,
    submit: PropTypes.func.isRequired,
    varList: PropTypes.array
};

export default withStyles(styles, {withTheme: true})(ReturnNode);