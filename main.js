const express = require('express');
const hbs = require('express-handlebars');

const PORT = parseInt(process.argv[2] || 3000);

const app = express();

app.engine('hbs', hbs({defaultLayout : 'main.hbs'}));
app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');

var roll = () => {
    return Math.floor(Math.random() * 6) + 1;
}

var multipleRolls = (numRolls) => {
    let result = [];
    for (let i = 0; i < numRolls; i++){
        result.push(roll());
    }

    return result;
}

var checkNumRollsIsValid = (numRolls) => {
    if (!numRolls || numRolls < 0){
        //received an invalid X-NumRolls
        return false;
    }

    return true;
};

var sendNumRollsError = (numRolls, res) => {
    res.status(422);
    res.type('text/html');
    res.send(`<h1>Unable to process NumRolls: ${numRolls}</h1>`);
}

app.get('/dice', (req, res) => {
    let numRolls = parseInt(req.get('X-NumRolls'));
    if (isNaN(numRolls)){
        numRolls = 1;
    }

    res.format({
        'text/html': () => {
            if (checkNumRollsIsValid(numRolls)) {
                res.status(200);
                res.type('text/html');
                let rolls = multipleRolls(numRolls);
                let result = rolls.reduce((accumulator, currentValue) => {
                    return accumulator += `<img src='/images/dice/d${currentValue}.png'>\n`;
                }, "");
                // res.send(result);
                res.render('dice', {diceImage: result});
            }
            else {
                sendNumRollsError(numRolls, res);
            }
        },
        'text/csv': () => {
            if (checkNumRollsIsValid(numRolls)) {
                res.status(200);
                res.type('text/csv');
                let result = multipleRolls(numRolls).reduce((accumulator, currentValue) => {
                    return accumulator += `${currentValue},`;
                }, '');
                res.send(result.substring(0, result.length - 1));
            } 
            else {
                sendNumRollsError(numRolls, res);
            }
        },
        'application/json': () => {
            if (checkNumRollsIsValid(numRolls)) {
                res.status(200);
                res.type('application/json');
                let rolls = multipleRolls(numRolls);
                res.json({count: numRolls, rolls: rolls});
            }
            else {
                sendNumRollsError(numRolls, res);
            }
        },
        'default': () => {
            res.status(406);
            res.type('text/html');
            res.send('<h1>Unable to accept request. Please try a different format</h1>');
        }        
    })
});

app.get(/.*/, express.static(__dirname + '/public'));

app.listen(PORT, () => {
    console.info(`App started on port ${PORT} at ${new Date()}`);
});