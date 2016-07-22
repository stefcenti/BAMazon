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

//	this.prompt = require('prompt');
//	this.prompt.start();

	this.displayInventory = function() {

		this.connection.query('SELECT * FROM Products', function(err, rows, fields) {
  			if (err) throw err;
	
			self.printHeading();

  			for (var i=0; i<rows.length; i++) {
  				self.printItem(rows[i]);
  			}
		});
	}

	this.promptUser = function () {

	}

	this.purchaseProduct = function(product, qty) {

		this.connection.query('SELECT * FROM Products WHERE ProductName=? AND ? < StockQuantity', 
			['product', 'qty'], function(err, rows, fields) {
  		
  			if (err) throw err;
	
			self.printHeading();

  			for (var i=0; i<rows.length; i++) {
  				self.printItem(rows[i]);
  			}
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

