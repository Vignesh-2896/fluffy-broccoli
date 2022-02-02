var User = require("../models/user");
var Post = require("../models/post")

const bcrypt = require("bcryptjs");
const {body, validationResult} = require("express-validator");
const passport = require("passport");
require("dotenv").config();

exports.sign_up_get = function(req, res, next){
    res.render('signup', {title:"Sign Up"})
}

exports.sign_up_post = [
    body("useremail").trim().escape(),
    body("username").trim().isLength({min:7}).withMessage("Atleast 7 characters needed.").escape(),
    body("password").trim().isLength({min:8}).withMessage("Atleast 8 characters needed.").escape(),
    body("confirmpassword").trim().custom((value, { req }) => value === req.body.password).withMessage("Password and Confirm Password fields should match."),

    async (req, res, next) => {
        const errors = validationResult(req);

        var newPassword = await bcrypt.hash(req.body.password, 10)

        var user = new User({
            userEmail : req.body.useremail,
            username : req.body.username,
            password : newPassword
        });

        if(req.body.adminCheck !== undefined){
            user.userAdmin = true;
            user.userAccess = true;
        }

        if(!errors.isEmpty()){
            res.render('signup', { title:"Sign Up", errors : errors.array(), userData: user });
        } else {
            user.save(function(err){
                if(err) { return next(err); }
                req.flash("successMessage", "Your Sign Up Successful ! Log In to get in on the discussion.")
                res.redirect("/")
            })
        }
    }
]

exports.login_get = function(req, res, next){
    let errorMessage = "";
    if(req.session.messages){
        errorMessage = req.session.messages;
        delete req.session.messages;
    }
    res.render('login', {title:"Login Page", errorMessage: errorMessage});
}

exports.login_post = passport.authenticate("local", {successRedirect:"/", successMessage : "Log in Success !", failureRedirect:"/login", failureMessage:true});

exports.logout_get = function(req, res, next){
    req.logout();
    req.flash("errorMessage", "Logged Out. Goodbye.")
    res.redirect("/");
}

exports.create_message_get = function(req, res, next){

    if(!res.locals.currentUser){
        req.flash("errorMessage", "You can create a post or join the club only after login.")
        res.redirect("/");
    } else {
        res.render('post',{title:"Create a Post"});
    }
}

exports.create_message_post = [
    
    body("postTitle").trim()
    .isLength({min:8}).withMessage("Minimum 8 characters needed.")
    .matches(/^[A-Za-z0-9 ]+$/).withMessage("Only alphanumeric characters allowed.").escape(),
    body("postDescription").trim().escape(),

    (req, res, next) => {

        const errors = validationResult(req);

        var post = new Post({
            post_title: req.body.postTitle,
            post_body: req.body.postDescription,
            post_user: req.user.username,
        });

        if(!errors.isEmpty()){
            res.render('post',{title:"Create a Post", errors:errors.array(), postData: post});
        } else {
            post.save(function(err){
                if(err) { return next(err); }
                req.flash("successMessage", "Post was created ! You can view it below. Keep em coming !")
                res.redirect("/");
            })
        }

    }
]

exports.join_club_get = function(req, res, next){
    
    if(!res.locals.currentUser){
        req.flash("errorMessage", "You can create a post or join the club only after login.")
        res.redirect("/");
    } else if(res.locals.currentUser && res.locals.currentUser.userAccess){
        req.flash("errorMessage", "You already have access to the club.")
        res.redirect("/");
    } else {
        res.render('joinclub',{title:"Join the Club"});
    }
}

exports.join_club_post = function(req, res, next){

    if(req.body.clubPassword === process.env.Club_Password ){
        let user = res.locals.currentUser;
        user.userAccess = true;
        User.findByIdAndUpdate(user._id,user,{},function(err, newUser){
            req.flash("successMessage", "Welcome to the club ! Now you can post to the club !")
            res.redirect("/");
        });
    } else {
        res.render('joinclub',{title:"Join the Club", errorMessage:"Oops! Incorrect Password. Please try again."});
    }
}

exports.delete_message_get = function(req, res, next){
    Post.findByIdAndDelete(req.params.postID, {}, function(err){
        if(err) { return next(err); }
        req.flash("successMessage", "Post has been deleted.")
        res.redirect("/"); 
    })
}