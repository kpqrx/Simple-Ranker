import { Point } from "./types";

export const getSum = (elements: number[]) =>
  elements.reduce(
    (partialSum, currentElement) => (partialSum += currentElement),
    0
  );

export const getRoundedValue = (value: number) => +value.toPrecision(4);

export const getY = (parameters: {
  x: number;
  startPoint: Point;
  endPoint: Point;
}) => {
  const {
    x,
    startPoint: [startX, startY],
    endPoint: [endX, endY],
  } = parameters;
  const slope = (endY - startY) / (endX - startX);
  const yIntercept = startY - slope * startX;
  const y = slope * x + yIntercept;
  return getRoundedValue(y);
};

export const handleError = (error: unknown) => {
  console.error(
    `❌: ${error instanceof Error ? error.message : "Unexpected error occured"}`
  );
};

export const getOutput = ({
  labels,
  ranking,
}: {
  labels: string[];
  ranking: number[];
}) =>
  labels
    .map((label, index) => ({ label, value: ranking[index] }))
    .sort((a, b) => a.value - b.value);
