const Sequelize = require("sequelize")
const database = require('./db');

const tb_registro = database.define("tb_registro", {
    id_registro:{
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    data_vencimento: {
        type: Sequelize.STRING
    },
    data_compra: {
        type: Sequelize.STRING
    },
    tipo: {
        type: Sequelize.STRING
    },
    estabelecimento: {
        type: Sequelize.STRING
    },
    valor: {
        type: Sequelize.STRING
    },
    parcelas: {
        type: Sequelize.STRING
    },
    n_parcelas: {
        type: Sequelize.STRING
    },
    categoria: {
        type: Sequelize.STRING
    },
    status_pagamento: {
        type: Sequelize.STRING
    },
    usuario: {
        type: Sequelize.STRING
    }
},{
    timestamps: false
});


module.exports = tb_registro;