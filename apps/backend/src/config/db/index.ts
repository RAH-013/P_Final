import { sequelize } from "./connection.js";
import { seedUsers } from "./seed.js";
import "../../models/index.js";

export { sequelize };

export async function connectDB(): Promise<void> {
  await sequelize.authenticate();
  await sequelize.sync();
  await seedUsers();

  console.log("ORM: MySQL conectado correctamente (Sequelize)");
}
