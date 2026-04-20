# TensorFlow.js CNN Model for Glaucoma Detection

This directory contains the CNN model converted for browser-based inference using TensorFlow.js.

## Files

- `model.json` - Model architecture and metadata (PLACEHOLDER - replace with actual converted model)
- `group1-shard1of1.bin` - Model weights (NOT YET PROVIDED - training required)
- `convert_model.py` - Python script to convert Keras .h5 to TensorFlow.js format

## Model Architecture (from training)

```
Custom CNN:
- Conv2D(32, 3x3, relu) -> MaxPool2D
- Conv2D(64, 3x3, relu) -> MaxPool2D
- Conv2D(128, 3x3, relu) -> MaxPool2D
- Flatten
- Dense(128, relu)
- Dropout(0.5)
- Dense(1, sigmoid)

MobileNetV2 (pretrained):
- Base: MobileNetV2 pretrained on ImageNet (trainable=False)
- GlobalAveragePooling2D
- Dense(128, relu)
- Dense(1, sigmoid)

Input: 224x224x3 RGB fundus image
Output: Probability of glaucoma (0-1)
```

## Setup Instructions

### Step 1: Get Trained Model Weights

You need the trained model file (`.h5`) from your training pipeline (`final_code_for_data_analysis (1).py`).
The best model is saved as `best_custom_model.h5` (or `best_pretrained_model.h5`).

### Step 2: Convert to TensorFlow.js

Install TensorFlow.js converter:
```bash
pip install tensorflowjs
```

Convert your model:
```bash
python models/convert_model.py \
    --input path/to/best_custom_model.h5 \
    --output public/models/glaucoma_cnn_model
```

This will generate:
- `model.json` - Model architecture
- `group1-shard1of1.bin` - Binary weight file(s)

### Step 3: Place Files

Move the generated files to:
```
/public/models/glaucoma_cnn_model/
```

## Current Status

The model files in this directory are **PLACEHOLDERS**. The actual model weights are not included because:
1. The training produces large `.h5` files (>50MB)
2. Model weights need to be converted using tensorflowjs_converter after training

## Client-Side Usage

```typescript
import { loadGlaucomaModel, predict } from '@/lib/cnn-model'

// Load model (once, cached)
const result = await loadGlaucomaModel()
if (!result.success) {
  console.error('Model failed to load:', result.error)
  return
}

// Make prediction
const prediction = await predict(result.model, imageBase64)
console.log(prediction)
// { prediction: 'glaucoma' | 'normal', confidence: 75.4, cdr: 0.45, ... }
```