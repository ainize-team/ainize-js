// @ts-nocheck
import Ainize from '../src/ainize';
const {
  test_keystore,
  test_pw,
  test_seed,
  test_node_1,
  test_node_2
} = require('./test_data');

const TX_PATTERN = /^0x([A-Fa-f0-9]{64})$/;
const TEST_SK = 'ee0b1315d446e5318eb6eb4e9d071cd12ef42d2956d546f9acbdc3b75c469640';
const TEST_ADDR = '0x09A0d53FDf1c36A131938eb379b98910e55EEfe1';

jest.setTimeout(180000);
describe('ainize', function() {
  const ainze = new Ainize(test_node_1);
  let keystoreAddress = '';

  describe('Network', function() {
    it('chainId', function() {
      expect(ain.chainId).toBe(0);
      expect(ain.wallet.chainId).toBe(0);
      ain.setProvider(test_node_1, 2);
      expect(ain.chainId).toBe(2);
      expect(ain.wallet.chainId).toBe(2);
    });
  });
});