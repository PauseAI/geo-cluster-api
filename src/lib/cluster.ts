import * as turf from "@turf/turf";
import { FeatureCollection, Point } from "geojson";
import { agnes } from "ml-hclust";
import { Units } from "@turf/turf";

// Custom distance function using Turf.js
export function turfDistance(
  a: number[],
  b: number[],
  unit: Units = "kilometers"
): number {
  const point1 = turf.point(a);
  const point2 = turf.point(b);
  // Returns distance in kilometers by default
  return turf.distance(point1, point2, { units: unit });
}

export function cluster(
  featureCollection: FeatureCollection<Point>,
  distanceLimit: number = 1000 // default 1000 km limit
): FeatureCollection<Point, { cluster?: number; clusterSize?: number }> {
  if (
    !featureCollection ||
    !featureCollection.features ||
    featureCollection.features.length === 0
  ) {
    return turf.featureCollection([]);
  }

  const coordinates: number[][] = featureCollection.features.map(
    (feature) => feature.geometry.coordinates
  );

  // Perform hierarchical clustering
  const clusters = agnes(coordinates, {
    method: "complete",
    distanceFunction: turfDistance,
  });

  // Cut the clusters at the specified distance limit
  const limitedClusters = clusters.cut(distanceLimit);

  // Filter out clusters with only one point
  const filteredClusters = limitedClusters.filter(
    (cluster) => cluster.indices().length > 1
  );

  // Map original features to their clusters
  const clusteredFeatures = featureCollection.features.map((feature, index) => {
    const newProperties = { ...feature.properties };
    for (const [i, cluster] of filteredClusters.entries()) {
      if (cluster.indices().includes(index)) {
        newProperties.cluster = i;
        newProperties.clusterSize = cluster.indices().length;
        break;
      }
    }
    return turf.point(feature.geometry.coordinates, newProperties);
  });

  return turf.featureCollection(clusteredFeatures);
}
