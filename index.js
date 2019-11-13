const flash = require('express-flash');
const session = require('express-session');
const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const RegNumbers = require('./registration_number');

const pg = require("pg");
const Pool = pg.Pool;

const app = express();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || "postgresql://codex:codex123@localhost/registrations"
});

const registration = RegNumbers(pool);


app.use(express.static('public'));

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json())


app.use(session({
    secret: "error",
    resave: false,
    saveUninitialized: true
}));

app.use(flash(app));

const handlebarSetup = exphbs({
    partialsDir: "./views/partials",
    viewPath: './views',
    layoutsDir: './views/layouts'
});

app.engine('handlebars', handlebarSetup);
app.set('view engine', 'handlebars');


app.get('/', async function (req, res) {
    res.render('index')
});


app.post('/reg_numbers', async function (req, res) {
    if (req.body.regNum === "" || req.body.regNum === undefined) {
        req.flash('error', 'test')
    };

    await registration.setTownReg(req.body.regNum)

    req.flash('error', registration.errorReg())

    res.render('index', {
        registrationList: await registration.getAllRegNumbers(),
        message: registration.errorReg()
    });


});

app.post('/filter', async function (req, res) {

    res.render('index', {
        registrationList: await registration.filterForTownRegNumbers(req.body.radiobut)
    });


});


app.post('/reset', async function (req, res) {
    await registration.reset();
    res.redirect('/')

});


const PORT = process.env.PORT || 8007;
app.listen(PORT, function () {
    console.log('start' + PORT);
});
//heroku.com/nameless-reef-36717.