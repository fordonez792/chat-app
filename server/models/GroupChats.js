module.exports = (sequelize, DataTypes) => {
  // Creates a table with the given columns in database
  const GroupChats = sequelize.define("GroupChats", {
    name: {
      type: DataTypes.STRING,
    },
    hasMessages: {
      type: DataTypes.BOOLEAN,
      defaultValue: 0,
    },
    socketRoom: {
      type: DataTypes.STRING,
    },
  });

  GroupChats.associate = (models) => {
    GroupChats.belongsTo(models.Users, {
      foreignKey: "creatorId",
    });
    GroupChats.hasMany(models.GroupChatMessages, {
      foreignKey: "groupChatId",
      onDelete: "cascade",
    });
  };

  return GroupChats;
};
