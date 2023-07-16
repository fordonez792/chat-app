module.exports = (sequelize, DataTypes) => {
  const ChatMessages = sequelize.define("ChatMessages", {
    author: DataTypes.STRING,
    message: DataTypes.TEXT,
    seen: DataTypes.BOOLEAN,
  });

  return ChatMessages;
};
