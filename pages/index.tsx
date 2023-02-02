import React, { useRef, useEffect, useState } from 'react';

const WIDTH = 500;
const HEIGHT = 500;
const MAX_ITER = 100;
const ZOOM_FACTOR = 1.1;
const MIN_X = -2;
const MAX_X = 1;
const MIN_Y = -1;
const MAX_Y = 1;
const SMALL_PAN_AMOUNT = 0.05;
const LARGE_PAN_AMOUNT = 0.5;

const colorPalette = (iter: number) => {
  iter = iter % 255
  const r = Math.floor(3 * 255 * iter / MAX_ITER);
  const g = Math.floor(5 * 255 * iter / MAX_ITER);
  const b = Math.floor(7 * 255 * iter / MAX_ITER);
  return { r, g, b };
};

const drawMandelbrot = (
  context: CanvasRenderingContext2D,
  minX: number,
  maxX: number,
  minY: number,
  maxY: number,
  maxIter: number
) => {
  const width = context.canvas.width;
  const height = context.canvas.height;

  const imageData = context.createImageData(width, height);
  const data = imageData.data;

  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const real = minX + x * (maxX - minX) / width;
      const imag = minY + y * (maxY - minY) / height;

      let zReal = real;
      let zImag = imag;

      let iterations = 0;
      let inside = true;

      while (iterations < maxIter && inside) {
        const r2 = zReal * zReal;
        const i2 = zImag * zImag;

        if (r2 + i2 > 4) {
          inside = false;
        }

        zImag = 2 * zReal * zImag + imag;
        zReal = r2 - i2 + real;

        iterations++;
      }

      const index = (y * width + x) * 4;
      if (inside) {
        data[index] = 0;
        data[index + 1] = 0;
        data[index + 2] = 0;
        data[index + 3] = 255;
      } else {
        const color = colorPalette(iterations);
        data[index] = color.r;
        data[index + 1] = color.g;
        data[index + 2] = color.b;
        data[index + 3] = 255;
      }
    }
  }

  context.putImageData(imageData, 0, 0);
};

const Mandelbrot: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [minX, setMinX] = useState(MIN_X);
  const [maxX, setMaxX] = useState(MAX_X);
  const [minY, setMinY] = useState(MIN_Y);
  const [maxY, setMaxY] = useState(MAX_Y);
  const [maxIter, setMaxIter] = useState(MAX_ITER);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawMandelbrot(ctx, minX, maxX, minY, maxY, maxIter);
  }, [minX, maxX, minY, maxY, maxIter]);

  const handleWheel = (event: React.WheelEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const zoom = event.deltaY > 0 ? 1 / ZOOM_FACTOR : ZOOM_FACTOR;
    const canvasX = event.clientX - canvas.offsetLeft;
    const canvasY = event.clientY - canvas.offsetTop;
    const x = minX + canvasX * (maxX - minX) / WIDTH;
    const y = minY + canvasY * (maxY - minY) / HEIGHT;

    setMinX(x + (minX - x) * zoom);
    setMaxX(x + (maxX - x) * zoom);
    setMinY(y + (minY - y) * zoom);
    setMaxY(y + (maxY - y) * zoom);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLCanvasElement>) => {
    const panAmount = event.shiftKey
      ? SMALL_PAN_AMOUNT
      : LARGE_PAN_AMOUNT;

    switch (event.key) {
      case 'ArrowLeft':
        setMinX(minX - panAmount * (maxX - minX));
        setMaxX(maxX - panAmount * (maxX - minX));
        break;
      case 'ArrowRight':
        setMinX(minX + panAmount * (maxX - minX));
        setMaxX(maxX + panAmount * (maxX - minX));
        break;
      case 'ArrowUp':
        setMinY(minY - panAmount * (maxY - minY));
        setMaxY(maxY - panAmount * (maxY - minY));
        break;
      case 'ArrowDown':
        setMinY(minY + panAmount * (maxY - minY));
        setMaxY(maxY + panAmount * (maxY - minY));
        break;
      default:
        break;
    }
  };

  return (
    <div>
      <div style={{ display: "inline-block" }}>
        <canvas
          ref={canvasRef}
          width={WIDTH}
          height={HEIGHT}
          onWheel={handleWheel}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        />
      </div>
      <br />
      <label htmlFor="iterations">Iterations: {maxIter}</label>
      <br />
      <input
        id="iterations"
        type="range"
        min={0}
        max={500}
        value={maxIter}
        onChange={(event) => setMaxIter(parseInt(event.target.value))}
      />
      <p>
        Use the mouse wheel to zoom in and out. Use the arrow keys to pan the
        image. Hold down the SHIFT key to pan in smaller steps.
      </p>
    </div>
  );
};

export default Mandelbrot;  