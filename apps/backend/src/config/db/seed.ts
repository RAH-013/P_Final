import bcrypt from "bcryptjs";
import User from "../../models/User.js";
import { sequelize } from "../db/index.js";

const users = [
  {
    username: "admin",
    password: "Admin123!",
    role: "admin" as const,
  },
  {
    username: "usuario",
    password: "User123!",
    role: "user" as const,
  },
  {
    username: "otro",
    password: "Other123!",
    role: "user" as const,
  },
];

export async function seedUsers(): Promise<void> {
  try {
    await sequelize.authenticate();

    for (const user of users) {
      const exists = await User.findOne({
        where: { username: user.username },
      });

      if (exists) continue;

      const password = await bcrypt.hash(user.password, 12);

      await User.create({
        username: user.username,
        password,
        role: user.role,
      });
    }

    console.log("SEED: Usuarios creados correctamente");
  } catch (error) {
    console.error("Error al crear usuarios:", error);
    throw error;
  }
}
