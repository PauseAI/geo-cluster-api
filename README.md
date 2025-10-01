# Geo-Cluster API

> [!WARNING]  
> The application is not meant for external use. We will not answer support requests and might not address issues that don't affect us.

This API provides geospatial point clustering functionality. It groups geographical points based on their proximity, returning clustered points with assigned cluster IDs and sizes. The implementation uses Hono.js, Turf.js, and `ml-hclust`.

## Functionality

- **Geospatial Point Clustering**: Implements hierarchical clustering (Agglomerative Nesting) to group points within a specified distance limit, utilizing Turf.js for distance calculations.
- **API Framework**: Built with Hono.js.
- **Language**: Developed in TypeScript for type safety.
- **Benchmarking**: Includes a script for performance evaluation against a local or remote server.

## Technologies Used

- Hono.js
- Turf.js
- ml-hclust
- TypeScript
- tsx

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- pnpm (or npm/yarn)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/geo-cluster-api.git
   cd geo-cluster-api
   ```
2. Install dependencies:
   ```bash
   pnpm install
   ```

### Running the API

To start the development server:

```bash
pnpm start
```

The API will be running on `http://localhost:3000`.

## API Endpoints

### `POST /cluster`

Clusters a collection of GeoJSON `Point` features based on a specified distance limit.

#### Request

- **Method**: `POST`
- **URL**: `http://localhost:3000/cluster`
- **Headers**:
  - `Content-Type: application/json`
- **Body**: A JSON array containing two elements:
  1. `geojson`: A GeoJSON `FeatureCollection` of `Point` features.
  2. `distance`: A number representing the maximum distance (in kilometers) between points to be considered part of the same cluster.

**Example Request Body:**

```json
[
  {
    "type": "FeatureCollection",
    "features": [
      {
        "type": "Feature",
        "properties": {},
        "geometry": {
          "type": "Point",
          "coordinates": [10.0, 20.0]
        }
      },
      {
        "type": "Feature",
        "properties": {},
        "geometry": {
          "type": "Point",
          "coordinates": [10.5, 20.5]
        }
      },
      {
        "type": "Feature",
        "properties": {},
        "geometry": {
          "type": "Point",
          "coordinates": [50.0, 60.0]
        }
      }
    ]
  },
  100
]
```

#### Response

- **Status**: `200 OK` on success, `400 Bad Request` if `geojson` or `distance` are missing, `500 Internal Server Error` on other errors.
- **Body**: A GeoJSON `FeatureCollection` of `Point` features. Each feature will have additional `properties`:
  - `cluster`: (Optional) A number representing the ID of the cluster the point belongs to. Present only if the point is part of a cluster with more than one point.
  - `clusterSize`: (Optional) A number representing the total number of points in the cluster. Present only if the point is part of a cluster with more than one point.

**Example Response Body:**

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "cluster": 0,
        "clusterSize": 2
      },
      "geometry": {
        "type": "Point",
        "coordinates": [10.0, 20.0]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "cluster": 0,
        "clusterSize": 2
      },
      "geometry": {
        "type": "Point",
        "coordinates": [10.5, 20.5]
      }
    },
    {
      "type": "Feature",
      "properties": {},
      "geometry": {
        "type": "Point",
        "coordinates": [50.0, 60.0]
      }
    }
  ]
}
```

## Benchmarking

The project includes a benchmarking script to evaluate the performance of the clustering API.

To run the benchmark:

```bash
pnpm benchmark
```

You can configure the benchmark to test against a local server or a remote server by modifying `src/benchmark.ts`:

```typescript
// src/benchmark.ts
const USE_LOCAL_SERVER = false; // Set to true to test local, false for remote
const REMOTE_SERVER_URL = 'https://geo-cluster-api.vercel.app'; // Replace with your remote server URL
```
