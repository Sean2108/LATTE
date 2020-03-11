import Web3 from 'web3';
import '../../internals/mocks/electron';
import { ipcRenderer } from 'electron';
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
  let push = jest.fn();

  beforeAll(() => {
    [Array.prototype.push, push] = [push, Array.prototype.push];
  });

  afterAll(() => {
    [Array.prototype.push, push] = [push, Array.prototype.push];
  });

  it('should push to history when inputs are correct', () => {
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
      [0, 1],
      {},
      contract,
      [0, 1, 2, 3, 4]
    );

    expect(deploy).toHaveBeenCalledWith({ arguments: [0, '', true, 1] });
    expect(encodeABI).toHaveBeenCalledTimes(1);
    expect(estimateGas).toHaveBeenCalledWith({ data: {}, from: 2 });
    expect(updateCompileError).not.toHaveBeenCalled();
    expect(push).toHaveBeenCalledWith(5);
  });

  it('should not not push to history when gas usage is unchanged', () => {
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
        constructorParams: []
      },
      updateCompileError,
      [1, 2],
      {},
      contract,
      [0, 1, 2, 3, 5]
    );

    expect(deploy).toHaveBeenCalledWith({});
    expect(encodeABI).toHaveBeenCalledTimes(1);
    expect(estimateGas).toHaveBeenCalledWith({ data: {}, from: 2 });
    expect(updateCompileError).not.toHaveBeenCalled();
    expect(push).not.toHaveBeenCalled();
  });

  it('should not not push to history when there is an error', () => {
    const estimateGas = jest
      .fn()
      .mockReturnValueOnce(
        new Promise((resolve, reject) =>
          reject(new Error('test error message'))
        )
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
      [0, 1, 2, 3, 4]
    );

    expect(deploy).toHaveBeenCalledWith({});
    expect(encodeABI).toHaveBeenCalledTimes(1);
    expect(estimateGas).toHaveBeenCalledWith({ data: {}, from: 2 });
    expect(updateCompileError).toHaveBeenCalledTimes(1);
    expect(push).not.toHaveBeenCalled();
  });
});

describe('Web3Utils deployCallback', () => {
  let log = jest.fn();

  beforeAll(() => {
    [console.log, log] = [log, console.log];
  });

  afterAll(() => {
    [console.log, log] = [log, console.log];
  });

  it('should clear build errors when deployment succeeds', () => {
    const onConfirmation = jest.fn();
    const onReceipt = jest.fn().mockReturnValueOnce({ on: onConfirmation });
    const onTransactionHash = jest.fn().mockReturnValueOnce({ on: onReceipt });
    const onError = jest.fn().mockReturnValueOnce({ on: onTransactionHash });
    const send = jest.fn().mockReturnValueOnce({ on: onError });
    const deploy = jest.fn().mockReturnValueOnce({ send });
    const contract = { deploy };

    const web3Utils = new Web3Utils({});
    const updateCompileError = jest.fn();
    web3Utils.deployCallback(
      {
        constructorParams: [
          { type: 'int', value: '42' },
          { type: 'string', value: 'teststr' },
          { type: 'bool', value: 'true' },
          { type: 'address', value: 'testaddress' }
        ]
      },
      updateCompileError,
      [0, 1],
      {},
      contract
    );

    expect(deploy).toHaveBeenCalledWith({
      arguments: [42, 'teststr', 'true', 'testaddress']
    });
    expect(send).toHaveBeenCalledWith(expect.objectContaining({ from: 0 }));
    expect(onError).toHaveBeenCalledWith('error', expect.any(Function));
    expect(onTransactionHash).toHaveBeenCalledWith(
      'transactionHash',
      expect.any(Function)
    );
    expect(onReceipt).toHaveBeenCalledWith('receipt', expect.any(Function));
    expect(onConfirmation).toHaveBeenCalledWith(
      'confirmation',
      expect.any(Function)
    );

    onError.mock.calls[0][1]('test err');
    expect(updateCompileError).toHaveBeenCalledWith('test err');
    onTransactionHash.mock.calls[0][1]('12345');
    expect(updateCompileError).toHaveBeenCalledWith('');
    expect(console.log).toHaveBeenCalledWith('Transaction Hash: 12345');
    onReceipt.mock.calls[0][1]({ contractAddress: 'test contract address' });
    expect(updateCompileError).toHaveBeenCalledWith('');
    expect(console.log).toHaveBeenCalledWith(
      'Contract Address: test contract address'
    );
    onConfirmation.mock.calls[0][1]('1994');
    expect(updateCompileError).toHaveBeenCalledWith('');
    expect(console.log).toHaveBeenCalledWith('Confirmation Number: 1994');
  });
});

