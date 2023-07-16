module.exports = (sequelize, DataTypes) => {
  // Creates a table with the given columns in database
  const Friendship = sequelize.define("Friendship", {
    status: {
      type: DataTypes.STRING,
    },
    hasMessages: {
      type: DataTypes.BOOLEAN,
      defaultValue: 0,
    },
  });

  Friendship.associate = (models) => {
    Friendship.belongsTo(models.Users, {
      foreignKey: "fromUserId",
    }),
      Friendship.belongsTo(models.Users, {
        foreignKey: "toUserId",
      });
    Friendship.hasMany(models.ChatMessages, {
      foreignKey: "friendshipId",
      onDelete: "cascade",
    });
  };

  return Friendship;
};
