module.exports = function(req, res, next) {
    if (!req.isAuthenticated()){  // passport에서 자동으로지원해주는 함수
        res.redirect('/accounts/login');
    }else{
        return next(); // next는 제어권을 다음으로 넘기는 미들웨어용 함수
    }
};