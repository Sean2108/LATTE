// @flow

export type Classes = { [key: string]: string };
export type VariablesLookupType = { [key: string]: Mapping | string };
export type StructLookupType = { [key: string]: Array<VariableObj> };

type VariableType = 'uint' | 'bool' | 'address payable' | 'string';
type Comparator = '==' | '!=' | '>' | '>=' | '<' | '<=';

export type onParseFn = {
  tabsCode: string,
  tabsReturn: string,
  isView: string,
  diagrams: {}
};

export type onParseKeys = 'tabsCode' | 'tabsReturn' | 'isView' | 'diagrams';

export type Mapping = {
  type: 'mapping',
  inner: ?string,
  from: string,
  to: string
};

export type Param = {
  name: string,
  displayName: ?string,
  value: string | void,
  type: VariableType,
  bits: ?(number | string)
};

export type SettingsObj = {
  bitsMode: boolean,
  indentation: string
};

export type RequireObj = {
  var1: string,
  displayVar1: string,
  comp: Comparator,
  var2: string,
  displayVar2: string,
  requireMessage: string
};

export type VariableObj = {
  name: string,
  displayName: string,
  type: VariableType | string,
  bits: ?(number | string)
};

export type BuildState = {
  tabs: Array<string>,
  tabsCode: Array<string>,
  variables: VariablesLookupType,
  tabsParams: Array<Array<Param>>,
  tabsReturn: Array<string | null>,
  tabsRequire: Array<Array<RequireObj>>,
  constructorParams: Array<Param>,
  events: StructLookupType,
  entities: StructLookupType,
  isView: Array<boolean>,
  diagrams: Array<{}>,
  gasHistory: Array<number>,
  buildError: string
};