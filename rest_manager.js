
var Manager = function() {
	var nextId = 0;
	this.users = [];

	this.fetchAllUsers = function(callback) {
		callback(null, this.users);
	};

	this.fetchUserById = function(id, callback) {
		var users = this.users.filter(function(user) {
			return user._id == id;
		});

		if (users.length) {
			callback(null, users[0]);
		} else {
			callback("No results found.", null);
		}
	};

	this.insertUser = function(user, callback) {
		user._id = nextId++;
		this.users.push(user);
		callback(null, user);
	};

	this.updateUser = function(user, callback) {
		this.fetchUserById(user._id, function(error, record) {
			if (error) {
				callback(error, null);
			} else {
				record.name = user.name;
				record.email = user.email;
				callback(null, record);
			}
		});
	};

	this.deleteUser = function(id, callback) {
		this.users = this.users.filter(function(user) {
			return user._id != id;
		});
		callback(null, { _id: id });
	}
};

exports.Manager = Manager;
