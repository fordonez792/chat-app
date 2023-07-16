module.exports = (sequelize, DataTypes) => {
  const GroupChatMessages = sequelize.define("GroupChatMessages", {
    message: DataTypes.TEXT,
    seenByMembers: DataTypes.STRING,
  });

  GroupChatMessages.associate = (models) => {
    GroupChatMessages.belongsTo(models.Users, {
      foreignKey: "authorId",
    });
  };

  return GroupChatMessages;
};
