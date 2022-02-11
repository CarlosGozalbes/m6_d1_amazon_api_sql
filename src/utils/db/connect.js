import Sequelize from "sequelize";

const { DATABASE_URL } = process.env;

const sequelize = new Sequelize(DATABASE_URL, { dialect: "postgres",dialectOptions: {         // IMPORTANT
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    }});

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
