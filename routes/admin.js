/*
    author : 용원
    어드민 페이지
*/
var express = require('express');
var router = express.Router(); 
// Products DB저장
var ProductsModel = require('../models/ProductsModel');
//res.render
//res.send
//경로가 admin이 최상위 경로임
router.get('/',function(req,res){
    res.send('admin app'); 
});

router.get('/products',function(req,res){
    ProductsModel.find(function (err,products) {
        res.render('admin/products',
            { products : products} 
            
            //DB에서 받은 products 를 products 변수명으로 내보냄
        );
    });
    
});
//module.exports
//요청이 /(어드민)/products/write 로오면
// admin 폴더밑에 form.ejs 를 보내라 라는뜻
router.get('/products/write',function (req,res) { 
    //
    res.render('admin/form');
 });
// 저장할때 타입에 맞지않으면 저장안됨 (로그가안남네..?)
router.post('/products/write', function(req,res){
    var product = new ProductsModel({
        name : req.body.name,
        price : req.body.price,
        description : req.body.description,
    });
    product.save(function(err){
        res.redirect('/admin/products');
    });
});


//상세페이지
router.get('/products/detail/:id' , function(req, res){
    //url 에서 변수 값을 받아올떈 req.params.id 로 받아온다
    ProductsModel.findOne( { 'id' :  req.params.id } , function(err ,product){
        //product로 넘기니까productsDetail.ejs 에서 product.xxx로 호출해야함
        res.render('admin/productsDetail', { product: product });  
    });
});


module.exports = router;