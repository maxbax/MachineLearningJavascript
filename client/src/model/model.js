import * as tf from '@tensorflow/tfjs';
import * as ModelData from './modelData.json';
import * as ModelDataTest from './modelDataTest.json';

let model = null;

const BACKEND_URL = 'http://localhost:5000';

const compile = () => {
  if (!model) throw new Error('Model not initializated');

  // Choose a learning rate that is suitable for the data we are using.
  const LEARNING_RATE = 0.0001;

  // Choose the loss
  const LEARNING_LOSS = 'meanAbsoluteError';

  // Compile the model with the defined learning rate and specify
  // our loss function to use.
  model.compile({
    optimizer: tf.train.sgd(LEARNING_RATE),
    loss: LEARNING_LOSS,
  });
};

const train = async () => {
  if (!model) throw new Error('Model not initializated');

  // Create Tensor representations of our vanilla JS arrays above
  // so can be used to train our model.
  const trainTensors = {
    data: tf.tensor2d(ModelData.data, [ModelData.data.length, 1]),
    answer: tf.tensor2d(ModelData.answers, [ModelData.answers.length, 1]),
  };

  // Compile the model
  compile();

  // Finally do the training itself over 500 iterations of the data.
  // As we have so little training data we use batch size of 1.
  // We also set for the data to be shuffled each time we try
  // and learn from it.
  await model.fit(
    trainTensors.data,
    trainTensors.answer,
    { epochs: 500, batchSize: 1, shuffle: true },
  );
};

const test = async () => {
  if (!model) throw new Error('Model not initializated');

  // Create Tensor for tests
  const testTensors = {
    data: tf.tensor2d(ModelDataTest.data, [ModelDataTest.data.length, 1]),
    answer: tf.tensor2d(ModelDataTest.answers, [ModelDataTest.answers.length, 1]),
  };

  // Compile the model
  compile();

  // Testing the model
  model.evaluate(testTensors.data, testTensors.answer);
};

const saveModel = async (path) => {
  if (!model) throw new Error('Model not initializated');
  await model.save(path);
};

const loadModel = async (path) => {
  model = await tf.loadLayersModel(path,
    { weightUrlConverter: () => `${BACKEND_URL}/downloadModelWeight` });
};

const createModel = async () => {
  // Now actually create and define model architecture.
  model = tf.sequential();

  // We will use one dense layer with 1 neuron and an input of
  // a single value.
  model.add(tf.layers.dense({ inputShape: [1], units: 1 }));

  // Train the model
  await train();

  // Test the model
  await test();

  // Save model to remote
  saveModel(`${BACKEND_URL}/uploadModel`);
};

const init = async () => {
  if (model) return;

  // Try to load model from remote
  await loadModel(`${BACKEND_URL}/downloadModel`).catch(() => null);

  if (model) return;

  // Create model if not exist on remote
  await createModel();
};

const predict = (value) => {
  if (!model) throw new Error('Model not initializated');

  // Predict answer for a single piece of data.
  const resultTensor = model.predict(tf.tensor2d([[value]]));
  return resultTensor.arraySync()[0][0];
};

export {
  init,
  predict,
};
