import Sequelize from "sequelize";

const { POSTGRESQL_URI } = process.env;

const sequelize = new Sequelize(POSTGRESQL_URI, { dialect: "postgres" });

export const authenticateDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

export default sequelize;
