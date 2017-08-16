var mysql = require("mysql");
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'labsec',
    password : 'labsec',
    database : 'TunnelMessenger'
});

connection.connect();

var userTableSql = "\
CREATE TABLE IF NOT EXISTS users ( \
    `id` INT NOT NULL AUTO_INCREMENT, \
    `username` VARCHAR(30) NOT NULL, \
    `password` VARCHAR(255) NOT NULL, \
    `nickname` VARCHAR(127) NOT NULL, \
    `subnick` VARCHAR(511) NOT NULL, \
    `fullname` VARCHAR(511) NOT NULL, \
    `email` VARCHAR(255) NOT NULL, \
    PRIMARY KEY(id)\
)";

var chatTableSql = "\
CREATE TABLE IF NOT EXISTS chats ( \
    `id` INT NOT NULL AUTO_INCREMENT, \
    `name` VARCHAR(127) NOT NULL, \
    PRIMARY KEY(id) \
)";

var chatMembersTableSql = "\
CREATE TABLE IF NOT EXISTS chat_members ( \
    `chat_id` INT NOT NULL, \
    `user_id` INT NOT NULL, \
    PRIMARY KEY(chat_id, user_id), \
    FOREIGN KEY (chat_id) REFERENCES chats(id) \
        ON DELETE CASCADE \
        ON UPDATE CASCADE, \
    FOREIGN KEY (user_id) REFERENCES chats(id) \
        ON DELETE CASCADE \
        ON UPDATE CASCADE \
)";

var messageTableSql = "\
CREATE TABLE IF NOT EXISTS messages ( \
    `id` INT NOT NULL AUTO_INCREMENT, \
    `chat_id` INT NOT NULL, \
    `user_id` INT NOT NULL, \
    `content` TEXT NOT NULL, \
    `datetime` DATETIME NOT NULL DEFAULT NOW(), \
    PRIMARY KEY(id), \
    FOREIGN KEY (chat_id) REFERENCES chats(id) \
        ON DELETE CASCADE \
        ON UPDATE CASCADE, \
    FOREIGN KEY (user_id) REFERENCES chats(id) \
        ON DELETE CASCADE \
        ON UPDATE CASCADE \
)";

var tableQueries = {
    "users": userTableSql,
    "chats": chatTableSql,
    "chat_members": chatMembersTableSql,
    "messages": messageTableSql
};

for (var name in tableQueries) {
    if (tableQueries.hasOwnProperty(name)) {
        (function(name) {
            connection.query(tableQueries[name], function(error) {
                if (error) {
                    throw error;
                }

                console.log("Created table '" + name + "'");
            });
        })(name);
    }
}

connection.end();
