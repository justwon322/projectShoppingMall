/*
*/
// logging 처리위한 npm module
var logger = require('morgan');
//bodyParser : form 에서 넘어온 객체를
//javascript 객체로 매핑
var bodyParser = require('body-parser');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
//MongoDB 접속
/*
    desc : 몽고 디비 접속 은 라우팅 위에 (규칙)
*/
var mongoose = require('mongoose');
// Promise???
mongoose.Promise = global.Promise;
var autoIncrement = require('mongoose-auto-increment');

var db = mongoose.connection;
db.on('error', console.error);
db.once('open', function(){
    console.log('mongodb connect');
});

var connect = mongoose.connect('mongodb://127.0.0.1:27017/fastcampus'// DB접속경로
, { useMongoClient: true });
// 시퀀스 자동으로 1씩 증가 
autoIncrement.initialize(connect);

var admin = require('./routes/admin');
var user = require('./routes/user');
var app = express();
var port = 3000;

// 확장자가 ejs 로 끈나는 뷰 엔진을 추가한다.
// 위치가 굉장히 중요
// path.join 은 앞의경로(app.js의경로 최상단임)
// 더하기 뒤의경로임
// __dirname 은 c:\부터 app.js경로까지(예약어임)
// view를 다모아놓을폴더 views를 만듬
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// 미들웨어 셋팅
// bodyparser >> 폼에서 넘어온 값들을 자바스크립트객체로 변환
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/uploads',express.static('uploads'));

app.get('/', function(req,res){
    res.send('first app!');
});

//라우팅
//어드민으로 요청이 들어오면 어드민모듈이 요청처리
app.use('/admin',admin);

app.use('/user',user);


app.listen( port, function(){
    console.log('Express listening on port', port);
});

