
import express from "express";
import hotelsRoute from "./hotels.routes.js";
import usersRoute from "./users.routes.js";
const app = express();

app.use("/v1", hotelsRoute);
app.use("/v1", usersRoute);

export default app;