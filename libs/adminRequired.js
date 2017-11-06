module.exports = function(req, res, next) {//로그인 권한체크 미들웨어
    if (!req.isAuthenticated()){ 
        res.redirect('/accounts/login');
    }else{
        if(req.user.username!=='admin'){
            res.send('<script>alert("관리자만 접근가능합니다.");location.href="/accounts/login";</script>');
        }else{
            return next();
        }
    }
};