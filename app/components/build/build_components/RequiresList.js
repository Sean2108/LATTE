import * as React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import RequireRow from './RequireRow';
import BuildParser from '../parsers/BuildParser';
import {RequireObj, Classes} from '../../../types';

const styles = theme => ({
  paper: {
    padding: theme.spacing.unit * 2,
    textAlign: 'center',
    color: theme.palette.text.secondary,
    maxHeight: '40vw',
    overflow: 'auto'
  },
  button: {
    margin: theme.spacing.unit
  },
  tooltipFont: {
    fontSize: 14
  }
});

type Props = {
  classes: Classes,
  header: string,
  vars: {},
  onChangeRequire: (Array<RequireObj>) => void,
  requires: Array<RequireObj>,
  tooltipText: string,
  entities: {}
};

class RequiresList extends React.Component<Props> {
  buildParser: BuildParser = new BuildParser(null);

  render(): React.Node {
    const {
      classes,
      header,
      vars,
      onChangeRequire,
      requires,
      tooltipText,
      entities
    } = this.props;

    if (requires.length === 0) {
      requires.push({
        var1: '',
        displayVar1: '',
        comp: '==',
        var2: '',
        displayVar2: '',
        requireMessage: ''
      });
    }

    return (
      <Paper className={classes.paper}>
        <Tooltip title={tooltipText} classes={{ tooltip: classes.tooltipFont }}>
          <Typography variant="title" noWrap>
            {header}
          </Typography>
        </Tooltip>
        {requires.map((element, index) => (
          <RequireRow
            require={element}
            key={index}
            showMessage
            updateRequire={(val: RequireObj): void => {
              const requiresCopy: Array<RequireObj> = [...requires];
              requiresCopy[index] = val;
              onChangeRequire(requiresCopy);
            }}
            variables={vars}
            structList={entities}
          />
        ))}
        <Button
          variant="contained"
          color="primary"
          className={classes.button}
          onClick={(): void =>
            onChangeRequire([
              ...requires,
              {
                var1: '',
                displayVar1: '',
                comp: '==',
                var2: '',
                displayVar2: '',
                requireMessage: ''
              }
            ])
          }
        >
          +
        </Button>
        <br />
      </Paper>
    );
  }
}

export default withStyles(styles, {
  withTheme: true
})(RequiresList);
