/*
*/


var express = require('express');
var path = require('path');
// logging 처리위한 npm module
var logger = require('morgan');
//bodyParser : form 에서 넘어온 객체를
//javascript 객체로 매핑
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
//flash  메시지 관련
var flash = require('connect-flash');
//passport 로그인 관련
var passport = require('passport');
var session = require('express-session');

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
var accounts = require('./routes/accounts');
var user = require('./routes/user');
var auth = require('./routes/auth');

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


//업로드 path 추가
app.use('/uploads', express.static('uploads'));
//session 관련 셋팅
app.use(session({
    secret: 'fastcampus',// 쿠키 임의변조 방지용 salt랑 같은개념으로보면될듯
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 2000 * 60 * 60 //지속시간 2시간
    }
}));

//passport 적용
app.use(passport.initialize());
app.use(passport.session());

//플래시 메시지 관련
app.use(flash());
//라우터 위에 둬야함 라우팅이 뜨기 전에 되버리면 안됨 
//로그인 정보 뷰에서만 변수로 셋팅, 전체 미들웨어는 router위에 두어야 에러가 안난다
app.use(function(req, res, next) {
    app.locals.isLogin = req.isAuthenticated();//passport 이니셜라이징 한뒤로 req에 포함
    //app.locals.urlparameter = req.url; //현재 url 정보를 보내고 싶으면 이와같이 셋팅
    //app.locals.userData = req.user; //사용 정보를 보내고 싶으면 이와같이 셋팅
    next();
  });

//라우팅
//어드민으로 요청이 들어오면 어드민모듈이 요청처리
app.get('/', function(req,res){
    res.send('first app');
});
app.use('/admin',admin);
app.use('/accounts',accounts);
app.use('/user',user);
app.use('/auth',auth);
app.listen( port, function(){
    console.log('Express listening on port', port);
});

