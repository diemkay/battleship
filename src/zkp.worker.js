import { ZKProvider } from './zkProvider';

self.addEventListener("message", (event) => {
  const { ctx, publicInputs, privateInputs } = event.data;
  // console.log('job received ', event.data)
  // setTimeout(() => self.postMessage({id, isVerified: true}), 5000) // mock
  runZKP(privateInputs, publicInputs)
    .then((res) => {
      self.postMessage({ ctx, ...res });
    });
});

// run zero knowledge proof
function runZKP(privateInputs, publicInputs) {
  return ZKProvider
    .init()
    .then(() => {
      // computer witness for fire result
      return ZKProvider.computeWitness(privateInputs.concat(publicInputs))
    })
    .then(async ({ witness }) => {
      return ZKProvider.generateProof(witness);
    })
    .then(async (proof) => {
      const isVerified = await ZKProvider.verify(proof);
      return { isVerified, proof };
    })
    .catch(e => {
      console.error('zkp.worker error:', e)
      return {
        isVerified: false
      }
    })
}