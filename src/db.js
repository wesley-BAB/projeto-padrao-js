const Sequelize = require("sequelize");
const sequelize = new Sequelize('bd_novo', 'root', 'qwe123', {
    dialect: 'sqlite',
    storage: 'bd/database.sqlite',
    logging: false
});
module.exports = sequelize;