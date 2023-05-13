import { readFile } from "fs/promises";
import { resolve } from "path";
import { argv } from "process";
import type { CriteriaType, Point } from "./types";
import { getOutput, getRoundedValue, getSum, getY, handleError } from "./utils";

const getInput = async () => {
  const inputFilePath = resolve(argv[2]);
  const inputData = await readFile(inputFilePath, "utf-8");
  const inputString = Buffer.from(inputData).toString("utf-8");

  return inputString
    .replaceAll("\r\n", "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "");
};

const getCriteria = (input: string[]) => {
  const criteria: CriteriaType = input
    .filter((line: string) => line.match(/^[+-].+/))
    .map((line) => {
      const [typeSign, label, weightString, ...unparsedWaypoints] =
        line.split(" ");

      const isTypeSignValid = /[\+\-]/.test(typeSign);
      if (!isTypeSignValid) {
        throw new Error(
          `The function type sign for criteria ${label} is invalid - expected '+' or '-' but received '${typeSign}'.`
        );
      }

      const isDecreasing = typeSign === "-";
      const weight = +weightString;

      const waypoints = unparsedWaypoints.map((line) => {
        const valueStrings = line.slice(1, line.length - 1).split(",");
        const values = valueStrings.map((valueString) => +valueString) as [
          number,
          number
        ];

        return values;
      });

      const hasValidWaypoints = waypoints.every((waypoint, index) => {
        if (index === 0) {
          return true;
        }

        const currentY = waypoint[1];
        const previousY = waypoints[index - 1][1];

        const isWaypointValid = isDecreasing
          ? currentY < previousY
          : currentY > previousY;

        return isWaypointValid;
      });

      if (!hasValidWaypoints) {
        throw new Error(
          `Waypoints are invalid, areas in criteria ${label} are ${
            isDecreasing ? "not " : ""
          }decreasing but the function is a type of ${
            isDecreasing ? "loss" : "profit"
          }.`
        );
      }

      return {
        weight,
        waypoints,
      };
    });

  const hasValidWeights = getSum(criteria.map(({ weight }) => weight)) === 1;

  if (!hasValidWeights) {
    throw new Error(
      `Weights are invalid, the sum of weights should be 1 but it's ${getRoundedValue(
        getSum(criteria.map(({ weight }) => weight))
      )}`
    );
  }

  return criteria;
};

const getMatrix = (input: string[]) => {
  const [height, width] = input.slice(0, 2).map((valueString) => +valueString);

  const data = input.filter((line) => {
    const isNotSize = line.length > 1;
    const isNotCriteria = !/^[+-].+/.test(line);

    return isNotSize && isNotCriteria;
  });

  const labels = data.map((line) => line.split(" ").slice(0, 1)[0]);
  const matrix = data.map((line) => {
    const stringValues = line.split(" ").slice(1);
    const values = stringValues.map((value) => +value);

    return values;
  });

  const isDataValid =
    !matrix.flat().some((value) => isNaN(value) || typeof value !== "number") &&
    matrix.length === height &&
    matrix.every((row) => row.length === width);

  if (!isDataValid) {
    throw new Error(
      `Variants data is invalid - declared matrix size (${height}, ${width}) does not reflect the size of actual matrix or data type for each value is not integer.`
    );
  }

  return { labels, matrix };
};

const getBoundingWaypoints = (x: number, waypoints: Point[]) => {
  const waypointXValues = waypoints.map(([waypointX]) => waypointX);

  const lessThanX = waypointXValues.filter((waypointX) => waypointX < x);
  const moreThanX = waypointXValues.filter((waypointX) => waypointX >= x);

  const startPointIndex = waypointXValues.indexOf(Math.max(...lessThanX));
  const endPointIndex = waypointXValues.indexOf(Math.min(...moreThanX));

  return {
    startPoint:
      waypoints[startPointIndex === -1 ? startPointIndex + 1 : startPointIndex],
    endPoint:
      waypoints[startPointIndex === -1 ? endPointIndex + 1 : endPointIndex],
  };
};

const main = async () => {
  try {
    console.log("🏆 Simple Ranker\nKamil Pyszkowski, 149730\n2023\n");
    console.log("🚀 Reading input...");
    const input = await getInput();

    console.log("🚀 Parsing input...");
    const { labels, matrix } = getMatrix(input);
    const criteria = getCriteria(input);

    console.log("🚀 Performing calculations...");
    const yValues = matrix.map((row) =>
      row.map((x, index) => {
        const { waypoints } = criteria[index];
        const { startPoint, endPoint } = getBoundingWaypoints(x, waypoints);

        return getY({ x, startPoint, endPoint });
      })
    );

    const weights = criteria.map(({ weight }) => weight);

    const weightedYValues = yValues.map((row) =>
      row.map((y, index) => y * weights[index])
    );

    const ranking = weightedYValues.map((row) => getRoundedValue(getSum(row)));

    const output = getOutput({ labels, ranking });

    console.log("\n✅ Calculations completed!\n\n🍪 Results:");

    console.table(output);
  } catch (error) {
    handleError(error);
  }
};

main();
