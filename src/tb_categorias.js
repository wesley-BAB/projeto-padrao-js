const Sequelize = require("sequelize")
const database = require('./db');

const tb_categorias = database.define("tb_categorias", {
    id_categoria:{
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    categoria: {
        type: Sequelize.STRING,
        allowNull: false,
    }
},{
    timestamps: false
});


module.exports = tb_categorias;