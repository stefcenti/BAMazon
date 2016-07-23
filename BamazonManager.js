var bPrint = require('./BamazonPrint.js');

function BamazonManager(debug = true) {
	if (debug) { console.log("BamazonManager()"); }

	var self = this;

	this.debug = debug;

	this.bPrint = new bPrint(this.debug);

	this.prompt = require('prompt');
 	this.prompt.start();

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

		// Make sure we connect to the DB before starting
		self.start();
	});

	this.start = function() {
		this.displayMenu();
	}

	this.displayMenu = function() {
		if(this.debug) {console.log("Manager.displayMenu()");}

		console.log("\n\t\tBAMAZON MANAGEMENT SYSTEM\n\t\t-------------------------");

		var schema = 
			{properties:
				{action:
					{message: "\n1) View Products for Sale\n" + 
			 					"2) View Low Inventory\n" +
			 					"3) Add to Inventory\n" +
			 					"4) Add New Product\n" +
			 					"5) Quit\n"
					}
				}
			};

		this.prompt.message = "";
		this.prompt.delimiter = "\nOption:";
			
		this.prompt.get(schema, function (err, result) {

			if(err) throw err;

			switch(parseInt(result.action, 10)){
				case 1:
					self.viewProducts();
					break;
				case 2:
					self.viewLowInventory();
					break;
				case 3:
					self.addToInventory();
					break;
				case 4:
					self.addNewProduct();
					break;
				case 5:
					self.connection.end();
					return;
				default: 
					console.log("Invalid Response: " + result.action);
					self.displayMenu();
			};

		}); // End Prompt.get
	}

	// List all the products available for sale:
	// Item IDs, Names, prices and quantities
	this.viewProducts = function() {
		if(this.debug) console.log("Manager.viewProducts()");

		this.connection.query('SELECT * FROM Products', function(err, rows, fields) {
  			if (err) throw err;
	
			self.bPrint.printHeading("\n\t\tPRODUCT LIST\n\t\t------------");

  			for (var i=0; i<rows.length; i++) {
  				self.bPrint.printItem(rows[i]);
  			}

			self.displayMenu();
		});
	}

	// List all items for which the quantity available 
	// in stores is less than 5 by default.
	this.viewLowInventory = function(lowest=5) {
		if(this.debug) console.log("Manager.viewLowInventory()");

		this.connection.query('SELECT * FROM Products WHERE StockQuantity < ?', 
			[lowest], function(err, rows, fields) {

 			if (err) throw err;
	
			self.bPrint.printHeading("\n\t\tLOW INVENTORY LIST\n\t\t------------------");

  			for (var i=0; i<rows.length; i++) {
  				self.bPrint.printItem(rows[i]);
  			}
			
			self.displayMenu();
		});
	}

	// Allow the Manager to add more of any item currently
	// in the store.
	this.addToInventory = function() {
		if(this.debug) console.log("Manager.addToInventory()");

		// Prompt for Product ID and quantity to add
 
 		console.log('\nADD PRODUCT INVENTORY');
 		console.log('---------------------');

  		var schema = {
			properties: {
				itemID: {
					description: 'Enter a Product ID:',
					pattern: /[0-9]/,
					message: 'Product Id must be a positive number.',
					required: true
				},
				qtyToAdd: {
					description: 'Enter the Quantity to be Added:',
					pattern: /[0-9]/,
					message: 'Quantity must be a positive number.',
					required: true
				}
			}
		};
 
		this.prompt.name = "";
		this.prompt.delimiter = "";

		this.prompt.get(schema, function (err, pResult) {

			if (err) throw err;
		
			if (self.debug) {
				console.log('Command-line input received:');
				console.log('  product: ' + pResult.itemID);
				console.log('  quantity: ' + pResult.qtyToAdd);
			}

			self.connection.query("UPDATE Products SET StockQuantity = StockQuantity + ? WHERE ItemID = ?", 
				[pResult.qtyToAdd, pResult.itemID], function(err, qResult) {

				if(err) throw err;

				if(self.debug) { console.log("Stock Quantity Updated Successfully!"); }

 				self.displayMenu();
			});
		});
	}

	// Allow the Manager to add a completely new product
	// to the store.
	this.addNewProduct = function() {
		if(this.debug) console.log("Manager.addNewProduct()");

		// Prompt for Product ID and quantity to add
 
 		console.log('\nADD NEW PRODUCT TO INVENTORY');
 		console.log('------------------------------');

  		var schema = {
			properties: {
				ProductName: {
					description: 'Enter the Product Name:',
					required: true
				},
				DepartmentName: {
					description: 'Enter the Product\'s Department Name:',
					required: true
				},
				Price: {
					description: 'Enter the Product Price:',
//					type: 'number',
					pattern: /[0-9].[0-9]/,
					message: 'Price must be a number.',
					required: true
				},
				StockQuantity: {
					description: 'Enter the Stock Quantity to Add:',
					type: 'integer',
//					pattern: /[0-9]/,
					message: 'Quantity must be a integer.',
					required: true
				}
			}
		};
 
		this.prompt.name = "";
		this.prompt.delimiter = "";

		this.prompt.get(schema, function (err, pResult) {

			if (err) throw err;
		
			if (self.debug) {
				console.log('Command-line input received:');
				console.log('  ProductName: ' + pResult.ProductName);
				console.log('  DepartmentName: ' + pResult.DepartmentName);
				console.log('  Price: ' + pResult.Price);
				console.log('  StockQuantity: ' + pResult.StockQuantity);
			}

			self.connection.query(
				"INSERT INTO Products SET " + 
						"ProductName = ?, " +
						"DepartmentName = ?, " + 
						"Price = ?, " + 
						"StockQuantity = ? ", 
				[pResult.ProductName, 
				 pResult.DepartmentName, 
				 pResult.Price, 
				 pResult.StockQuantity], function(err, qResult) {

				if(err) throw err;

				if(self.debug) { console.log("New Product Added Successfully!"); }

 				self.displayMenu();
			});
		});
	}

} // End BamazonManager

// Remove boolean arg or change to true to turn on debugging
var bman = new BamazonManager(false);

