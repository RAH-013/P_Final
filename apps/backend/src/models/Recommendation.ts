import {
  DataTypes,
  Model,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
} from "sequelize";
import { sequelize } from "../config/db/connection.js";

export type RecommendationSource = "gemini" | "fallback";
export type RecommendationMediaType = "movie" | "series";

export class Recommendation extends Model<
  InferAttributes<Recommendation>,
  InferCreationAttributes<Recommendation>
> {
  declare id: CreationOptional<number>;
  declare userId: number;
  declare externalId: string;
  declare mediaType: RecommendationMediaType;
  declare profileVersion: number;
  declare reason: string;
  declare score: CreationOptional<number | null>;
  declare source: RecommendationSource;
  declare modelName: CreationOptional<string | null>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Recommendation.init(
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
    profileVersion: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    score: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    source: {
      type: DataTypes.ENUM("gemini", "fallback"),
      allowNull: false,
    },
    modelName: {
      type: DataTypes.STRING(64),
      allowNull: true,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: "recommendations",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["userId", "profileVersion", "mediaType", "externalId"],
      },
    ],
  },
);

export default Recommendation;
