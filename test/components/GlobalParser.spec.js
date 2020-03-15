import GlobalParser from '../../app/components/build/parsers/GlobalParser';
import BuildParser from '../../app/components/build/parsers/BuildParser';

jest.mock('../../app/components/build/parsers/BuildParser');

describe('GlobalParser component', () => {
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
        .mockReturnValueOnce({
          code: 'code1',
          variables: { testvar1: 'test1' }
        })
        .mockReturnValueOnce({
          code: 'code2',
          variables: { testvar1: 'test1', testvar2: 'test2' }
        })
        .mockReturnValueOnce({
          code: 'code3',
          variables: { testvar: 'test', testvar2: 'test2', testvar3: 'test3' }
        });
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
        {},
        { test1: 'uint8' },
        { c: 3 },
        { d: 4 },
        { bitsMode: true, indentation: '    ' }
      );
      expect(mockBuildParserInstance.parse).toHaveBeenCalledWith({
        node1: 'a'
      });
      expect(mockBuildParserInstance.reset).toHaveBeenCalledWith(
        { testvar1: 'test1' },
        { test2: 'bytes16' },
        { c: 3 },
        { d: 4 },
        { bitsMode: true, indentation: '    ' }
      );
      expect(mockBuildParserInstance.parse).toHaveBeenCalledWith({
        node2: 'b'
      });
      expect(mockBuildParserInstance.reset).toHaveBeenCalledWith(
        { testvar1: 'test1', testvar2: 'test2' },
        { test3: 'bool', test4: 'address' },
        { c: 3 },
        { d: 4 },
        { bitsMode: true, indentation: '    ' }
      );
      expect(mockBuildParserInstance.parse).toHaveBeenCalledWith({
        node3: 'c'
      });
      const expectedChanges = {
        tabsCode: ['code1', 'code2', 'code3'],
        tabsReturn: ['return1', 'return2', 'return3'],
        isView: [true, false, true],
        gasHistory: [0, 1, 2]
      };
      expect(getGasUsage).toHaveBeenCalledWith(
        {
          ...buildState,
          ...expectedChanges,
          variables: { testvar: 'test', testvar2: 'test2', testvar3: 'test3' }
        },
        settings,
        [0, 1, 2],
        updateBuildError
      );
      expect(onTabsChange).toHaveBeenCalledWith(expectedChanges, addNode);
      expect(updateLoading).toHaveBeenCalledWith(false);
      expect(globalParser.variables).toEqual({
        testvar: 'test',
        testvar2: 'test2',
        testvar3: 'test3'
      });
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
        tabsReturn: null,
        isView: true
      });
    });

    it('should reset buildParser and call update functions', () => {
      const globalParser = new GlobalParser(null, null);
      const mockBuildParserInstance = BuildParser.mock.instances[0];
      mockBuildParserInstance.parse.mockReturnValueOnce({
        code: 'the code',
        variables: { testvar: 'test' }
      });
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
        {},
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
      expect(globalParser.variables).toEqual({ testvar: 'test' });
    });
  });
});
