import { Router } from "express";
import User from "./model.js";
import Product from "../products/model.js";
import Cart from "../products/cart.model.js";

const usersRoutes = Router();

usersRoutes.get("/", async (req, res, next) => {
  try {
    /**
     * getting all rows, you can use where:{} for filtering and order etc.
     */
    const users = await User.findAll({});
    res.send(users);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

usersRoutes.get("/:id", async (req, res, next) => {
  try {
    /**
     * if its not found , it returns null!
     * always check first
     */
    const singleUser = await User.findByPk(req.params.id);
    if (singleUser) {
      res.send(singleUser);
    } else {
      res.status(404).send({ error: "No such User" });
    }
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

usersRoutes.post("/", async (req, res, next) => {
  try {
    const newUser = await User.create(req.body);
    res.send(newUser);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

usersRoutes.put("/:id", async (req, res, next) => {
  try {
    /**
     *  if you add returning:true , it returns updatedObject
     *  returns an array [howManyRowsChanged,updatedObject]
     *  since we are updating by id , we expect one object to be updated
     *  therefore we are checking if howManyRowsChanged value is truthy
     */
    const [success, updateUser] = await User.update(req.body, {
      where: { id: req.params.id },
      returning: true,
    });
    if (success) {
      res.send(updateUser);
    } else {
      res.status(404).send({ message: "no such User" });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

usersRoutes.delete("/:id", async (req, res, next) => {
  try {
    await User.destroy({
      where: {
        id: req.params.id,
      },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// putting in the cart
usersRoutes.post('/:userId/cart' , async(req, res, next) => {
  try {
    const user = await User.findByPk(req.params.userId)
    const product = await Product.findByPk(req.body.productId)
    if(user && product){
      const item = await Cart.create({
        productId : product.id,
        userId : req.params.userId,
      })
      res.status(204).send(item) 
    } else {
      res.status(404).send({msg:'invalid user or product id'}) 

    }
  } catch (error) {
    
  }
})
  // getting the items in the cart
  usersRoutes.get('/:userId/cart', async(req, res, next)=> {
    try {
      const totalItems = await Cart.count({
        where:{userId:req.params.userId},
      });
      const totalPrice = await Cart.sum("product.price",{
        where:{userId:req.params.userId},
        include:[{model:Product, attributes:[]}]
      });
      const user = await User.findByPk(req.params.userId);

      if(user){
        const cart = await Cart.findAll({
          where :{userId:req.params.userId},
          include :[Product],
          attributes : [
            [
              sequelize.cast(sequelize.fn("count",sequelize.col("product.id")),"integer"),
              "quantity"
            ],
            [
              sequelize.cast(sequelize.fn("sum",sequelize.col("product.price")),"integer"),
              "total_per_item"
            ],
          ] ,
          group : ["product.id"]
        });
        res.status(200).send({totalItems, totalPrice, cart});
      } else { 
        res.status(400).send({msg:"invalid user id or product id"})
      }
    } catch (error) {
      res.status(500).send({msg:error.message})
    }
  })
  //delete from cart
usersRoutes.delete("/:userId/cart/:cartId", async (req, res, next) => {
  try {
    await Cart.destroy({
      where: {
        id: req.params.cartId,
      
      },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
    
});

export default usersRoutes;
