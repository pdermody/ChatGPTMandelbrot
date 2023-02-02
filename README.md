# ChatGPT Mandelbrot Explorer

This is a simple React app for exploring the Mandelbrot set using the [ChatGPT](openai.com) tool to write the code.

The steps I used to create this app are:

1. Create a new React app using `npx create-next-app` and accept all the defaults.
2. Asked the ChatGPT tool to write a program that would draw the Mandelbrot set. I used the following prompt:

    > Write a NextJS page using TypeScript that displays a mandelbrot set in a React component. Add logic for drawing the mandelbrot set in a separate function outside the component. Include support for zooming using the mouse wheel. Add support for panning the image using the keyboard. Ensure the pan amount is relative to the zoom level. Also, use the SHIFT modifier to allow panning in small and large steps. Make the canvas 500 by 500 pixels. Use a colorful palette to draw the image. Add text to explain how to navigate around the image.

3. ChatGPT generated the following code:

    ```typescript
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
        const r = Math.floor(3 * 255 * iter / MAX_ITER);
        const g = Math.floor(5 * 255 * iter / MAX_ITER);
        const b = Math.floor(7 * 255 * iter / MAX_ITER);
        return `rgb(${r}, ${g}, ${b})`;
    };

    const drawMandelbrot = (ctx: CanvasRenderingContext2D) => {
    for (let x = 0; x < WIDTH; x++) {
        for (let y = 0; y < HEIGHT; y++) {
            let zx = MIN_X + x * (MAX_X - MIN_X) / WIDTH;
            let zy = MIN_Y + y * (MAX_Y - MIN_Y) / HEIGHT;
            let c = zx + zy * 1i;
            let z = c;
            let iter = 0;

            while (iter < MAX_ITER && abs(z) < 2) {
                z = z * z + c;
                iter++;
            }

            ctx.fillStyle = colorPalette(iter);
            ctx.fillRect(x, y, 1, 1);
        }
    }
    };

    const Mandelbrot: React.FC = () => {
        const canvasRef = useRef<HTMLCanvasElement>(null);
        const [minX, setMinX] = useState(MIN_X);
        const [maxX, setMaxX] = useState(MAX_X);
        const [minY, setMinY] = useState(MIN_Y);
        const [maxY, setMaxY] = useState(MAX_Y);

        useEffect(() => {
            const canvas = canvasRef.current;
            if (!canvas) return;

            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            drawMandelbrot(ctx);
        }, [minX, maxX, minY, maxY]);

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
                <canvas
                    ref={canvasRef}
                    width={WIDTH}
                    height={HEIGHT}
                    onWheel={handleWheel}
                    onKeyDown={handleKeyDown}
                    tabIndex={0}
                />
                <p>
                    Use the mouse wheel to zoom in and out. Use the arrow keys to pan the
                    image. Hold down the SHIFT key to pan in smaller steps.
                </p>
            </div>
        );
    };

    export default Mandelbrot;  
    ```
3. This has some syntax errors so I said to ChatGPT: "The drawMandelbrot function has some syntax errors". ChatGPT apologized and fixed the errors as follows:

    ```typescript
    const drawMandelbrot = (
        context: CanvasRenderingContext2D,
        minX: number,
        maxX: number,
        minY: number,
        maxY: number
    ) => {
        const width = context.canvas.width;
        const height = context.canvas.height;

        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                const real = minX + x * (maxX - minX) / width;
                const imag = minY + y * (maxY - minY) / height;

                let zReal = real;
                let zImag = imag;

                let iterations = 0;
                let inside = true;

                while (iterations < MAX_ITERATIONS && inside) {
                    const r2 = zReal * zReal;
                    const i2 = zImag * zImag;

                    if (r2 + i2 > 4) {
                    inside = false;
                    }

                    zImag = 2 * zReal * zImag + imag;
                    zReal = r2 - i2 + real;

                    iterations++;
                }

                if (inside) {
                    context.fillStyle = 'black';
                } else {
                    const color =
                    PALETTE[iterations % PALETTE.length];
                    context.fillStyle = color;
                }

                context.fillRect(x, y, 1, 1);
            }
        }
    };
    ```

4. This code assumes a different implementation of the PALETTE and also renamed the variable MAX_ITERATIONS. From experience I knew getting it to match the previous code would be difficult so I changed it manually.

