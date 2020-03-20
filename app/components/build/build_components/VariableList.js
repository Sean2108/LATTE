// @flow

import * as React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import VariableRow from './VariableRow';
import type { VariableObj, Classes } from '../../../types';
import {
  getDuplicateIndices
} from '../build_utils/TypeCheckFormattingUtils';

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
  updateVariables: (Array<VariableObj>) => void,
  vars: Array<VariableObj>,
  tooltipText: string,
  bitsMode: boolean
};

class VariableList extends React.Component<Props> {
  render(): React.Node {
    const {
      classes,
      header,
      updateVariables,
      vars,
      tooltipText,
      bitsMode
    } = this.props;

    if (vars.length === 0) {
      vars.push({ name: '', displayName: '', type: 'uint', bits: '' });
    }

    const duplicateIndices = getDuplicateIndices(
      vars
        .filter((item: VariableObj): boolean => !!item.displayName)
        .map((item: VariableObj): string => item.displayName)
    );

    return (
      <Paper className={classes.paper}>
        <Tooltip title={tooltipText} classes={{ tooltip: classes.tooltipFont }}>
          <Typography variant="title" noWrap>
            {header}
          </Typography>
        </Tooltip>
        {vars.map((element: VariableObj, index: number): React.Node => (
          <VariableRow
            val={element}
            key={index}
            updateVariables={(val: VariableObj) => {
              const variables: Array<VariableObj> = [...vars];
              variables[index] = val;
              updateVariables(variables);
            }}
            bitsMode={bitsMode}
            isDuplicate={duplicateIndices.includes(index)}
          />
        ))}
        <Button
          variant="contained"
          color="primary"
          className={classes.button}
          onClick={(): void =>
            updateVariables([
              ...vars,
              { name: '', displayName: '', type: 'uint', bits: '' }
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
})(VariableList);
