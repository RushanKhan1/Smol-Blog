//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const ejs = require("ejs");
const _ = require('lodash');
const mongoose = require('mongoose');
const fs = require("fs");
require('dotenv').config();



mongoose.connect("mongodb+srv://" + process.env.DB_USER + ":" + process.env.DB_PASS + "@cluster0.2zug1.mongodb.net/todolistDB?retryWrites=true&w=majority", {useNewUrlParser: true, useUnifiedTopology: true});

const postSchema = new mongoose.Schema({
   
    title : String, 
    body : String 
    
});

const Post = mongoose.model("Post", postSchema);

// const samplePost1 = new Post({
//     title: "Test",
//     body: "This is a test!"
// })

// samplePost1.save();

const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

let posts = [];

var absPosts = []; // an array for storing abstracted post bodies.

app.get('/', (req, res) => {

    // This assigns the referrence of the array and not the actual array 
    // absPosts = posts;

    // creating a deep copy with lodash
    // absPosts = _.cloneDeep(posts);

    
    Post.find({}, (err, docs) => {
	if(err){
	    console.log(err);
	}
	else {
	    absPosts = _.cloneDeep(docs);
	    for(var i = 0; i < absPosts.length; i++) {
		absPosts[i].body = absPosts[i].body.slice(0, 100) + '...';
	    }
	    
	    res.render('home', { absPosts });
	}
	
	
    });
});    


app.get('/about', (req, res) => {
    res.render('about', {aboutContent})
});

app.get('/contact', (req, res) => {
    res.render('contact', {contactContent})
});

app.get('/compose', (req, res) => {
    res.render('compose')
});

app.post('/compose', (req, res) => {

    const post = new Post({
	title: req.body.postTitle,
	body: req.body.post
    });
    post.save();
    res.redirect('/');
})

app.get('/posts/:name', (req, res) => {

    let wantedId = _.lowerCase(req.params.name);
    wantedId = wantedId.replace(/\s+/g, '');
    wantedId = wantedId.toString();
    console.log(wantedId);
				  
    var postTitle = "Page Not found!";
    var postBody = "No page with that name exists!"
    
    var postContent = {
	
	postTitle: postTitle,
	postBody: postBody
	
    }

    Post.find({ _id: wantedId }, (err, docs) => {
	if(err){
	    console.log(err);
	}
	else {
	    console.log("found!")
	    postContent = {

		postTitle: docs[0].title,
		postBody: docs[0].body
	    } 

	    console.log(docs)
	    res.render('post', { postContent });
	}
    });

    console.log(postContent.postBody);
})


app.get("/edit/:id", (req, res) => {

    let postId = req.params.id;

    Post.find({ _id: postId }, (err, docs) => {
	if(err){
	    console.log(err);
	}
	else {
	    console.log("found!")

	    console.log(docs);
	    res.render("edit", { docs });
	}
    });


});


app.post("/edit", (req, res) => {
    let postId = req.body.id;
    let newTitle = req.body.title;
    let newBody = req.body.body;

    Post.update({_id: postId}, { title: newTitle, body: newBody }, (err, updateWriteOpResult) => {
	if(err){
	    console.log(err);
	}
	else {
	    let postContent = {
		postTitle: newTitle,
		postBody: newBody
	    }
	    
	    res.render('post', { postContent })
	    
	}
    }); 
});


app.get("/delete/:id", (req, res) => {
    let postId = req.params.id;
    Post.deleteOne({_id: postId}, (err) => {
	if(err){
	    console.log(err);
	}
	else {
	    console.log("Deletion successful!")
	    res.redirect("/");
	}
    });

});


let port = process.env.PORT;
if(port == null || port == ""){
    port = 3000;
}

app.listen(port, function() {
  console.log("Server started successfully.");
});


