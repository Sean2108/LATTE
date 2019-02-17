import React from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import StructList from './BoxStructList';
import DefaultBuildTab from './DefaultBuildTab';
import Popover from '@material-ui/core/Popover';
import AddIcon from '@material-ui/icons/Add';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import InitialStateTab from './InitialStateTab';

function TabContainer(props) {
    return (
    < Typography component = "div" style = {
        {
            'paddingTop': 24,
            'paddingBottom': 24
        }
    } > {
        props.children
    } < /Typography>
    );
}

TabContainer.propTypes = {
    children: PropTypes.node.isRequired,
};

const styles = theme => ({
    tabs: {
        flexGrow: 1,
        width: '97%',
        backgroundColor: theme.palette.background.paper,
    },
    textField: {
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit
    },
    button: {
        margin: 0
    },
    rightIcon: {
        marginLeft: theme.spacing.unit
    },
});

class BuildTabs extends React.Component {
        state = {
            value: 0,
            constructorParams: [],
            entities: {},
            addTabPopoverAnchor: null,
            popoverContent: ''
        };

        handleChange = (event, value) => {
            this.setState({
                value
            });
        };

        handleOnChange = (newState, i, state) => {
            let tabsState = [...this.props.buildState[state]];
            tabsState[i] = newState;
            this.props.onTabsChange({[state]: tabsState});
        }

        handleChangeParams = (newState, i) => {
            this.handleOnChange(newState, i, 'tabsParams');
            if (i == 0) {
                let newParams = newState.map(param => {return {...param, value: ''}});
                this.props.onTabsChange({constructorParams: newParams});
            }
        }

        render() {
            const {
                classes,
                variables,
                onTabsChange,
                buildState
            } = this.props;
            const {
                value
            } = this.state;
            console.log(buildState);
            return ( <
                div className = {
                    classes.tabs
                } >
                <
                AppBar position = "static"
                color = "default" >
                <
                Tabs value = {
                    value
                }
                onChange = {
                    (event, value) => {
                        if (value !== buildState.tabs.length) {
                            this.handleChange(event, value);
                        }
                    }
                }
                indicatorColor = "primary"
                textColor = "primary"
                scrollable scrollButtons = "auto" >
                {buildState.tabs.map((label) => <Tab label={label} key={label}/>)}
                <Tab onClick={(event) => this.setState({addTabPopoverAnchor: event.currentTarget})} label='+'/> < /Tabs> < /AppBar > {
        value === 0 && < TabContainer > 
        <InitialStateTab 
        entities={this.state.entities}
        events={buildState.events}
        updateEntities={(entities) => this.setState({...this.state, entities : entities})}
        updateEvents={(events) => onTabsChange({...buildState, events : events})}
        params={buildState.constructorParams}
        updateParams={(params) => {
            this.setState({constructorParams: params}); 
            this.props.onTabsChange({constructorParams: params
            })}}/>
        < /TabContainer>} 
        {[...Array(buildState.tabs.length - 1).keys()].map((i) => 
                        value === i + 1 && <TabContainer key = {i}>
                        <DefaultBuildTab varList = {variables} events = {buildState.events}
                        onChangeLogic = {(newCode) => this.handleOnChange(newCode, i, 'tabsCode')}
                        onChangeParams = {(newParams) => this.handleChangeParams(newParams, i)}
                        onChangeReturn = {(newReturn) => this.handleOnChange(newReturn, i, 'tabsReturn')}
                        onChangeRequire = {(newRequire) => this.handleOnChange(newRequire, i, 'tabsRequire')}
                        onVariablesChange = {(variables) => onTabsChange({variables: variables})}
                        params = {buildState.tabsParams[i]}
                        requires = {buildState.tabsRequire[i]}
                        diagram = {buildState.diagrams[i]}
                        updateDiagram = {(diagram) => this.handleOnChange(diagram, i, 'diagrams')} />
                        </TabContainer>
                    )}
        <Popover
          id="simple-popper"
          open={Boolean(this.state.addTabPopoverAnchor)}
          anchorEl={this.state.addTabPopoverAnchor}
          onClose={() => this.setState({addTabPopoverAnchor: null})}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
        >
          
          < TextField id = "standard-name"
            label = "Function Name"
            className = {
                classes.textField
            }
            onChange = {
                (event) => this.setState({popoverContent: event.target.value})
            }
            value = {
                this.state.popoverContent
            }
            margin = "normal" / > < Button variant = "contained" color = "primary" className = {
                classes.button
            }
            onClick = {
                () => {
                    if (this.state.popoverContent && !buildState.tabs.map(tab => tab.toLowerCase()).includes(this.state.popoverContent.toLowerCase())) {
                        let newTabsState = {tabs: [...buildState.tabs, this.state.popoverContent], tabsCode: [...buildState.tabsCode, ''], 
                        tabsParams: [...buildState.tabsParams, []], tabsRequire: [...buildState.tabsRequire, []], diagrams: [...buildState.diagrams, {}]};
                        this.setState({...this.state, popoverContent: '', addTabPopoverAnchor: null});
                        onTabsChange(newTabsState);
                    }
                }
            } > Add < AddIcon className = {
                classes.rightIcon
            } /> < /Button>

        </Popover>
     < /div >);
    }
}

BuildTabs.propTypes = {
    classes: PropTypes.object.isRequired,
    variables: PropTypes.object.isRequired,
    onTabsChange: PropTypes.func.isRequired,
    buildState: PropTypes.object.isRequired
};

export default withStyles(styles)(BuildTabs);
