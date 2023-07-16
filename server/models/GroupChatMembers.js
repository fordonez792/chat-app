module.exports = (sequelize, DataTypes) => {
  // Creates a table with the given columns in database
  const GroupChatMembers = sequelize.define("GroupChatMembers", {});

  GroupChatMembers.associate = (models) => {
    GroupChatMembers.belongsTo(models.GroupChats, {
      foreignKey: "groupChatId",
      onDelete: "cascade",
    });
    GroupChatMembers.belongsTo(models.Users, {
      foreignKey: "userId",
    });
  };

  return GroupChatMembers;
};
