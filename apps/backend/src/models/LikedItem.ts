import {
  DataTypes,
  Model,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
} from "sequelize";
import { sequelize } from "../config/db/connection.js";

export type LikedMediaType = "movie" | "series";

export class LikedItem extends Model<
  InferAttributes<LikedItem>,
  InferCreationAttributes<LikedItem>
> {
  declare id: CreationOptional<number>;
  declare userId: number;
  declare externalId: string;
  declare mediaType: LikedMediaType;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

LikedItem.init(
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
    externalId: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    mediaType: {
      type: DataTypes.ENUM("movie", "series"),
      allowNull: false,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: "liked_items",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["userId", "mediaType", "externalId"],
      },
    ],
  },
);

export default LikedItem;
