var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');
// 이게 없으면 어떻게 DB가 구성되어있는지 알수 없다.
var CommentsSchema = new Schema({
    content : String,
    created_at : {
        type : Date,
        default : Date.now()
    },
    product_id : Number
});
// model: XXX --> XXX 콜렉션을 생성
CommentsSchema.plugin( autoIncrement.plugin , { model: "comments", field : "id", startAt : 1 });
module.exports = mongoose.model( "comments", CommentsSchema);