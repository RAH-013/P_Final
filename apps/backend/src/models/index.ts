import User from "./User.js";
import UserGenre from "./UserGenre.js";
import LikedItem from "./LikedItem.js";
import Recommendation from "./Recommendation.js";
import Comment from "./Comment.js";

User.hasMany(UserGenre, {
  foreignKey: "userId",
  as: "genres",
  onDelete: "CASCADE",
});

UserGenre.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

User.hasMany(LikedItem, {
  foreignKey: "userId",
  as: "likedItems",
  onDelete: "CASCADE",
});

LikedItem.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

User.hasMany(Recommendation, {
  foreignKey: "userId",
  as: "recommendations",
  onDelete: "CASCADE",
});

Recommendation.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

User.hasMany(Comment, {
  foreignKey: "userId",
  as: "comments",
  onDelete: "CASCADE",
});

Comment.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

export { User, UserGenre, LikedItem, Recommendation, Comment };
