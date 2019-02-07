import React from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import StructList from './StructList';
import DefaultBuildTab from './DefaultBuildTab';
import Popover from '@material-ui/core/Popover';
import AddIcon from '@material-ui/icons/Add';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

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
            variables: [],
            constructorParams: [],
            entities: {},
            events: {},
            tabs: [],
            tabsCode : [],
            addTabPopoverAnchor: null,
            popoverContent: ''
        };

        handleChange = (event, value) => {
            this.setState({
                value
            });
        };

        componentWillMount() {
            let newTabsState = {tabs: ['Global State', 'Initial State'], tabsCode: ['']};
            this.setState(newTabsState);
            this.props.onTabsChange(newTabsState);
        }

        render() {
            const {
                classes,
                onTabsChange
            } = this.props;
            const {
                value
            } = this.state;

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
                        if (value !== this.state.tabs.length) {
                            this.handleChange(event, value);
                        }
                    }
                }
                indicatorColor = "primary"
                textColor = "primary"
                scrollable scrollButtons = "auto" >
                {this.state.tabs.map((label) => <Tab label={label} key={label}/>)}
                <Tab onClick={(event) => this.setState({addTabPopoverAnchor: event.currentTarget})} label='+'/> < /Tabs> < /AppBar > {
        value === 0 && < TabContainer > < StructList header = {
            "Entities"
        } updateVariables = {(entities) => this.setState({...this.state, entities : entities})}
        initialVars = {this.state.entities}/ > <br/> < StructList header = {
            "Events"
        } updateVariables = {(events) => this.setState({...this.state, events : events})}
        initialVars = {this.state.events}/ > <br/>
        < /TabContainer>} 
        {[...Array(this.state.tabs.length - 1).keys()].map((i) => 
                        value === i + 1 && <TabContainer key = {i}>
                        <DefaultBuildTab varList = {this.state.variables} events = {this.state.events}
                        onChangeLogic = {(newCode) => {
                            let tabsCode = this.state.tabsCode;
                            tabsCode[i] = newCode;
                            this.setState({tabsCode: tabsCode});
                            onTabsChange({tabsCode: tabsCode});
                        }} />
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
                    if (this.state.popoverContent && !this.state.tabs.map(tab => tab.toLowerCase()).includes(this.state.popoverContent.toLowerCase())) {
                        let newTabsState = {tabs: [...this.state.tabs, this.state.popoverContent], tabsCode: [...this.state.tabsCode, '']};
                        this.setState({newTabsState, popoverContent: '', addTabPopoverAnchor: null});
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
    onTabsChange: PropTypes.func.isRequired
};

export default withStyles(styles)(BuildTabs);
