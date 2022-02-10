import { DataTypes } from "sequelize";

import sequelize from "../../utils/db/connect.js";

import Sequelize from "sequelize";

import Product from "./model.js";

import User from "../users/model.js";

const Review = sequelize.define(
  "review",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    rate: {
      type: DataTypes.INTEGER,
      validate: {
        isInt: true,
      },
    },
  },
  { underscored: true }
);

Product.hasMany(Review, {
  onDelete: "CASCADE",
});

Review.belongsTo(Product);


Review.belongsTo(User, { through: "user_reviews" });
User.belongsToMany(Review, { through: "user_reviews" });

export default Review;
