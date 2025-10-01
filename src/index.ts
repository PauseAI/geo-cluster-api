import { Hono } from "hono";
import { cluster } from "./cluster";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hono API is running!");
});

app.post("/cluster", async (c) => {
  try {
    const [geojson, distance] = await c.req.json();
    if (!geojson || !distance) {
      return c.json(
        { error: "Missing geojson or distance in request body" },
        400
      );
    }
    const result = cluster(geojson, distance);
    return c.json(result);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

export default app;
