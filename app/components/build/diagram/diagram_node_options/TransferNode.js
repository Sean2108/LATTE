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
    }
});

class TransferNode extends React.Component {
    state = {
        variableSelected: ''
    }

    render() {
        const {classes, close, submit, varList} = this.props;

        return (
            <FormControl className={classes.formControl}>
                <InputLabel htmlFor="var">Transfer to</InputLabel>
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
                        onClick={() => {close(); submit(this.state.variableSelected)}}>
                        Done
                        <DoneIcon/>
                    </Button>
                </div>
            </FormControl>
        );
    }
}

TransferNode.propTypes = {
    classes: PropTypes.object.isRequired,
    close: PropTypes.func.isRequired,
    submit: PropTypes.func.isRequired,
    varList: PropTypes.array
};

export default withStyles(styles, {withTheme: true})(TransferNode);