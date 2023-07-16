module.exports = (sequelize, DataTypes) => {
  // Creates a table with the given columns in database
  const Users = sequelize.define("Users", {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
    },
    email: {
      type: DataTypes.STRING,
    },
    verified: {
      type: DataTypes.BOOLEAN,
    },
    city: {
      type: DataTypes.STRING,
    },
    country: {
      type: DataTypes.STRING,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "OFFLINE",
    },
    socketID: {
      type: DataTypes.STRING,
    },
  });

  return Users;
};
