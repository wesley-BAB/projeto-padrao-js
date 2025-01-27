const express                               =       require('express')
const app                                   =       express()
const handlebars                            =       require('express-handlebars')
const Handlebars                            =       require('handlebars')
const database                              =       require('./src/db');
const tb_usuarios                           =       require('./src/usuarios')
const bodyParser                            =       require("body-parser")
const { where }                             =       require('sequelize')
const session                               =       require("express-session")
const flash                                 =       require('connect-flash')


app.engine('handlebars', handlebars.engine());
app.set('view engine', 'handlebars');
app.set('views', './views')
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));
app.use(flash())


app.get('/', function(req, res){
    res.render('home');
});
app.listen(3000);