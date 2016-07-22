function BamazonCustomer(debug = true) {
	if (debug) { console.log("BamazonCustomer()"); }

	var self = this;

	this.debug = debug;

	this.printf = require('printf');
	this.hformat = "%-5s   %-40s   %-30s   %-8s   %-8s";
	this.rformat = "%-5s | %-40s | %-30s | % 8.2f | %8s";

	this.mysql = require('mysql');
	this.connection = this.mysql.createConnection({
		host: "localhost",
		port: 3306,
		user: "root",
		password: "",
		database: "Bamazon"
	});

	this.connection.connect(function(err) {
		if(err) throw err;
		if(self.debug) { console.log("Connected as id " + self.connection.threadId) };
	});

	this.prompt = require('prompt');
 	this.prompt.start();

	this.displayInventory = function() {

		this.connection.query('SELECT * FROM Products', function(err, rows, fields) {
  			if (err) throw err;
	
			self.printHeading();

  			for (var i=0; i<rows.length; i++) {
  				self.printItem(rows[i]);
  			}

  			self.purchasePrompt();
		});
	}

	this.purchasePrompt = function () {
		if (this.debug) { console.log("purchasePrompt()"); }

		var schema = {
			properties: {
				product_id: {
					pattern: /[0-9]/,
					message: 'Product Id must be a positive number.',
					required: true
				},
				quantity: {
					pattern: /[0-9]/,
					message: 'Quantity must be a positive number.',
					required: true
				}
			}
		};
 
		this.prompt.get(schema, function (err, result) {

			if (err) throw err;
		
			if (self.debug) {
				console.log('Command-line input received:');
				console.log('  product: ' + result.product_id);
				console.log('  quantity: ' + result.quantity);
			}

			self.purchaseProduct(result.product_id, result.quantity);
		});
	}

	// Prompt user to press any key to continue or 'q' to quit.
	// If the user enters 'q', the connection will be closed.
	// Otherwise, the flag will be checked to see what to do next.
	this.continuePrompt = function(flag) {

		self.prompt.get({properties:{action:{message:"Press any Key to Continue, 'q' to quit"}}}, 
			function (err, result) {

			//console.log("Prompt Result: " + JSON.stringify(result));
			if(result.action.toLowerCase() === 'q'){
				self.connection.end();
				return;
			}

			if (flag == "purchase") {
				self.displayInventory();
			}
		});

	}

	this.purchaseProduct = function(product_id, qty) {
		if(this.debug) { console.log("purchaseProduct()"); }

		this.connection.query('SELECT * FROM Products WHERE ItemID=? AND ? <= StockQuantity', 
			[product_id, qty], function(err, rows, fields) {
  		
  			if (err) throw err;

  			if (rows.length < 1) {
  				console.log("Insufficient Quantity");
  				self.continuePrompt("purchase");
  				return;
  			}

  			var item = rows[0];

  			item.StockQuantity -= qty;

			self.connection.query("UPDATE Products SET ? WHERE ?", 
				[{StockQuantity: item.StockQuantity}, {ItemID: item.ItemID}], function(err, res) {

				if(err) throw err;

				if(self.debug) { console.log("Stock Quantity Updated Successfully!"); }

	  			console.log(" Purchase Info");
	  			console.log("---------------");
	  			console.log("Item Purchased: " + item.ProductName);
	  			console.log("Cost: " + qty * item.Price);

  				self.continuePrompt("purchase");
			});
		});
	}

	this.printHeading = function() {
	
		var heading1 = this.printf(this.hformat, 
					"ID", 
					"Product", 
					"Department", 
					"Price", 
					"Quantity");

		var heading2 = this.printf(this.hformat, 
					"--", 
					"-------", 
					"----------", 
					"--------", 
					"--------");

		console.log(heading1);
		console.log(heading2);

	}

	this.printItem = function(item) {
//		if (debug) { console.log("printItem()"); }

		console.log(this.printf(this.rformat, 
					item.ItemID, 
					item.ProductName, 
					item.DepartmentName, 
					item.Price, 
					item.StockQuantity));
	}
}

var bc = new BamazonCustomer();

bc.displayInventory();
//bc.promptUser();

