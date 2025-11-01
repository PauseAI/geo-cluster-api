import { serve } from "@hono/node-server";
import app from ".";
import { generateRandomPoints } from "./lib/utils";
import { ServerType } from "@hono/node-server";

const PORT = 3000;
const USE_LOCAL_SERVER = false; // Set to false to test a remote server
const REMOTE_SERVER_URL = "https://geo-cluster-api.vercel.app"; // Replace with your remote server URL

async function runBenchmark() {
  console.log("Starting benchmark...");

  let server: ServerType | undefined;
  let targetUrl: string;

  if (USE_LOCAL_SERVER) {
    // Start the Hono server
    await new Promise<void>((resolve) => {
      server = serve(
        {
          fetch: app.fetch,
          port: PORT,
        },
        (info) => {
          console.log(`Local server started on http://localhost:${info.port}`);
          resolve();
        }
      );
    });
    targetUrl = `http://localhost:${PORT}/cluster`;
  } else {
    targetUrl = `${REMOTE_SERVER_URL}/cluster`;
    console.log(`Benchmarking remote server at ${targetUrl}`);
  }

  const numberOfPoints = 1000;
  const geojson = generateRandomPoints(numberOfPoints);
  const distance = 1000; // kilometers
  const unit = "kilometers";

  console.log(`Sending ${numberOfPoints} points to the /cluster endpoint...`);
  const startTime = process.hrtime.bigint();

  try {
    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ geojson, distance, unit }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `HTTP error! status: ${response.status}, body: ${errorText}`
      );
    }

    const result = await response.json();
    const endTime = process.hrtime.bigint();
    const elapsedTimeMs = Number(endTime - startTime) / 1_000_000;

    console.log(
      `Clustering request completed in ${elapsedTimeMs.toFixed(2)} ms.`
    );
    console.log(`Number of initial data points: ${geojson.features.length}`);
    const uniqueClusterIds = new Set(
      result.features
        .map((f: any) => f.properties?.cluster)
        .filter((c: any) => c !== undefined)
    );
    console.log(
      `Number of clusters with a ${distance} ${unit} limit: ${uniqueClusterIds.size}`
    );
  } catch (error: any) {
    console.error("Benchmark failed:", error.message);
  } finally {
    // Stop the Hono server if it was started locally
    if (USE_LOCAL_SERVER && server) {
      await new Promise<void>((resolve, reject) =>
        server!.close((err) => {
          if (err) {
            console.error("Error closing server:", err);
            reject(err);
          } else {
            console.log("Local server stopped.");
            resolve();
          }
        })
      );
    }
  }
  console.log("Benchmark finished.");
}

runBenchmark().catch(console.error);
