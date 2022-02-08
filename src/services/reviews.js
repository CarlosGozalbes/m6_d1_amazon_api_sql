import { Router } from "express";
import pool from "../utils/db/connect.js";

const reviewsRouter = Router();

reviewsRouter.get("/", async (req, res, next) => {
  try {
    const result = await pool.query(`SELECT * FROM reviews;`);
    res.send(result.rows);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

reviewsRouter.get("/:review_id", async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT * FROM reviews WHERE review_id=$1;`,
      [req.params.review_id]
    );
    if (result.rows[0]) {
      res.send(result.rows);
    } else {
      res.status(404).send({ message: "No such review." });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

reviewsRouter.post("/", async (req, res, next) => {
  try {
    const result = await pool.query(
      `INSERT INTO reviews(first_name,last_name) VALUES($1,$2) RETURNING *;`,
      [req.body.first_name, req.body.last_name]
    );
    res.send(result.rows[0]);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// reviewsRouter.put("/:review_id", async (req, res, next) => {
//   try {
//     const result = await pool.query(
//       `UPDATE reviews SET first_name=$1,last_name=$2 WHERE review_id=$3 RETURNING * ;`,
//       [req.body.first_name, req.body.last_name, req.params.review_id]
//     );
//     res.send(result.rows[0]);
//   } catch (error) {
//     res.status(500).send({ message: error.message });
//   }
// });

// dynamic sql update query generate

reviewsRouter.put("/:review_id", async (req, res, next) => {
  try {
    // first_name=$1,last_name=$2
    const query = `UPDATE reviews SET ${Object.keys(req.body)
      .map((key, i) => `${key}=$${i + 1}`)
      .join(",")} WHERE review_id=$${
      Object.keys(req.body).length + 1
    } RETURNING * ;`;
    const result = await pool.query(query, [
      ...Object.values(req.body),
      req.params.review_id,
    ]);
    res.send(result.rows[0]);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

reviewsRouter.delete("/:review_id", async (req, res, next) => {
  try {
    await pool.query(`DELETE FROM reviews WHERE review_id=$1;`, [
      req.params.review_id,
    ]);
    res.status(204).send();
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

export default reviewsRouter;