describe('Web3Utils compileCode', () => {
  it('should updateCompileError and stop when there is an error in compiled code', () => {
    const web3Utils = new Web3Utils({});
    const payload = {
      errors: [{ formattedMessage: 'test error str' }],
      contracts: { 'code.sol': { Code: { abi: 'test abi' } } }
    };
    const updateCompileError = jest.fn();
    const callback = jest.fn();

    web3Utils.compileCode(
      JSON.stringify(payload),
      [0, 1],
      updateCompileError,
      callback
    );

    expect(updateCompileError).toHaveBeenCalledWith('test error str');
    expect(callback).not.toHaveBeenCalled();
  });

  it('should updateCompileError and stop when contract info is missing in compiled code', () => {
    const web3Utils = new Web3Utils({});
    const payload = {};
    const updateCompileError = jest.fn();
    const callback = jest.fn();

    web3Utils.compileCode(
      JSON.stringify(payload),
      [0, 1],
      updateCompileError,
      callback
    );

    expect(updateCompileError).toHaveBeenCalledWith(
      'Compilation failed, please try again.'
    );
    expect(callback).not.toHaveBeenCalled();
  });

  it('should work correctly when there are no errors', () => {
    const web3Utils = new Web3Utils(new Web3(''));
    const bytecode =
      '6080604052603e8060116000396000f3fe6080604052600080fdfea265627a7a72305820e634eb09997590801b0462c736f1ecc45599be5385ae9a3e5d535af70e2096c164736f6c63430005090032';
    const payload = {
      contracts: {
        'code.sol': {
          Code: {
            abi: [
              {
                inputs: [],
                payable: true,
                signature: 'constructor',
                stateMutability: 'payable',
                type: 'constructor'
              }
            ],
            evm: {
              bytecode: {
                object: bytecode
              }
            }
          }
        }
      }
    };
    const updateCompileError = jest.fn();
    const callback = jest.fn();

    web3Utils.compileCode(
      JSON.stringify(payload),
      [0, 1],
      updateCompileError,
      callback
    );

    expect(updateCompileError).not.toHaveBeenCalled();
    expect(callback).toHaveBeenCalledWith(
      [0, 1],
      { data: bytecode },
      expect.anything()
    );
  });
});

