#!/usr/bin/env python3
"""
Convert Keras CNN model to TensorFlow.js format

Usage:
    python convert_model.py --input best_custom_model.h5 --output ../public/models/glaucoma_cnn_model

Requirements:
    pip install tensorflowjs
"""

import argparse
import subprocess
import sys


def convert_model(input_path: str, output_dir: str):
    """Convert Keras .h5 model to TensorFlow.js format"""
    cmd = [
        sys.executable, '-m', 'tensorflowjs',
        '--input_format=keras',
        '--output_format=tfjs_graph_model',
        '--weight_shards=1',
        input_path,
        '--output_dir', output_dir
    ]

    print(f"Running: {' '.join(cmd)}")
    subprocess.run(cmd)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Convert Keras model to TensorFlow.js')
    parser.add_argument('--input', required=True, help='Path to .h5 model file')
    parser.add_argument('--output', required=True, help='Output directory for TF.js model')

    args = parser.parse_args()
    convert_model(args.input, args.output)