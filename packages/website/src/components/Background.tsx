import { useRef, useEffect } from 'react';
import styled from '@emotion/styled';

type Point = {
  x: number,
  y: number,
  impulse: number
}

type RendererOptions = {
  every: number,
  variance: number,
  size: number,
  speed: number,
  tolerance: number,
  color: string,
  edge: boolean,
}

type OpacityProp = {
  opacity?: number,
}

type BackgroundProps = OpacityProp & RendererOptions

export const makeRenderer = (
  ref: HTMLCanvasElement,
  {
    every,
    variance,
    size,
    speed,
    tolerance,
    color,
    edge,
  }: RendererOptions,
) => {
  const canvas = ref;

  const ctx = canvas.getContext('2d')!;
  let realSpeed: number;

  let points: Point[];

  const update = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const col = Math.floor(canvas.width / every);
    const row = Math.floor(canvas.height / every);

    const colPad = canvas.width - (col - 1) * every;
    const rowPad = canvas.height - (row - 1) * every;

    realSpeed = Math.min(window.innerWidth, window.innerHeight) * (speed / 1000);

    points = new Array(col * row)
      .fill(0)
      .map((_, idx) => ({
        x: Math.floor(idx % col) * every + colPad / 2
          + Math.floor(Math.random() * variance * 2 - variance),
        y: Math.floor(idx / col) * every + rowPad / 2
          + Math.floor(Math.random() * variance * 2 - variance),
        impulse: Math.random() * Math.PI * 2,
      }));
  };

  update();
  window.addEventListener('resize', update);

  const fillGrad = (x: number, y: number) => {
    const grd = ctx.createLinearGradient(0, 0, x, y);
    grd.addColorStop(0, 'rgba(256, 256, 256, 0.8)');
    grd.addColorStop(0.3, 'rgba(256, 256, 256, 0)');
    grd.addColorStop(0.7, 'rgba(256, 256, 256, 0)');
    grd.addColorStop(1, 'rgba(256, 256, 256, 0.8)');
    ctx.fillStyle = grd;
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'source-over';
  };

  let isRendering = true;
  const render = () => {
    if (!isRendering) {
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = color;
    ctx.strokeStyle = color;

    points = points.map(({ x, y, impulse }) => {
      let newX = x + realSpeed * Math.cos(impulse);
      let newY = y + realSpeed * Math.sin(impulse);
      let newImpulse = impulse;
      if (
        x < -tolerance
        || x > canvas.width + tolerance
        || y < -tolerance
        || y > canvas.height + tolerance
      ) {
        newX = Math.min(canvas.width, Math.max(0, newX));
        newY = Math.min(canvas.height, Math.max(0, newY));
        newImpulse = (newImpulse + Math.PI) % (Math.PI * 2);
      }
      return {
        x: newX,
        y: newY,
        impulse: newImpulse,
      };
    });

    ctx.strokeStyle = color;
    points.forEach(({ x, y }, idx) => {
      points.forEach(({ x: x1, y: y1 }, idx1) => {
        if (idx !== idx1) {
          const dist = Math.sqrt(
            (x - x1) ** 2
            + (y - y1) ** 2,
          );
          if (dist < every * 1.2) {
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x1, y1);
            ctx.stroke();
          }
        }
      });
    });

    points.forEach(({ x, y }) => {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, size * 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    });

    if (edge) {
      fillGrad(0, canvas.height);
      fillGrad(canvas.width, 0);
    }

    requestAnimationFrame(render);
  };

  return {
    start: () => {
      isRendering = true;
      render();
    },
    stop: () => {
      isRendering = false;
    },
    canvas,
  };
};

const Canvas = styled.canvas<OpacityProp>(
  `
    position: fixed;
    left: 0;
    top: 0;
    width: 100vw;
    height: 100vh;
    opacity: 0.3;
    z-index: -1;
  `,
  ({ opacity = 0.3 }) => ({
    opacity,
  }),
);

export const Background = ({
  every = 150,
  variance = 50,
  size = 4,
  speed = 1.5,
  tolerance = 50,
  color = '#444444',
  edge = false,
  opacity,
}: Partial<BackgroundProps>) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(
    () => {
      if (ref.current) {
        const renderer = makeRenderer(ref.current, {
          every,
          variance,
          size,
          speed,
          tolerance,
          color,
          edge,
        });
        renderer.start();
        return renderer.stop;
      }
      return undefined;
    },
    [ref],
  );
  return (
    <Canvas ref={ref} {...{ opacity }} />
  );
};

export default Background;
