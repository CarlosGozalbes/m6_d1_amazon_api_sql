import Sequelize from "sequelize";

const { DATABASE_URL, POSTGRESQL_URI } = process.env;

const isServerProduction = NODE_ENV === "production"
const sslOption = is isServerProduction? {dialectOptions: {
  ssl: {
    require: true,
    rejectUnauthorized: false,
  }
}}:{}



const sequelize = new Sequelize(DATABASE_URL, { dialect: "postgres" });

export const authenticateDatabase = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true, logging: false });
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

export default sequelize;
