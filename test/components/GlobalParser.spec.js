import GlobalParser from '../../app/components/build/parsers/GlobalParser';
import BuildParser from '../../app/components/build/parsers/BuildParser';

jest.mock('../../app/components/build/parsers/BuildParser');

describe('GlobalParser component', () => {
  describe('flattenParamsToObject function', () => {
    const input = [
      { name: '', type: 'uint' },
      { name: 'some_uint', type: 'uint' },
      { name: 'some_uint_bits', type: 'uint', bits: '8' },
      { name: 'some_str', type: 'string' },
      { name: 'some_str_bits', type: 'string', bits: '16' },
      { name: 'some_addr', type: 'address' },
      { name: 'some_bool', type: 'bool' }
    ];

    it('should work with bitsMode on', () => {
      const globalParser = new GlobalParser(null, null);
      const expected = {
        some_uint: 'uint',
        some_uint_bits: 'uint8',
        some_str: 'string',
        some_str_bits: 'bytes16',
        some_addr: 'address',
        some_bool: 'bool'
      };
      expect(globalParser.flattenParamsToObject(input, true)).toEqual(expected);
    });

    it('should work with bitsMode off', () => {
      const globalParser = new GlobalParser(null, null);
      const expected = {
        some_uint: 'uint',
        some_uint_bits: 'uint',
        some_str: 'string',
        some_str_bits: 'string',
        some_addr: 'address',
        some_bool: 'bool'
      };
      expect(globalParser.flattenParamsToObject(input, false)).toEqual(
        expected
      );
    });
  });

  describe('parse function', () => {
    beforeEach(() => {
      BuildParser.mockClear();
    });

    it('should call onTabsChange with correct params', () => {
      const updateBuildError = jest.fn();
      const globalParser = new GlobalParser(null, updateBuildError);
      const mockBuildParserInstance = BuildParser.mock.instances[0];
      const onTabsChange = jest.fn();
      const updateLoading = jest.fn();
      const buildState = {
        gasHistory: [0, 1, 2],
        tabsParams: [
          [
            {
              name: 'test1',
              type: 'uint',
              bits: '8'
            }
          ],
          [
            {
              name: 'test2',
              type: 'string',
              bits: '16'
            }
          ],
          [
            {
              name: 'test3',
              type: 'bool'
            },
            {
              name: 'test4',
              type: 'address'
            }
          ]
        ],
        events: { c: 3 },
        entities: { d: 4 }
      };
      const settings = { bitsMode: true, indentation: '    ' };
      const props = {
        startNodes: [{ node1: 'a' }, { node2: 'b' }, { node3: 'c' }],
        onTabsChange,
        settings,
        updateLoading,
        variables: { a: 1 },
        buildState
      };
      const getGasUsage = jest.fn();
      const web3Utils = { getGasUsage };
      const addNode = jest.fn();
      const editHistory = { addNode };
      mockBuildParserInstance.parse
        .mockReturnValueOnce('code1')
        .mockReturnValueOnce('code2')
        .mockReturnValueOnce('code3');
      mockBuildParserInstance.getReturnVar
        .mockReturnValueOnce('return1')
        .mockReturnValueOnce('return2')
        .mockReturnValueOnce('return3');
      mockBuildParserInstance.getView
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(true);
      globalParser.parse(props, web3Utils, editHistory);
      expect(mockBuildParserInstance.reset).toHaveBeenCalledWith(
        { a: 1 },
        { test1: 'uint8' },
        { c: 3 },
        { d: 4 },
        { bitsMode: true, indentation: '    ' }
      );
      expect(mockBuildParserInstance.parse).toHaveBeenCalledWith({
        node1: 'a'
      });
      expect(mockBuildParserInstance.reset).toHaveBeenCalledWith(
        { a: 1 },
        { test2: 'bytes16' },
        { c: 3 },
        { d: 4 },
        { bitsMode: true, indentation: '    ' }
      );
      expect(mockBuildParserInstance.parse).toHaveBeenCalledWith({
        node2: 'b'
      });
      expect(mockBuildParserInstance.reset).toHaveBeenCalledWith(
        { a: 1 },
        { test3: 'bool', test4: 'address' },
        { c: 3 },
        { d: 4 },
        { bitsMode: true, indentation: '    ' }
      );
      expect(mockBuildParserInstance.parse).toHaveBeenCalledWith({
        node3: 'c'
      });
      expect(getGasUsage).toHaveBeenCalledWith(
        buildState,
        settings,
        [0, 1, 2],
        updateBuildError
      );
      expect(onTabsChange).toHaveBeenCalledWith(
        {
          tabsCode: ['code1', 'code2', 'code3'],
          tabsReturn: ['return1', 'return2', 'return3'],
          isView: [true, false, true],
          gasHistory: [0, 1, 2]
        },
        addNode
      );
      expect(updateLoading).toHaveBeenCalledWith(false);
    });
  });

  describe('parseStartNode function', () => {
    beforeEach(() => {
      BuildParser.mockClear();
    });

    it('should not call parse buildParser when startNode is null', () => {
      const globalParser = new GlobalParser(null, null);
      const mockBuildParserInstance = BuildParser.mock.instances[0];
      const res = globalParser.parseStartNode(
        null,
        { b: 2 },
        {
          variables: { a: 1 },
          buildState: {
            events: { c: 3 },
            entities: { d: 4 }
          },
          settings: { bitsMode: true, indentation: '    ' }
        }
      );
      expect(mockBuildParserInstance.reset).not.toHaveBeenCalled();
      expect(res).toEqual({
        tabsCode: '',
        tabsReturn: '',
        isView: true
      });
    });

    it('should reset buildParser and call update functions', () => {
      const globalParser = new GlobalParser(null, null);
      const mockBuildParserInstance = BuildParser.mock.instances[0];
      mockBuildParserInstance.parse.mockReturnValueOnce('the code');
      mockBuildParserInstance.getReturnVar.mockReturnValueOnce('return var');
      mockBuildParserInstance.getView.mockReturnValueOnce(true);
      const res = globalParser.parseStartNode(
        { node: 'a' },
        { b: 2 },
        {
          variables: { a: 1 },
          buildState: {
            events: { c: 3 },
            entities: { d: 4 }
          },
          settings: { bitsMode: true, indentation: '    ' }
        }
      );
      expect(mockBuildParserInstance.reset).toHaveBeenCalledWith(
        { a: 1 },
        { b: 2 },
        { c: 3 },
        { d: 4 },
        { bitsMode: true, indentation: '    ' }
      );
      expect(mockBuildParserInstance.parse).toHaveBeenCalledWith({ node: 'a' });
      expect(res).toEqual({
        tabsCode: 'the code',
        tabsReturn: 'return var',
        isView: true
      });
    });
  });
});
