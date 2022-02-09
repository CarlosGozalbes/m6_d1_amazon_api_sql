import express from "express";
import productsRoutes from "./services/products/routes.js";
import reviewsRoutes from "./services/reviews/routes.js";
import { authenticateDatabase } from "./utils/db/connect.js";

const server = express()

const {PORT=5001} = process.env

server.use(express.json());

server.use("/products", productsRoutes);
server.use("/reviews", reviewsRoutes) 

server.listen(PORT, () => {
  authenticateDatabase()
   console.log(`Server is listening on port ${PORT}`);
});

server.on("error", (error) => {
  console.log(`Server is stopped : ${error}`);
});