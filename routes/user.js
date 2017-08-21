/*
    author : 용원
    유저 페이지
*/
var express = require('express');
var router = express.Router(); 
// Contacts DB저장
var ContactModel = require('../models/ContactModel');
//경로가 admin이 최상위 경로임
router.get('/',function(req,res){
    res.send('user app'); 
});

router.get('/contact',function(req,res){
    ContactModel.find(function (err,contact) {
        res.render('user/contact',
            { contact : contact} 
            
            //DB에서 받은 products 를 products 변수명으로 내보냄
        );
    });
    
});
//module.exports
//요청이 /(어드민)/products/write 로오면
// admin 폴더밑에 form.ejs 를 보내라 라는뜻
router.get('/contact/write',function (req,res) { 
    //여기서 products 선언안하면 form.ejs에서 수정하기때 가져오려고했던 값때문에 선언안됬다고 에러남
    res.render('user/form', {contact : ""});
 });
// 저장할때 타입에 맞지않으면 저장안됨 (로그가안남네..?)
router.post('/contact/write', function(req,res){
    var contact = new ContactModel({
        name : req.body.name,
        cell : req.body.cell,
        content : req.body.content,
    });
    contact.save(function(err){
        res.redirect('/user/contact');
    });
});


//상세페이지
router.get('/contact/detail/:id' , function(req, res){
    //url 에서 변수 값을 받아올떈 req.params.id 로 받아온다
    ProductsModel.findOne( { 'id' :  req.params.id } , function(err ,product){
        //제품정보를 받고 그안에서 댓글을 받아온다.
        //전체 다가져올때는 findOne이 아니라 find
        CommentsModel.find({ product_id : req.params.id } , function(err, comments){
            res.render('user/productsDetail', { product: product , comments : comments });
        });        
    });
});

//상세페이지
router.get('/user/edit/:id' , function(req, res){
    //url 에서 변수 값을 받아올떈 req.params.id 로 받아온다
    ProductsModel.findOne( { 'id' :  req.params.id } , function(err ,product){
        //product로 넘기니까productsDetail.ejs 에서 product.xxx로 호출해야함
        res.render('user/form', { product: product });  
    });
});

router.post('/products/edit/:id', function(req, res){
    //넣을 변수 값을 셋팅한다
    var query = {
        name : req.body.name,
        price : req.body.price,
        description : req.body.description,
    };

    //update의 첫번째 인자는 조건, 두번째 인자는 바뀔 값들
    ProductsModel.update({ id : req.params.id }, { $set : query }, function(err){
        res.redirect('/admin/products/detail/' + req.params.id ); //수정후 본래보던 상세페이지로 이동
    });
});

router.get('/products/delete/:id', function(req, res){
    ProductsModel.remove({ id : req.params.id }, function(err){
        res.redirect('/admin/products');
    });
});

// ajax 라우팅
router.post('/products/ajax_comment/insert', function(req,res){
    var comment = new CommentsModel({
        content : req.body.content,
        product_id : parseInt(req.body.product_id)
    });
    comment.save(function(err, comment){
        res.json({
            id : comment.id,
            content : comment.content,
            message : "success"
        });
    });

});

router.post('/products/ajax_comment/delete', function(req,res){
   
    CommentsModel.remove({id : req.body.comment_id }, function(err){
        res.json({ message : "success" });
    });

});

module.exports = router;