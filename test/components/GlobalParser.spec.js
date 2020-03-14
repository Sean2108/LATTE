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

  describe('parseStartNode function', () => {
    beforeEach(() => {
      BuildParser.mockClear();
    });

    it('parseStartNode should reset buildParser and call update functions', () => {
      const onVariablesChange = jest.fn();
      const globalParser = new GlobalParser(
        onVariablesChange,
        null
      );
      const mockBuildParserInstance = BuildParser.mock.instances[0];
      mockBuildParserInstance.parse.mockReturnValueOnce('the code');
      mockBuildParserInstance.getReturnVar.mockReturnValueOnce('return var');
      mockBuildParserInstance.getView.mockReturnValueOnce(true);
      const res = globalParser.parseStartNode(
        {},
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
      expect(res).toEqual({
        tabsCode: 'the code',
        tabsReturn: 'return var',
        isView: true
      });
    });
  });
});