5. The result worked and looked great but the performance was much worse than previous versions that ChatGPT created.  So I said to ChatGPT: 

    > The drawMandelbrot function is very slow. How can we improve the performance?
    
    ChatGPT replied:

    > There are several ways to improve the performance of the drawMandelbrot function:
    >    1. Use Web Workers: You can offload the heavy computation of the drawMandelbrot function to a web worker, which runs in a separate thread. This will allow the main thread to r emain responsive and avoid freezing the UI.    
    >    2. Use a more efficient algorithm: The current implementation uses a straightforward approach to calculate the Mandelbrot set. There are more efficient algorithms, such as the m ulti-threaded "Buddhabrot" algorithm, which can significantly improve performance.
    >    3. Use a GPU: You can use WebGL to perform the computations on the GPU, which is much faster than the CPU.
    >    4. Use progressive rendering: Instead of rendering the entire image at once, you can render parts of the image and display them incrementally. This will give the user a better e xperience by allowing them to see the results of the computation more quickly.
    >    5. Cache the results: You can cache the results of the computation so that if the user zooms in to the same area, you don't have to recalculate everything from scratch.
    > You can try implementing some of these optimizations to see the improvement in performance.

6. This is interesting but did not explain the change in performance. A visual review of the code showed that the code was now using a slower method for painting the mandelbrot set (using ctx.fillRect()) than previous iterations had. So, I asked it to reimplement the drawMandelbrot function using ctx.createImageData() and ctx.putImageData() instead. ChatGPT did so and the performance was much better.

7. ChatGPT produced the following version of the code:

```typescript
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
  iter = iter %255
  const r = Math.floor(3 * 255 * iter / MAX_ITER);
  const g = Math.floor(5 * 255 * iter / MAX_ITER);
  const b = Math.floor(7 * 255 * iter / MAX_ITER);
  return {r, g, b};
};

const drawMandelbrot = (
  context: CanvasRenderingContext2D,
  minX: number,
  maxX: number,
  minY: number,
  maxY: number
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

      while (iterations < MAX_ITER && inside) {
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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawMandelbrot(ctx, minX, maxX, minY, maxY);
  }, [minX, maxX, minY, maxY]);

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
      <canvas
        ref={canvasRef}
        width={WIDTH}
        height={HEIGHT}
        onWheel={handleWheel}
        onKeyDown={handleKeyDown}
        tabIndex={0}
      />
      <p>
        Use the mouse wheel to zoom in and out. Use the arrow keys to pan the
        image. Hold down the SHIFT key to pan in smaller steps.
      </p>
    </div>
  );
};

export default Mandelbrot;  
```

8. I then asked it to make the MAX_ITER value adjustable:

   > How can I add a component for adjusting the MAX_ITER value at runtime?

   ChatGPT replied with:

   > You can add a component for adjusting the MAX_ITER value at runtime by creating a state to store the value of MAX_ITER and a function to update it. Then, you can pass the value of MAX_ITER from the state as a parameter to the drawMandelbrot function. Here's an example implementation:

    ```tsx
    const Mandelbrot: React.FC = () => {
        ...
        const [maxIter, setMaxIter] = useState(MAX_ITER);

        useEffect(() => {
            const canvas = canvasRef.current;
            if (!canvas) return;

            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            drawMandelbrot(ctx, minX, maxX, minY, maxY, maxIter);
        }, [minX, maxX, minY, maxY, maxIter]);
        ...
        return (
            <div>
                <canvas
                    ref={canvasRef}
                    width={WIDTH}
                    height={HEIGHT}
                    onWheel={handleWheel}
                    onKeyDown={handleKeyDown}
                />
                <input
                    type="range"
                    min={0}
                    max={500}
                    value={maxIter}
                    onChange={(event) => setMaxIter(event.target.value)}
                />
            </div>
        );
    };
    ```

    Notice that ChatGPT chose to make it a "range" input.
    
9. I had so make a couple of manual adjustments to ensure the drawMandelbrot function was called with the correct number of parameters.

10. I made some other refinements as follows:

    1. The range input gives an error at build time because event.target.value is not a number. How can I fix it?
    1. Add a label to the range input
    1. Display the number of iterations to the user
    1. Place this label below the mandelbrot set
    1. Place the range input below the mandelbrot set

11. This made some adjustments correctly to the code and the final version is in this repo.

# Some other things I noted while generating this code:

- Running it multiple times would give very different implementations
- Asking it to generate some code and then refining gradually works for a while but ChatGPT quickly loses the context and starts generating new code that is not compatible with other parts of the code. For example, ChatGPT sometimes changed implementation details while refining the solution
- I has some success separating the cod einto separate files. This is an interesting area to explore more.
- ChatGPT is very unstable still due to high demand
- Sometimes the code had syntax errors - but ChatGPT apologized and fixed it when requested
- If the code gets too long then telling ChatGPT to “continue” will generate the rest of the code. However, this additional code is rarely formatted correctly.
- Suggestions that were aimed at refining parts of the code usually resulted in breaking changes relative to the rest of the code. (Changes in parameter lists, variable names, etc.)
