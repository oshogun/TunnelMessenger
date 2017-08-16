
var UserManager = function(app) {
	var Manager = require("./rest_manager").Manager;
	var manager = new Manager();

	manager.insertUser({
		name: "Test 1",
		email: "example@example.com"
	}, function() {});

	manager.insertUser({
		name: "Test 2",
		email: "example2@example.com"
	}, function() {});

	app.get("/users", function(request, response) {
		manager.fetchAllUsers(function(error, users) {
			response.send(users);
		});
	});

	app.post("/users", function(request, response) {
		manager.insertUser(request.body, function(error, user) {
			if (error) {
				response.send(error, 500);
			} else {
				response.send(user);
			}
		})
	});

	app.get("/users/:id", function(request, response) {
		manager.fetchUserById(request.params.id, function(error, user) {
			if (error) {
				response.send(error, 404);
			} else {
				response.send(user);
			}
		});
	});

	app.post("/users/:id", function(request, response) {
		console.log(request);
		var user = request.body;
		user._id = request.params.id;

		manager.updateUser(user, function(error, record) {
			if (error) {
				response.send(error, 404);
			} else {
				response.send(record);
			}
		});
	});

	app.delete("/users/:id", function(request, response) {
		manager.deleteUser(request.params.id, function(error, user) {
			if (error) {
				response.send(error, 404);
			} else {
				response.send(user);
			}
		});
	})
};

exports.UserManager = UserManager;
