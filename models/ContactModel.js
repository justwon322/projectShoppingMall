var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');
// 이게 없으면 어떻게 DB가 구성되어있는지 알수 없다.
// 생성자함수
var ContactSchema = new Schema({
    content : String,
    cell : String,
    name : String,
    created_at : {
        type : Date,
        default : Date.now()
    },
    contact_seqn_id : Number
});
// model: XXX --> XXX 콜렉션을 생성
ContactSchema.plugin( autoIncrement.plugin , { model: "contact", field : "id", startAt : 1 });
module.exports = mongoose.model( "contact", ContactSchema);