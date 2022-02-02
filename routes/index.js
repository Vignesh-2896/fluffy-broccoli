var express = require('express');
var router = express.Router();

var Post = require("../models/post");
var siteController = require("../controllers/siteController");

/* GET home page. */
router.get('/', checkLogin, function(req, res, next) {

  if(!res.locals.currentUser && req.user){
    res.locals.currentUser = req.user;
  }

  let welcomeMessage = "";
  if(req.session.messages){
    welcomeMessage = req.session.messages;
    delete req.session.messages;
  } else if(req.flash("successMessage").length > 0){
    welcomeMessage = req.flash("successMessage");
  }

  if(!welcomeMessage && !res.locals.currentUser){
    welcomeMessage = "Welcome to the Otaku Clubhouse. Login and join the club to see your friends and start posting !" 
  }

  const imageData = ["/images/charizard.jpg",
   "/images/izuki-(deku)-midoriya.jpg",
   "/images/might-guy.jpg",
   "/images/mikasa.jpg",
   "/images/Ninth.jpg",
   "/images/scar.jpg"
  ];

  Post.find({}).exec(function(err, results){
    if(err) { return next(err); }
    res.render('index', { title: 'Otaku Clubhouse', welcomeMessage: welcomeMessage, errorMessage:req.flash("errorMessage"), imageData:imageData, postData: results });
  });
});

function checkLogin(req, res, next){
  if(!res.locals.currentUser && req.user){
    res.locals.currentUser = req.user;
    res.locals.isAdmin = req.user.userAdmin;
  }
  next();
}

router.get("/signup", siteController.sign_up_get);

router.post("/signup", siteController.sign_up_post);

router.get("/login", siteController.login_get);

router.post("/login", siteController.login_post);

router.get("/logout", siteController.logout_get);

router.get("/createPost", checkLogin, siteController.create_message_get);

router.post("/createPost", checkLogin, siteController.create_message_post);

router.get("/joinClub", checkLogin, siteController.join_club_get);

router.post("/joinClub", checkLogin, siteController.join_club_post);

router.get("/deletePost/:postID", checkLogin, siteController.delete_message_get)

module.exports = router;