describe('Web3Utils requestCompile', () => {
  let log = jest.fn();

  beforeAll(() => {
    [console.log, log] = [log, console.log];
  });

  afterAll(() => {
    [console.log, log] = [log, console.log];
  });

  it('should update error when accounts is empty', async () => {
    const getAccounts = jest.fn().mockResolvedValueOnce([]);
    const web3 = { eth: { getAccounts } };
    const web3Utils = new Web3Utils(web3);
    const updateCompileError = jest.fn();
    const callback = jest.fn();
    await web3Utils.requestCompile(updateCompileError, false, {}, {}, callback);
    expect(getAccounts).toHaveBeenCalledTimes(1);
    expect(updateCompileError).toHaveBeenCalledWith(
      "Couldn't get any accounts! Make sure your Ethereum client is configured correctly."
    );
  });

  it('should work correctly when accounts is not empty', async () => {
    const getAccounts = jest.fn().mockResolvedValueOnce([42]);
    const web3 = { eth: { getAccounts } };
    const web3Utils = new Web3Utils(web3);
    const formCode = jest.fn().mockReturnValueOnce('test returned code');
    web3Utils.codeGen = { formCode };
    const updateCompileError = jest.fn();
    const callback = jest.fn();
    await web3Utils.requestCompile(updateCompileError, true, {}, {}, callback);
    expect(getAccounts).toHaveBeenCalledTimes(1);
    expect(updateCompileError).not.toHaveBeenCalled();
    expect(web3.eth.defaultAccount).toEqual(42);
    expect(console.log).toHaveBeenCalledWith('test returned code');
    expect(ipcRenderer.send).toHaveBeenCalledWith(
      'request-compile',
      'test returned code'
    );
    expect(ipcRenderer.once).toHaveBeenCalledWith(
      'request-compile-complete',
      expect.any(Function)
    );
    const originalCompileCode = web3Utils.compileCode;
    web3Utils.compileCode = jest.fn();
    ipcRenderer.once.mock.calls[0][1](null, { test: 'payload' });
    expect(web3Utils.compileCode).toHaveBeenCalledWith(
      { test: 'payload' },
      [42],
      updateCompileError,
      callback
    );
    web3Utils.compileCode = originalCompileCode;
  });
});

describe('Web3Utils action functions', () => {
  let requestCompile = jest.fn();
  let gasUsageCallback = jest.fn();
  let deployCallback = jest.fn();
  const web3Utils = new Web3Utils({});

  function swapMockFns() {
    [requestCompile, web3Utils.requestCompile] = [
      web3Utils.requestCompile,
      requestCompile
    ];
    [gasUsageCallback, web3Utils.gasUsageCallback] = [
      web3Utils.gasUsageCallback,
      gasUsageCallback
    ];
    [deployCallback, web3Utils.deployCallback] = [
      web3Utils.deployCallback,
      deployCallback
    ];
  };

  beforeAll(swapMockFns);

  afterAll(swapMockFns);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call requestCompile correctly when getGasUsage is called', () => {
    const updateCompileError = jest.fn();
    web3Utils.getGasUsage(
      { x: 1, y: 2 },
      { bitsMode: true, indentation: '  ' },
      [1, 2, 3, 4],
      updateCompileError
    );
    expect(web3Utils.requestCompile).toHaveBeenCalledWith(
      updateCompileError,
      false,
      { x: 1, y: 2 },
      { bitsMode: true, indentation: '  ' },
      expect.any(Function)
    );
    web3Utils.requestCompile.mock.calls[0][4](
      [2, 4],
      { arguments: ['test'] },
      { test: 'contract' }
    );
    expect(web3Utils.gasUsageCallback).toHaveBeenCalledWith(
      { x: 1, y: 2 },
      updateCompileError,
      [2, 4],
      { arguments: ['test'] },
      { test: 'contract' },
      [1, 2, 3, 4]
    );
  });

  it('should call requestCompile correctly when deploySmartContract is called', () => {
    const updateCompileError = jest.fn();
    web3Utils.deploySmartContract(
      { x: 1, y: 2 },
      { bitsMode: true, indentation: '  ' },
      updateCompileError
    );
    expect(web3Utils.requestCompile).toHaveBeenCalledWith(
      updateCompileError,
      true,
      { x: 1, y: 2 },
      { bitsMode: true, indentation: '  ' },
      expect.any(Function)
    );
    web3Utils.requestCompile.mock.calls[0][4](
      [2, 4],
      { arguments: ['test'] },
      { test: 'contract' }
    );
    expect(web3Utils.deployCallback).toHaveBeenCalledWith(
      { x: 1, y: 2 },
      updateCompileError,
      [2, 4],
      { arguments: ['test'] },
      { test: 'contract' }
    );
  });
});
