

function id(element){
	return document.getElementById(element);
}

var db;

function init(){
	document.getElementById("add").addEventListener("click", newnoti, false);
	db = window.sqlitePlugin.openDatabase({ name: 'schedule.db', location: 'default' }, function (db) {

	    db.transaction(function (tx) {
	    tx.executeSql('CREATE TABLE IF NOT EXISTS appointments (id INTEGER PRIMARY KEY AUTOINCREMENT, description TEXT, date TEXT)');
		}, function (error) {
		    alert('db transaction error: ' + error.message);
		}, function () {
		    //alert('db creation ok');
		});

		db.transaction(function (tx) {
		//select all rows to show the table
	    	tx.executeSql('SELECT * FROM appointments', [], querySuccess, function (error) {
		    	alert('select transaction error: ' + error.message);
			});
		});

	}, function (error) {
		 alert('Open database ERROR: ' + JSON.stringify(error));
	});
}

function newnoti() {
	var datetime = document.getElementById("datetime").value;
	var description = document.getElementById("description").value;
	
	var date = toJSDate(datetime);
	db.transaction(function (tx) {
		//insert registry to db
		tx.executeSql('INSERT INTO appointments (description, date) VALUES (?,?)', [description, datetime], function (resultSet) {
		  //alert('resultSet.insertId: ' + resultSet.lastInsertId;
		  
		}, function(error) {
		  console.log('INSERT error: ' + error.message);
		});
		
		//select all rows to show the table
	    tx.executeSql('SELECT * FROM appointments', [], querySuccess, function (error) {
		    alert('transaction error: ' + error.message);
		});
	    //GET LAST ID
		tx.executeSql('SELECT * FROM appointments', [], function querySuccess(tx, results) {
			var idn;
		    for (var i=0; i<results.rows.length; i++){
		        idn=results.rows.item(i).id;
				}
				cordova.plugins.notification.local.schedule({
					id: idn,
				    title: "Notification app",
				    text: description,
				    trigger: { at: date }
				});
				alert("programmed sucessfully at "+date+"    id="+idn);

		}, function (error) {
		    alert('transaction error: ' + error.message);
		});
	});

}

function querySuccess(tx, results) {
    var len = results.rows.length;

    //alert("appointments table updated: " + len + " rows found.");
    var rows = "<table><tr><th>ID</th><th>Desc.</th><th>Date</th><th>Delete</th></tr>";
    for (var i=0; i<len; i++){
        rows = rows + "<tr><td>" + results.rows.item(i).id + "</td><td>" + results.rows.item(i).description + "</td><td>" + results.rows.item(i).date + "</td><td><a href='#' onclick='del("+results.rows.item(i).id+")'>  Delete  </a></td></tr>";
    }
    if (results.rows.length==0) {
    	rows = "There are no events, press Menu to create one.";
    }
    document.getElementById("table").innerHTML = rows;
}


function toJSDate (dateTime) {

var dateTime = dateTime.split("T");//dateTime[0] = date, dateTime[1] = time

var date = dateTime[0].split("-");
var time = dateTime[1].split(":");

//(year, month, day, hours, minutes, seconds, milliseconds)
return new Date(date[0], date[1]-1, date[2], time[0], time[1], 0);//substract 1 to month due to javascript months being 0-11 and not 1-12

}

//You’ll create a table called “appointments” with three fields, “id” (AUTOINCREMENT), “description” and “date” (a string literal that represents a date and time).

function del(id) {
	db.transaction(function (tx) {
		//insert registry to db
		tx.executeSql('DELETE FROM appointments WHERE id=?', [id], function (resultSet) {
		  cordova.plugins.notification.local.cancel(id, function() {
			    alert("Cancelled notification " + id);
			});
		  
		}, function(error) {
		  console.log('DELETE error: ' + error.message);
		});
		
		 tx.executeSql('SELECT * FROM appointments', [], querySuccess, function (error) {
		    alert('transaction error: ' + error.message);
		});
	});
}

function delall() {
	db.transaction(function (tx) {
		//insert registry to db
		tx.executeSql('DELETE FROM appointments', [], function (resultSet) {
		  cordova.plugins.notification.local.cancelAll(function() {
			    alert("Cancelled all notifications");
			}, this);
		}, function(error) {
		  console.log('DELETE error: ' + error.message);
		});
		
		 tx.executeSql('SELECT * FROM appointments', [], querySuccess, function (error) {
		    alert('transaction error: ' + error.message);
		});
	});
}