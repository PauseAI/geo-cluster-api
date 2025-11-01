import { Point, FeatureCollection } from "geojson";
import * as turf from "@turf/turf";

export function generateRandomCoordinates(count: number): number[][] {
  const coordinates: number[][] = [];
  for (let i = 0; i < count; i++) {
    // Generate random longitude (-180 to 180) and latitude (-90 to 90)
    const longitude = Math.random() * 360 - 180;
    const latitude = Math.random() * 180 - 90;
    coordinates.push([longitude, latitude]);
  }
  return coordinates;
}

export function generateRandomPoints(count: number): FeatureCollection<Point> {
  const randomCoordinates = generateRandomCoordinates(count);
  return {
    type: "FeatureCollection",
    features: randomCoordinates.map((coord) => turf.point(coord)),
  };
}
