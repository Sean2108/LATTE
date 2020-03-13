// @flow

export type Classes = { [key: string]: string };

type VariableType = 'uint' | 'bool' | 'address payable' | 'string';

export type Comparator = '==' | '!=' | '>' | '>=' | '<' | '<=';

export type onParseFn = {
  tabsCode: string,
  tabsReturn: ?string,
  isView: boolean,
  diagrams: {}
};

export type onParseKeys = 'tabsCode' | 'tabsReturn' | 'isView' | 'diagrams';

export type Mapping = {
  type: 'mapping',
  inner?: string,
  from: string,
  to: string
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
  requireMessage?: string
};

export type VariableObj = {
  name: string,
  displayName: string,
  value?: string,
  type: VariableType | string,
  bits: ?(number | string)
};

export type ParserVariable = {
  name: string,
  type: string,
  mapName?: string,
  keyType?: string,
  innerKeyType?: string
};

export type VariablesLookupType = { [key: string]: string | Mapping };
export type StructLookupType = { [key: string]: Array<VariableObj> };

export type BuildState = {
  tabs: Array<string>,
  tabsCode: Array<string>,
  variables: VariablesLookupType,
  tabsParams: Array<Array<VariableObj>>,
  tabsReturn: Array<string | null>,
  tabsRequire: Array<Array<RequireObj>>,
  constructorParams: Array<VariableObj>,
  events: StructLookupType,
  entities: StructLookupType,
  isView: Array<boolean>,
  diagrams: Array<{}>,
  gasHistory: Array<number>,
  buildError: string
};
