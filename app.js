//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require('lodash');
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/blogDB', {useNewUrlParser: true, useUnifiedTopology: true});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log("We are connected!");
})

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

const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
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
		
	    res.render('home', { homeStartingContent, absPosts });
	}
	    
	    //     for(var i = 0; i < absPosts.length; i++) {
	    // 	absPosts[i].body = absPosts[i].body.slice(0, 100) + '...';
	    //     }
	    //     res.render('home', { homeStartingContent, absPosts });
	
    });
});    


app.get('/about', (req, res) => {
    res.render('about', {aboutContent})
});

app.get('/contact', (req, res) => {
    res.render('contact', {aboutContent})
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

    const wantedTitle = _.lowerCase(req.params.name);
				  
    var postTitle = "Page Not found!";
    var postBody = "No page with that name exists!"
    
    var postContent = {
	
	postTitle: postTitle,
	postBody: postBody
	
    }

    for(var i = 0; i < posts.length; i++) {
	const postTitle = _.lowerCase(posts[i].title);
	if((postTitle) === (wantedTitle)) {
	    postBody = posts[i].body;
	    // this has the abstracted post
	    console.log(posts);
	    var postContent = {
		
		postTitle: posts[i].title,
		postBody: postBody
		
	    }
	    break;
	}
	else if(i == posts.length-1) {
	    console.log('Not found!')
	}
    }

    res.render('post', { postContent });
    console.log(postContent.postBody);
})


let port = process.env.PORT;
if(port == null || port == ""){
    port = 3000;
}

app.listen(port, function() {
  console.log("Server started successfully.");
});
