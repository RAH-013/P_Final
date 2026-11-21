import {
  DataTypes,
  Model,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
} from "sequelize";
import { sequelize } from "../config/db/connection.js";

export class UserGenre extends Model<
  InferAttributes<UserGenre>,
  InferCreationAttributes<UserGenre>
> {
  declare id: CreationOptional<number>;
  declare userId: number;
  declare genre: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

UserGenre.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    genre: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: "user_genres",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["userId", "genre"],
      },
    ],
  },
);

export default UserGenre;
