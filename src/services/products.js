import { Router } from "express";
import pool from "../utils/db/connect.js";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";


const productsRouter = Router();

productsRouter.get("/", async (req, res, next) => {
  try {
    const result = await pool.query(`SELECT * FROM products;`);
    res.send(result.rows);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

productsRouter.get("/:product_id", async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT * FROM products WHERE product_id=$1;`,  //`SELECT product_id, name, description, brand, image_url, price, category, review_id, comment, rate FROM products INNER JOIN reviews USING(product_id) WHERE product_id=$1`
      [req.params.product_id]
    );
    if (result.rows[0]) {
      res.send(result.rows);
    } else {
      res.status(404).send({ message: "No such product." });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

productsRouter.get("/:product_id/reviews", async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT * FROM products WHERE product_id=$1 UNION SELECT reviews WHERE product_id=$1;`
    );
    res.send(result.rows);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

productsRouter.post("/", async (req, res, next) => {
  try {
    const result = await pool.query(
      `INSERT INTO products(name_,description_,image_url,price,category) VALUES($1,$2,$3,$4,$5) RETURNING *;`,
      [
        req.body.name_,
        req.body.description_,
        req.body.image_url,
        req.body.price,
        req.body.category
      ]
    );
    res.send(result.rows[0]);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// productsRouter.put("/:product_id", async (req, res, next) => {
//   try {
//     const result = await pool.query(
//       `UPDATE products SET first_name=$1,last_name=$2 WHERE product_id=$3 RETURNING * ;`,
//       [req.body.first_name, req.body.last_name, req.params.product_id]
//     );
//     res.send(result.rows[0]);
//   } catch (error) {
//     res.status(500).send({ message: error.message });
//   }
// });

//dynamic sql update query generate

productsRouter.put("/:product_id", async (req, res, next) => {
  try {
    // first_name=$1,last_name=$2
    const query = `UPDATE products SET ${Object.keys(req.body)
      .map((key, i) => `${key}=$${i + 1}`)
      .join(",")} WHERE product_id=$${
      Object.keys(req.body).length + 1
    } RETURNING * ;`;
    const result = await pool.query(query, [
      ...Object.values(req.body),
      req.params.product_id,
    ]);
    res.send(result.rows[0]);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

productsRouter.delete("/:product_id", async (req, res, next) => {
  try {
    await pool.query(`DELETE FROM products WHERE product_id=$1;`, [
      req.params.product_id,
    ]);
    res.status(204).send();
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

productsRouter.post("/:product_id",multer({
    storage: new CloudinaryStorage({ cloudinary, params: { folder: "amazon" } }),
  }).single("image_url"), async (req, res, next) => {
  try {
      console.log(req.file.filename);
    const image_url = req.file.path
    
    const insertData = "INSERT INTO products(image_url)VALUES(?)";
    db.query(insertData, [image_url], (err, result) => {
      if (err) throw err;
      console.log("file uploaded");
    });
  } catch (error) {
      next(error)
  }
  }
    
);



export default productsRouter;
