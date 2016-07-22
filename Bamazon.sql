CREATE database Bamazon;

USE Bamazon;

CREATE TABLE Products (
  ItemID INTEGER(11) AUTO_INCREMENT NOT NULL,
  ProductName VARCHAR(100) NULL,
  DepartmentName VARCHAR(100) NULL,
  Price DECIMAL(10,4) NULL,
  StockQuantity INTEGER(10) DEFAULT 0,
  PRIMARY KEY (ItemId)
);

SELECT * FROM Products;

drop table Products;

