var express = require('express');
var router = express.Router(); 
var UserModel = require('../models/UserModel');
var passwordHash = require('../libs/passwordHash');

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy; // 로컬에 있는 데이터 기준 페이스북 으로할꺼면 passport-facebook 으로 주면됨

passport.serializeUser(function (user, done) {
    console.log('serializeUser');
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    var result = user;   // 꼭 담아줘야함 함수 접근경로(inside javascript)
    result.password = "";// 세션에 패스워드가 노출되면 안되니까 비워주는거임
    console.log('deserializeUser'); // 레디스?
    done(null, result);
});

passport.use(new LocalStrategy({
        usernameField: 'username',
        passwordField : 'password',
        passReqToCallback : true
    }, 
    function (req, username, password, done) {
        UserModel.findOne({ username : username , password : passwordHash(password) }, function (err,user) {
            if (!user){
                return done(null, false, { message: '아이디 또는 비밀번호 오류 입니다.' });
            }else{
                return done(null, user );
            }
        });
    }
));
//경로가 user이 최상위 경로임
router.get('/',function(req,res){
    res.send('account app'); 
});
router.post('/join',function(req,res){
    var User = new UserModel({
        username : req.body.username,
        password : passwordHash(req.body.password),
        displayname : req.body.displayname
    });
    User.save(function(err){
        res.send('<script>alert("회원가입 성공");\
        location.href="/";</script>');
    });
});
router.get('/join',function(req,res){
    res.render('accounts/join'
    );
});
router.get('/login', function(req, res){
    res.render('accounts/login' , { flashMessage : req.flash().error });
});

router.post('/login' , 
    passport.authenticate('local', { 
        failureRedirect: '/accounts/login', 
        failureFlash: true 
    }), 
    function(req, res){
        res.send('<script>alert("로그인 성공");location.href="/";</script>');
    }
);

router.get('/success', function(req, res){
    res.send(req.user);
});


router.get('/logout', function(req, res){
    req.logout();
    res.redirect('/accounts/login');
});

module.exports = router;