import { Router } from "express";
import Product from "./model.js";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import { Op } from "sequelize";
import Review from "./reivews.model.js";
import Category from "./categories.model.js";
import User from "../users/model.js";

const productsRouter = Router();

productsRouter.get("/", async (req, res, next) => {
  try {
    const { offset = 0, limit = 9 } = req.query;
    const totalBlog = await Product.count({});
    const products = await Product.findAll({
      include: [User, Review, Category],
      offset,
      limit,
      order: [
        ["name", "DESC"],
        ["description", "ASC"],
      ],
    });
    res.send(products);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

productsRouter.get("/search", async (req, res, next) => {
  try {
    console.log({ query: req.query });
    const products = await Product.findAll({
      where: {
        [Op.or]: [
          {
            name: {
              [Op.iLike]: `%${req.query.q}%`,
            },
          },
          {
            description: {
              [Op.iLike]: `%${req.query.q}%`,
            },
          },
          {
            price: {
              [Op.between]: [req.query.f || 0, req.query.t || Infinity],
            },
          },
        ],
      },
    });
    res.send(products);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

productsRouter.get("/:product_id", async (req, res, next) => {
  try {
    const singleProduct = await Product.findByPk(req.params.id);
    if (singleProduct) {
      res.send(singleProduct);
    } else {
      res.status(404).send({ error: "No such product" });
    }
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

/* productsRouter.get("/:product_id/reviews", async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT * FROM products WHERE product_id=$1 UNION SELECT reviews WHERE product_id=$1;`
    );
    res.send(result.rows);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
}); */

productsRouter.post("/", async (req, res, next) => {
  try {
    const newProduct = await Product.create(req.body);
    if (req.body.categories) {
      for await (const categoryName of req.body.categories) {
        const category = await Category.create({ name: categoryName });
        await newProduct.addCategory(category, {
          through: { selfGranted: false },
        });
      }
    }
    const productWithCategory = await Product.findOne({
      where: { id: newProduct.id },
      include: [Category, User, Review],
    });
    res.send(productWithCategory);
  } catch (error) {
    res.status(500).send({ error: error.message });
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

/* productsRouter.put("/:product_id", async (req, res, next) => {
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
}); */

productsRouter.put("/:product_id", async (req, res, next) => {
  try {
    //
    const [success, updateProduct] = await Product.update(req.body, {
      where: { id: req.params.id },
      returning: true,
    });
    if (success) {
      res.send(updateProduct);
    } else {
      res.status(404).send({ message: "no such product" });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

productsRouter.delete("/:product_id", async (req, res, next) => {
  try {
    await Product.destroy({
      where: {
        id: req.params.id,
      },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

/* productsRouter.post("/:product_id",multer({
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
); */

productsRouter.get("/stats", async (req, res, next) => {
  try {
    const stats = await Review.findAll({
      // select list : what you want to get ?
      attributes: [
        [
          sequelize.cast(
            // cast function converts datatype
            sequelize.fn("count", sequelize.col("product_id")), // SELECT COUNT(blog_id) AS total_comments
            "integer"
          ),
          "numberOfReviews",
        ],
      ],
      group: ["product_id", "product.id", "product.review.id"],
      include: [{ model: Product, include: [Review] }], // <-- nested include
    });
    res.send(stats);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
})

productsRouter.post("/:id/reviews", async (req, res, next) => {
  try {
    const newReview = await Review.create({
      ...req.body,
      productId: req.params.id,
    });
    res.send(newReview);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

productsRouter.delete("/:id/reviews/:reviewId", async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (product) {
      const review = await Review.findByPk(req.params.categoryId);

      await product.removeCategory(review);

      const productWithReview = await product.findOne({
        where: { id: req.params.id },
        include: [Category, User, Review],
      });
      res.send(productWithReview);
    } else {
      res.status(404).send({ error: "Product not found" });
    }
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});


productsRouter.post("/:id/category", async (req, res, next) => {
  try {
    
    const product = await product.findByPk(req.params.id);
    if (product) {
     
      const category = await Category.create(req.body);
   
      await product.addCategory(category, { through: { selfGranted: false } });
    
      res.send(category);
    } else {
      res.status(404).send({ error: "Product not found" });
    }
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

productsRouter.delete("/:id/category/:categoryId", async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (product) {
      
      const category = await Category.findByPk(req.params.categoryId);
      
      await product.removeCategory(category);
     
      const productWithCategory = await product.findOne({
        where: { id: req.params.id },
        include: [Category, User, Review],
      });
      res.send(productWithCategory);
    } else {
      res.status(404).send({ error: "Product not found" });
    }
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

export default productsRouter;
