import React from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import DoneIcon from '@material-ui/icons/Done';
import CancelIcon from '@material-ui/icons/Cancel';
import Button from '@material-ui/core/Button';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import RawRequireRow from '../../RawRequireRow';

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

class ConditionalNode extends React.Component {
    state = {	
        comp: '==',	
        var1: '',	
        var2: '',	
    }

    render() {
        const {classes, close, submit, varList} = this.props;

        return (
            <FormControl className={classes.formControl}>
                < RawRequireRow
                vars = {
                    varList
                }
                    showMessage = {false}
                    updateRequire = {(state) => this.setState(state)}
                    require = {this.state}
                />
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
                        onClick={() => {close(); submit(`${this.state.var1} ${this.state.comp} ${this.state.var2}`)}}>
                        Done
                        <DoneIcon/>
                    </Button>
                </div>
            </FormControl>
        );
    }
}

ConditionalNode.propTypes = {
    classes: PropTypes.object.isRequired,
    close: PropTypes.func.isRequired,
    submit: PropTypes.func.isRequired,
    varList: PropTypes.object
};

export default withStyles(styles, {withTheme: true})(ConditionalNode);