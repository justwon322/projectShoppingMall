var express = require('express');
var router = express.Router(); 
var UserModel = require('../models/UserModel');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy; // 로컬에 있는 데이터 기준 페이스북 으로할꺼면 passport-facebook 으로 주면됨

passport.serializeUser(function (user, done) {
    done(null, user);
});
 
passport.deserializeUser(function (user, done) {
    done(null, user);
});

passport.use(new FacebookStrategy({

    clientID : '270773553426391',
    clientSecret : 'a1ba3a35ad4b75a4ceeea17c8e6bfa9d',
    callbackURL : 'http://ec2-18-217-1-55.us-east-2.compute.amazonaws.com:3000/auth/facebook/callback',
    profileFields : [ 'id','displayName','photos','email']

},
    function(accessToken,refreshToken,profile,done){
        console.log(profile);
        UserModel.findOne({ username : "fb_" + profile.id }, function(err, user){//카카오등과 겹칠수있기때문
            if(!user){  //없으면 회원가입 후 로그인 성공페이지 이동
                var regData = { //DB에 등록 및 세션에 등록될 데이터
                    username :  "fb_" + profile.id,
                    password : "facebook_login",
                    displayname : profile.displayName
                };
                var User = new UserModel(regData);
                User.save(function(err){ //DB저장
                    done(null,regData); //세션 등록
                });
            }else{ //있으면 DB에서 가져와서 세션등록
                done(null,user);
            }
 
        });
    }

));

// http://localhost:3000/auth/facebook 접근시 facebook으로 넘길 url 작성해줌
router.get('/facebook', passport.authenticate('facebook', { scope: 'email'}) );


//인증후 페이스북에서 이 주소로 리턴해줌. 상단에 적은 callbackURL과 일치
router.get('/facebook/callback',
   passport.authenticate('facebook', 
       { 
           successRedirect: '/',
           failureRedirect: '/auth/facebook/fail' 
       }
   )
);

//로그인 성공시 이동할 주소
router.get('/facebook/success', function(req,res){
   res.send(req.user);
});

router.get('/facebook/fail', function(req,res){
   res.send('facebook login fail');
});

module.exports = router;