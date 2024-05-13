import Ainize from '../src/ainize';

describe('ainize', () => {
  it('should deploy service', async () => {
    const ainize = new Ainize(0);
    const privateKey = 'b22c95ffc4a5c096f7d7d0487ba963ce6ac945bdc91c79b64ce209de289bec96';
    await ainize.login(privateKey);
    await ainize.deploy({
      serviceName: 'TEST_SERVICE_NAME',
      serviceUrl: 'TEST_SERVICE_URL',
    });
  });
});
