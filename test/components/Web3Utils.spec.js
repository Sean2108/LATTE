
import Web3Utils from '../../app/components/build/build_utils/Web3Utils';

describe('Web3Utils handleError', () => {
  it('should work for objects with error attribute', () => {
    const web3Utils = new Web3Utils(null);
    const updateCompileError = jest.fn();
    web3Utils.handleError({ error: 'test obj error' }, updateCompileError);
    expect(updateCompileError).toHaveBeenCalledWith('test obj error');
  });

  it('should work for strings', () => {
    const web3Utils = new Web3Utils(null);
    const updateCompileError = jest.fn();
    web3Utils.handleError('test obj error', updateCompileError);
    expect(updateCompileError).toHaveBeenCalledWith('test obj error');
  });
});

describe('Web3Utils getGasUsageCallback', () => {
  it('should work when inputs are correct', () => {
    const estimateGas = jest
      .fn()
      .mockReturnValueOnce(new Promise(resolve => resolve(5)));
    const web3 = {
      eth: { estimateGas }
    };
    const encodeABI = jest.fn().mockReturnValueOnce({});
    const deploy = jest.fn().mockReturnValueOnce({ encodeABI });
    const contract = { deploy };

    const web3Utils = new Web3Utils(web3);
    const updateCompileError = jest.fn();
    web3Utils.gasUsageCallback(
      {
        constructorParams: [
          { type: 'int' },
          { type: 'string' },
          { type: 'bool' },
          { type: 'address' }
        ]
      },
      updateCompileError,
      [1, 2],
      {},
      contract,
      [0]
    );
    expect(deploy).toHaveBeenCalledWith({ arguments: [0, '', true, 1] });
    expect(encodeABI).toHaveBeenCalledTimes(1);
    expect(estimateGas).toHaveBeenCalledWith({ data: {}, from: 2 });
    expect(updateCompileError).not.toHaveBeenCalled();
  });

  it('should not have argument when constructorParams is empty', () => {
    const estimateGas = jest
      .fn()
      .mockReturnValueOnce(
        new Promise((resolve, reject) => reject('test error message'))
      );
    const web3 = {
      eth: { estimateGas }
    };
    const encodeABI = jest.fn().mockReturnValueOnce({});
    const deploy = jest.fn().mockReturnValueOnce({ encodeABI });
    const contract = { deploy };

    const web3Utils = new Web3Utils(web3);
    const updateCompileError = jest.fn();
    web3Utils.gasUsageCallback(
      {
        constructorParams: []
      },
      updateCompileError,
      [1, 2],
      {},
      contract,
      [0]
    );
    expect(deploy).toHaveBeenCalledWith({});
    expect(encodeABI).toHaveBeenCalledTimes(1);
    expect(estimateGas).toHaveBeenCalledWith({ data: {}, from: 2 });
  });
});
