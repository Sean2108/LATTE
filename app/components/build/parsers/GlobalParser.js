// @flow
import BuildParser from './BuildParser';
import DefaultDataNodeModel from '../diagram/diagram_node_declarations/DefaultDataNode/DefaultDataNodeModel';
import Web3Utils from '../build_utils/Web3Utils';
import EditHistory from '../build_utils/EditHistory';
import type {
  VariablesLookupType,
  VariableObj,
  BuildState,
  SettingsObj
} from '../../../types';

type SingleTabUpdate = {
  tabsCode: string,
  tabsReturn: string,
  isView: boolean
};

type TabUpdates = {
  tabsCode: Array<string>,
  tabsReturn: Array<string>,
  isView: Array<boolean>
};

type Props = {
  variables: VariablesLookupType,
  startNodes: Array<?DefaultDataNodeModel>,
  onTabsChange: ({}, ?({}) => void) => void,
  settings: SettingsObj,
  updateLoading: boolean => void,
  buildState: BuildState
};

export default class GlobalParser {
  buildParser: BuildParser;

  updateBuildError: string => void;

  constructor(
    onVariablesChange: VariablesLookupType => void,
    updateBuildError: string => void
  ): void {
    this.buildParser = new BuildParser(onVariablesChange, updateBuildError);
    this.updateBuildError = updateBuildError;
  }

  parseStartNode = (
    startNode: ?DefaultDataNodeModel,
    functionParams: VariablesLookupType,
    props: Props
  ): SingleTabUpdate => {
    if (!startNode) {
      return {
        tabsCode: '',
        tabsReturn: '',
        isView: true
      };
    }
    const { variables, buildState, settings } = props;
    const { events, entities } = buildState;
    this.buildParser.reset(
      variables,
      functionParams,
      events,
      entities,
      settings
    );

    const code: string = this.buildParser.parse(startNode);
    return {
      tabsCode: code,
      tabsReturn: this.buildParser.getReturnVar(),
      isView: this.buildParser.getView()
    };
  };

  parse = (
    props: Props,
    web3Utils: Web3Utils,
    editHistory: EditHistory
  ): void => {
    const {
      startNodes,
      onTabsChange,
      settings,
      updateLoading,
      buildState
    } = props;
    const functionParamsArr: Array<VariablesLookupType> = buildState.tabsParams.map(
      (params: Array<VariableObj>): VariablesLookupType =>
        this.flattenParamsToObject(params, settings.bitsMode)
    );
    const changedTabState: TabUpdates = startNodes
      .map((startNode: ?DefaultDataNodeModel, index: number): SingleTabUpdate =>
        this.parseStartNode(startNode, functionParamsArr[index], props)
      )
      .reduce(
        (result: TabUpdates, current: SingleTabUpdate): TabUpdates => ({
          tabsCode: [...result.tabsCode, current.tabsCode],
          tabsReturn: [...result.tabsReturn, current.tabsReturn],
          isView: [...result.isView, current.isView]
        }),
        {
          tabsCode: [],
          tabsReturn: [],
          isView: []
        }
      );
    onTabsChange(
      {
        ...changedTabState,
        gasHistory: this.getGasHistory(buildState, settings, web3Utils)
      },
      editHistory.addNode
    );
    updateLoading(false);
  };

  getGasHistory = (
    buildState: BuildState,
    settings: SettingsObj,
    web3Utils: Web3Utils
  ): Array<number> => {
    const history: Array<number> = buildState.gasHistory;
    web3Utils.getGasUsage(buildState, settings, history, this.updateBuildError);
    return history;
  };

  flattenParamsToObject = (
    params: Array<VariableObj>,
    bitsMode: boolean
  ): VariablesLookupType =>
    params
      .filter((element: VariableObj): boolean => !!element.name)
      .reduce(
        (
          resultParam: VariablesLookupType,
          currentObject: VariableObj
        ): VariablesLookupType => {
          const result = resultParam;
          if (bitsMode && currentObject.bits) {
            if (currentObject.type === 'string') {
              result[currentObject.name] = `bytes${currentObject.bits}`;
            } else {
              result[
                currentObject.name
              ] = `${currentObject.type}${currentObject.bits}`;
            }
          } else {
            result[currentObject.name] = currentObject.type;
          }
          return result;
        },
        {}
      );
}
