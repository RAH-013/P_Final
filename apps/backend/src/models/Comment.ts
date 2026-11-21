import {
  DataTypes,
  Model,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
} from "sequelize";
import { sequelize } from "../config/db/connection.js";

export type CommentMediaType = "movie" | "series";

export class Comment extends Model<
  InferAttributes<Comment>,
  InferCreationAttributes<Comment>
> {
  declare id: CreationOptional<number>;
  declare userId: number;
  declare externalId: string;
  declare mediaType: CommentMediaType;
  declare content: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Comment.init(
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
    content: {
      type: DataTypes.STRING(1000),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 1000],
      },
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: "comments",
    timestamps: true,
    indexes: [
      {
        fields: ["externalId", "mediaType"],
      },
      {
        fields: ["userId"],
      },
    ],
  },
);

export default Comment;
