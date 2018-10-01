//===========================================
//  BOILERPLATE
//===========================================
var mysql = require("mysql");
var inquirer = require("inquirer");

// create the connection information for the sql database
var connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "",
  database: "bamazon_DB"
});

//==========================================
//  FIRST CONNECTION
//==========================================
connection.connect(function (err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId);
  console.log("-----------------------");
  console.log("Welcome to Bamazon");
  console.log("-----------------------");
  setTimeout(function () {
    console.log("Loading Storefront");
    console.log("-----------------------");
  }, 500);

  // display all items
  setTimeout(function () { start(); }, 1000);
  // start();
});

//==========================================
//  DISPLAYS ALL
//==========================================
function start() {
  connection.query("SELECT * FROM products", function (err, results) {
    if (err) throw err;
    results.forEach(function (item) {
      console.log("Item ID: " + item.id);
      console.log("Product: " + item.product_name);
      console.log("Department: " + item.department_name);
      console.log("Price: $" + item.price);
      console.log("Stock: " + item.stock_quantity);
      console.log("-----------------------");
    });

    //then ask user to choose an item
    makeThyChoice();
    // connection.end();

  });
}

//==========================================
//  WHICH ITEM?
//==========================================
function makeThyChoice() {
  //program will keep a reference of products
  connection.query("SELECT * FROM products", function (err, results) {
    if (err) throw err;

    // prompt the user for which item they'd like

    inquirer
      .prompt([
        {
          name: "item",
          type: "input",
          message: "What is the item you would like to purchase? Please input the item's ID #",
          validate: function (value) {
            if (isNaN(value) === false) {
              return true;
            }
            return false;
          }
        },
        {
          name: "quantity",
          type: "input",
          message: "How many would you like to buy? Please input a quantity as a number",
          validate: function (value) {
            if (isNaN(value) === false) {
              return true;
            }
            return false;
          }
        }
      ])
      .then(function (answer) {
        // get the information of the chosen item
        // console.log(answer.item);
        // console.log(answer.quantity);
        // console.log(results);
        var chosenItem;
        for (var i = 0; i < results.length; i++) {
          if (results[i].id == answer.item) {
            chosenItem = results[i];
          }
        }
        // console.log(chosenItem);
        // console.log(chosenItem.stock_quantity);

        // determine if there is enough stock
        if (chosenItem.stock_quantity > parseInt(answer.quantity)) {
          // stock was high enough, so update db, let the user know, and start over
          var newStock = chosenItem.stock_quantity - answer.quantity;
          console.log(newStock);
          connection.query(
            "UPDATE products SET ? WHERE ?",
            [
              {
                stock_quantity: newStock
              },
              {
                id: chosenItem.id
              }
            ],
            function (error) {
              if (error) throw err;
              console.log("Order placed successfully!");
              finish();
            }
          );
        }
        else {
          // there isn't enough in stock, so apologize and start over
          console.log("Sorry, we don't have enough in stock. Please try again...");
          finish();
        }
      });
  });
}


//==========================================
//  FINISH
//==========================================
function finish() {
  inquirer
    .prompt([
      {
        name: "stayOrGoNow",
        type: "confirm",
        message: "Would you like to go back to the store?",
        default: true
      }
    ])
    .then(function (answer) {
      // console.log(answer);
      if (answer.stayOrGoNow == true) {
        console.log("Okay, returning to store front!");
        setTimeout(function () { start(); }, 1000);
      }
      else {
        console.log("Thank you for shopping Bamazon")
        connection.end();
      }
    })
}



