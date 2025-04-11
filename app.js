(async () => {
    const sequelize = require('./src/db');
    const tb_usuarios = require('./src/tb_usuarios');
    const tb_registro = require('./src/tb_registro');
    const tb_categorias = require('./src/tb_categorias');
    await (sequelize, tb_usuarios, tb_registro, tb_categorias).sync()

    const express = require('express')
    const app = express()
    const handlebars = require('express-handlebars')
    const Handlebars = require('handlebars')
    const bodyParser = require("body-parser")
    const session = require("express-session")
    const flash = require('connect-flash');
    const axios = require('axios');
    const path = require('path');
    //const https = require('https');

    app.use("/img", express.static(path.join(__dirname, "/img")));
    app.use(bodyParser.urlencoded({ limit: 1024 * 1024 * 10, extended: true }));
    app.use(express.json({ limit: 1024 * 1024 * 10, type: 'application/json' }))
    app.use(express.urlencoded({ extended: true, limit: 1024 * 1024 * 10, type: 'application/x-www-form-urlencoded' }))
    app.use(flash())
    app.engine('handlebars', handlebars.engine({
        defaultLayout: 'main',
        runtimeOptions: {
            allowProtoPropertiesByDefault: true,
            allowProtoMethodsByDefault: true,
        }, 
    }));

    app.set('view engine', 'handlebars');
    app.set('views', './views')
    app.use(session({
        secret: '123456',
        resave: true,
        saveUninitialized: true,
        cookie: { 
            maxAge: 12 * 60 * 60 * 1000 // 12 horas em milissegundos 
        }
    }));

    function addMonthsToDate(date, months) {
        var newDate = new Date(date);
        newDate.setMonth(newDate.getMonth() + months);
        return newDate;
    }

    

   





    app.get('/reset_senha', (req, res) => {
        res.render('reset_senha', { layout: 'login' })
    })

    app.post('/reset_senha', (req, res) => {
        (async() => {
            let post_email = req.body.email
            const selectUsuario = await tb_usuarios.findOne({
                where: {
                    email: post_email
                },
            })
            if(selectUsuario){
                let senha = selectUsuario.senha
                EnviarEmail(post_email, "Solicitação de senha", `Senha atual: ${senha}`)
            }
        
            res.render('login', { layout: 'login', msg: 'Enviamos um email pra você, qualquer problema contate um administrador'} )
        })()
    })

    app.post('/alterar_senha', (req, res) => {
        (async() => {
            let atual_senha = req.body.atual_senha
            let nova_senha = req.body.nova_senha
            let confirma_senha = req.body.confirma_senha
            
            let id = req.body.id

            const contador = await tb_usuarios.count({
                where: {
                    id: id,
                    senha: atual_senha
                },
            })

            if(nova_senha != confirma_senha){
                res.redirect('home?msg=Senha1')
            }else if(contador == 1){
                const alterar_senha = tb_usuarios.update({
                    senha: nova_senha
                },{
                    where:{
                        id: id
                    }
                })
                res.render('login', { layout: 'login', msg: 'Senha Alterada' })
            }else{
                res.redirect('home?msg=Senha')
            }

        })()
    })




    //redireciona /login para pagina de login
    app.get('/login', function (req, res) {
        res.render('login', { layout: 'login' });
    });


//Valida sessão de login
app.post('/login', async (req, res) => {
        let post_email = req.body.email
        let post_senha = req.body.senha
       
        const selectUsuario = await sequelize.query('SELECT * FROM tb_usuarios WHERE email = ? AND senha = ?', {
            replacements: [post_email, post_senha],
            type: sequelize.QueryTypes.SELECT // Adicionando tipo à consulta
        });

        const dataAtual = new Date();
        let MesAtual = (dataAtual.getMonth() + 1).toString().padStart(2, '0');

        if (selectUsuario != '') {
            req.session.loggedIn = true
            req.session.sessao_email = selectUsuario[0].email
            req.session.sessao_id = selectUsuario[0].id
            req.session.sessao_nome = selectUsuario[0].nome
            req.session.sessao_mesAtual = MesAtual
            res.redirect('home');
        } else {
            req.session.loggedIn = false
            res.render('login', { layout: 'login', msg: 'Usuário e senha inválido'});
        }
})

//Validação de sessão
app.use((req, res, next) => {
    if (req.session.loggedIn) {
        res.locals.session = req.session;
        next()
    } else {
        res.redirect('/login')
    }
})

//Caso não tenha nada preenchindo na url direciona para tela de login
app.get('/', function (req, res) {
    res.redirect('home');
});

//Redireciona home para tela inicial
app.get('/home', async (req, res) => {
    const response = await axios.get('https://economia.awesomeapi.com.br/json/last/USD-BRL,EUR-BRL');
    const dolar = response.data.USDBRL;
    const euro = response.data.EURBRL;

console.log(dolar)

    let mes = req.query.id
    if(req.query.id){
        mesAtual = req.query.id
    }else{
        mesAtual = req.session.sessao_mesAtual
    }

    const listaCategorias = await sequelize.query(`select * from tb_categorias order by categoria asc`, {type: sequelize.QueryTypes.SELECT})

    const listaRegistro = await sequelize.query(`select * from tb_registros where strftime('%m', data_vencimento) = '${mesAtual}'
    AND strftime('%Y', data_vencimento) = strftime('%Y', DATE('now'));`, {type: sequelize.QueryTypes.SELECT})

    const listaTipos = await sequelize.query(`select tipo, 
    SUM(CAST(REPLACE(Valor, ',', '.') AS REAL)) as valorTotal
    from tb_registros where strftime('%m', data_vencimento) = '${mesAtual}'
    AND strftime('%Y', data_vencimento) = strftime('%Y', DATE('now')) GROUP BY tipo`, {type: sequelize.QueryTypes.SELECT})

    const listaSaidas = await sequelize.query(`select tipo, 
    SUM(CAST(REPLACE(Valor, ',', '.') AS REAL)) as valorTotal
    from tb_registros where tipo <> 'Entrada' and strftime('%m', data_vencimento) = '${mesAtual}'
    AND strftime('%Y', data_vencimento) = strftime('%Y', DATE('now'))`, {type: sequelize.QueryTypes.SELECT})

    const listaEntradas = await sequelize.query(`select tipo, 
    SUM(CAST(REPLACE(Valor, ',', '.') AS REAL)) as valorTotal
    from tb_registros where tipo = 'Entrada' and strftime('%m', data_vencimento) = '${mesAtual}'
    AND strftime('%Y', data_vencimento) = strftime('%Y', DATE('now'))`, {type: sequelize.QueryTypes.SELECT})

    const listaCategoria = await sequelize.query(`select categoria, 
    ROUND(SUM(CAST(REPLACE(Valor, ',', '.') AS REAL)), 2) as valorTotal
    from tb_registros where strftime('%m', data_vencimento) = '${mesAtual}'
    AND strftime('%Y', data_vencimento) = strftime('%Y', DATE('now')) GROUP BY categoria ORDER BY valorTotal desc`, {type: sequelize.QueryTypes.SELECT})

    let saldo = listaEntradas[0].valorTotal - listaSaidas[0].valorTotal
    let saldoFinal = saldo.toFixed(2)

    let saldoCategoria = listaCategoria[0].valorTotal
    let SaldoCategoriaFinal = saldoCategoria.toFixed(2)


    res.render('home', {listaRegistro, listaTipos, listaSaidas, listaEntradas, saldoFinal, listaCategoria, mesAtual, listaCategorias, dolar, euro});
});

app.post('/registrar', async (req,res)=>{
    const valores = req.body
    


    if(valores.parcelas == 'on'){
        
        var data = req.body.data_vencimento
        var date = new Date(req.body.data_vencimento); // Substitua pela data desejada
        const nParcelas = parseInt(valores.n_parcelas, 10); 
        
        for (var i = 0; i < nParcelas; i++) {
            parcelas=i+1
            const registro = await sequelize.query(`INSERT INTO tb_registros (data_vencimento, data_compra, tipo, estabelecimento, valor, parcelas, n_parcelas, categoria, usuario) 
                                                  values ('${data}', '${valores.data_compra}', '${valores.tipo}', '${valores.estabelecimento}', '${valores.valor}', '${parcelas}',  '${nParcelas}', '${valores.categoria}', '${req.session.sessao_id}') `)
            date = addMonthsToDate(date, 1);
            data = (date.toISOString().split('T')[0]);
        }
    }else{
       const registro = await sequelize.query(`INSERT INTO tb_registros (data_vencimento, data_compra, tipo, estabelecimento, valor, categoria, usuario) 
                                               values ('${valores.data_vencimento}', '${valores.data_compra}', '${valores.tipo}', '${valores.estabelecimento}', '${valores.valor}', '${valores.categoria}', '${req.session.sessao_id}') `)
    }

    res.redirect('/home?msg=1')
})

app.get('/deletar', async (req, res) => {
    await sequelize.query(`delete from tb_registros where id_registro=${req.query.id}`)
    res.redirect('/home?msg=1')
})

app.get('/categorias', async (req, res) => {
    const listaCategorias = await sequelize.query(`select * from tb_categorias`, {type: sequelize.QueryTypes.SELECT})
    res.render('categoria', {listaCategorias})
})

app.post('/cadastrarCategoria', async (req, res) => {
    await sequelize.query(`INSERT INTO tb_categorias (categoria) values ('${req.body.categoria}')`)

    res.redirect('/categorias')
})

//Faz loggof do sistema
app.get('/sair', (req, res) => {
    (async () => {
        req.session.destroy();
        res.redirect('/')
    })();
})



app.listen(3010);  


})();