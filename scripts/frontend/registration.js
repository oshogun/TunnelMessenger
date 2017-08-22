var mysql = require("mysql");
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'tunnel',
    password : '123456',
    database : 'TunnelMessenger'
});

connection.connect();

function registerUser() {
	
}