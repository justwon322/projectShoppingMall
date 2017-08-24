var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');
// 이게 없으면 어떻게 DB가 구성되어있는지 알수 없다.
// 생성자함수
var UserSchema = new Schema({
    username : {
        type : String,
        //validation 체크
        required: [true, '아이디는 필수입니다.']
    },
    password : {
        type : String,
        required: [true, '패스워드는 필수입니다.']
    },
    displayname : String,
    created_at : {
        type : Date,
        default : Date.now()
    }
});
 
UserSchema.plugin( autoIncrement.plugin , { model : "user", field : "id" , startAt : 1 } );
module.exports = mongoose.model('user' , UserSchema);