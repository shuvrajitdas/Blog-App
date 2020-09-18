var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var methodOverride = require("method-override");
var expressSanitizer = require("express-sanitizer");

mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);
mongoose.set('useFindAndModify', false);

//APP CONFIG
mongoose.connect("mongodb://localhost/restful_blog_app");
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(methodOverride("_method"));

//MONGOOSE/CONFIG
var blogSchema = new mongoose.Schema({
	title: String,
	image: String,
	body: String,
	created: {type: Date,default: Date.now}
});

var Blog = mongoose.model("Blog", blogSchema);


//RESTFUL ROUTES
app.get("/", function(req, res){
	res.redirect("/blogs");
});

//INDEX ROUTE
app.get("/blogs", function(req, res){
	Blog.find({}, function(err, blogs){
		if(err){
			console.log("ERROR!!");
		}else {
			res.render("index", {blogs: blogs});
		}
	});
});

//NEW ROUTE
//CREATE ROUTE
app.get("/blogs/new", function(req, res){
	res.render("new");
});

app.post("/blogs", function(req, res){
	console.log(req.body);
	req.body.blog.body = req.sanitize(req.body.blog.body);
	console.log(req.body);
	Blog.create(req.body.blog, function(err, newBlog){
		if(err){
			res.render("new");
		}else{
			res.redirect("/blogs");
		}
	});
});

//SHOW ROUTE
app.get("/blogs/:id", function(req, res){
	Blog.findById(req.params.id, function(err, foundBlog){
		if(err){
			res.redirect("/blogs");
		}else{
			res.render("show", {blog: foundBlog});
		}
	})
});

//EDIT ROUTE
app.get("/blogs/:id/edit", function(req, res){
	Blog.findById(req.params.id, function(err, foundBlog){
		if(err){
			res.redirect("/blogs");
		} else{
			res.render("edit", {blog: foundBlog});
		}
	});
});

//UPDATE ROUTE
app.put("/blogs/:id", function(req, res){
	req.body.blog.body = req.sanitize(req.body.blog.body);
	Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
		if(err){
			res.redirect("/blogs");
		} else {
			res.redirect("/blogs/" + req.params.id)	
		}
	});
});

//DELETE ROUTE
app.delete("/blogs/:id", function(req, res){
	//res.send("YOU HAVE REACHED DESTROY ROUTE!!!");
	Blog.findByIdAndRemove(req.params.id, function(err){
		if(err){
			res.redirect("/blogs");
		}else {
			res.redirect("/blogs");
		}
	});
});

app.listen(process.env.PORT || 3000, process.env.IP, function(){
	console.log("RESTful app server has Started!!");
});