var mongoose = require("mongoose");
var Schema = mongoose.Schema;


var UserSchema = Schema({
    userEmail: {type:String,required:true},
    username: {type:String, required:true},
    password: {type:String, required:true},
    userAccess: {type:Boolean, default:false},
    userAdmin: {type:Boolean, default:false}
});

module.exports = mongoose.model("User", UserSchema);