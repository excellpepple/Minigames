// tfliteLoader.js
import * as tf from '@tensorflow/tfjs';

export async function loadGestureModel(path) {
  const model = await tf.loadLayersModel(path);

  return {
    predict(inputFloats) {
      // Wrap raw floats in a tensor – adjust shape to match your model
      const input = tf.tensor([inputFloats]);
      const output = model.predict(input);
      return output.dataSync(); // returns Float32Array
    }
  };
}
