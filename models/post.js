var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var {DateTime} = require("luxon");

var PostSchema = Schema({
    post_title: {type:String, required:true},
    post_body: {type:String, required:true},
    post_user: {type:String, required:true},
    post_time : {type:Date, default:Date.now()}
});

PostSchema
.virtual("date_of_post")
.get(function(){
    return DateTime.fromJSDate(this.post_time).toLocaleString(DateTime.DATETIME_MED);
});

module.exports = mongoose.model("Post", PostSchema);