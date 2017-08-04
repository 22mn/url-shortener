var express = require("express");
var valid   = require("valid-url");
var mongo   = require("mongodb").MongoClient();
var app     = express();
var port    = process.env.PORT||8080;
var obj     = {};

app.set('view engine', 'pug');
app.set('views','./views');        
app.get("/",function(req,res){
  res.render("home");
});

app.get("/:digits([0-9]{6})",function(req,res){
  var query = "https://"+req.headers["host"]+"/"+req.params.digits;        //full url for query {key,val} from db
  mongo.connect(process.env.SECRET,function(err,db){
    if (err){res.send(err)};                                               
    db.collection("urls").find({"shorten":query}).toArray(function(err,ok){
      if (err){res.send("ERROR")}
      res.redirect(ok[0].original);                                        //open original url
      db.close();
    });
  });
});

app.get("/:url(*)", function(req,res){
	var short = Number((Math.random()*900000).toFixed(0))+100000;     //get random 6digits	
	if(valid.isUri(req.params.url)){
		obj  = {};
		obj["original"] = req.params.url;                               //original url record at obj;
		obj["shorten"]  = "https://"+req.headers["host"]+"/"+short;     //shorten url record at obj;
		mongo.connect(process.env.SECRET, function(err,db){
			if (err) {res.send("Cannot connect to your database!");}      
			else{		
				var urls = db.collection("urls");                           //open db
				urls.insert(obj,function(err,ok){                           //insert "obj" data
					if (err){return console.log(err);};
					db.close();
				});	
			}
		});		
	}
	else{
		obj["error"] = "Not a valid URL!";
	}
	res.send(obj);                                                    // display current obj 
});

app.listen(port);                    