// tfjsLoader.js
import * as tf from '@tensorflow/tfjs';
import { scaleInput } from "./normalScalars.js";

export async function loadGestureModel(path) {
    const model = await tf.loadGraphModel(path);

    return {
        predict(inputFloats) {
            if (!Array.isArray(inputFloats) || inputFloats.length !== 63) {
                throw new Error("Input must be a flat array of length 63");
            }

            const scaled = scaleInput(inputFloats);
            // Wrap in array to make shape [1,63]
            const inputTensor = tf.tensor2d([scaled], [1, 63], 'float32');

            // GraphModel requires input dictionary keyed by input tensor name
            const inputName = model.inputs[0].name;
            const outputTensor = model.execute({ [inputName]: inputTensor });
            // console.log("Model outputs:", model.outputs);
            // console.log("Model signature:", model.signature);
            // console.log("Model executor:", model.executor);
            // console.log("Model nodes:", model.executor.graph);
            // console.log("All graph nodes:", Object.keys(model.executor.graph.nodes));
            return outputTensor.dataSync(); // Float32Array
        }
    };
}
