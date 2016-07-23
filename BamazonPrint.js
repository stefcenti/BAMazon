function BamazonPrint(debug=true) {
	if (debug) { console.log("BamazonPrint()"); }

	var self = this;

	this.debug = debug;

	this.printf = require('printf');
	this.hformat = "%-5s   %-40s   %-30s   %-8s   %-8s";
	this.rformat = "%-5s | %-40s | %-30s | % 8.2f | %8s";

	this.printHeading = function(heading1="\n") {
	
		var heading2 = this.printf(this.hformat, 
					"ID", 
					"Product", 
					"Department", 
					"Price", 
					"Quantity");

		var heading3 = this.printf(this.hformat, 
					"--", 
					"-------", 
					"----------", 
					"--------", 
					"--------");

		console.log(heading1);
		console.log(heading2);
		console.log(heading3);

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

module.exports = BamazonPrint;
