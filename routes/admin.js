/*
    author : 용원
    어드민 페이지
*/
var express = require('express');
var router = express.Router(); 
// Products DB저장
var ProductsModel = require('../models/ProductsModel');
// comments 
var CommentsModel = require('../models/CommentsModel');
var CheckoutModel = require('../models/CheckoutModel');
var adminRequired = require('../libs/adminRequired');
// 
var csrf = require('csurf');
var csrfProtection = csrf({ cookie: true });
var co = require('co');
//이미지 저장되는 위치 설정
var path = require('path');
var uploadDir = path.join( __dirname , '../uploads' ); //uploads경로가 최상위 shopping에서 두단계 아래이므로 루트의 uploads위치에 저장한다.
var fs = require('fs');

//multer 셋팅 이미지 저장 npm
var multer  = require('multer');
var storage = multer.diskStorage({
    destination : function (req, file, callback) { //이미지가 저장되는 도착지 지정
        callback(null, uploadDir );
    },
    filename : function (req, file, callback) { // products-날짜.jpg(png) 저장 
        callback(null, 'products-' + Date.now() + '.'+ file.mimetype.split('/')[1] );
    }
});
var upload = multer({ storage: storage });


//res.render
//res.send
//경로가 admin이 최상위 경로임
router.get('/',adminRequired,function(req,res){
    res.send('admin app'); 
});
// 미들웨어 get에 넣으면 중간 미들웨어 함수가 작동하고 통과할때만 다음 콜백 함수로 넘어감
function testMiddleWare(req,res,next){
    console.log('test MiddleWare');
    // if(1==2){
        next();
    // }
}

router.get('/products',adminRequired,function(req,res){
    if(!req.isAuthenticated()){
        res.send('<script>alert("로그인이 필요한 서비스입니다.");location.href="/accounts/login";</script>');
    }else{
        ProductsModel.find(function (err,products) {
            res.render('admin/products',
                { products : products} 
                
                //DB에서 받은 products 를 products 변수명으로 내보냄
            );
        });
    }
    
    
});
//module.exports
//요청이 /(어드민)/products/write 로오면
// admin 폴더밑에 form.ejs 를 보내라 라는뜻
router.get('/products/write', adminRequired,csrfProtection , function (req,res) { 
    //여기서 products 선언안하면 form.ejs에서 수정하기때 가져오려고했던 값때문에 선언안됬다고 에러남
    res.render('admin/form', { product : "" , csrfToken : req.csrfToken() });
 });
// 저장할때 타입에 맞지않으면 저장안됨 (로그가안남네..?)
router.post('/products/write',adminRequired,upload.single('thumbnail'), csrfProtection ,function(req,res){
    //multer의 정보를 다저장
    console.log(req.file);
    var product = new ProductsModel({
        name : req.body.name,
        thumbnail : (req.file)?req.file.filename : "",
        price : req.body.price,
        description : req.body.description,
        username : req.user.username // req.user에 passport에 받아온 username이 모두 저장되어있다.
    });
    var validationError = product.validateSync();
    if(validationError){
        res.send(validationError);
    }else{
        product.save(function(err){
            res.redirect('/admin/products');
        });
    }
});

//상세페이지
router.get('/products/detail/:id',adminRequired , csrfProtection ,function(req, res){
    //url 에서 변수 값을 받아올떈 req.params.id 로 받아온다
    ProductsModel.findOne( { 'id' :  req.params.id } , function(err ,product){
        //제품정보를 받고 그안에서 댓글을 받아온다.
        //전체 다가져올때는 findOne이 아니라 find
        CommentsModel.find({ product_id : req.params.id } , function(err, comments){
            res.render('admin/productsDetail', { product: product , comments : comments });
        });        
    });
});

//상세페이지
router.get('/products/edit/:id' ,adminRequired,csrfProtection, function(req, res){
    
    
    
    //url 에서 변수 값을 받아올떈 req.params.id 로 받아온다
    ProductsModel.findOne( { 'id' :  req.params.id } , function(err ,product){
        //product로 넘기니까productsDetail.ejs 에서 product.xxx로 호출해야함
        res.render('admin/form', { product: product ,csrfToken : req.csrfToken() });  
    });
});

router.post('/products/edit/:id',adminRequired, upload.single('thumbnail') ,function(req, res){
    
    //넣을 변수 값을 셋팅한다
    ProductsModel.findOne( {id:req.params.id},function(err,product){

        if(req.file && product.thumbnail){//DB에 그전 파일명으로 조회했을때 있어야함
            fs.unlinkSync(uploadDir + '/' + product.thumbnail);
        }
        var query = {   
            name : req.body.name,
            //요청이 있으면 요청파일명 없으면 그전의 파일명 조회후 그 파일명
            thumbnail : (req.file) ? req.file.filename : product.thumbnail,
            price : req.body.price,
            description : req.body.description,
        };

    //update의 첫번째 인자는 조건, 두번째 인자는 바뀔 값들
        ProductsModel.update({ id : req.params.id }, { $set : query }, function(err){
            res.redirect('/admin/products/detail/' + req.params.id ); //수정후 본래보던 상세페이지로 이동
        });
    });
});

router.get('/products/detail/:id',adminRequired , function(req, res){
    var getData = co(function* (){
        var product = yield ProductsModel.findOne( { 'id' :  req.params.id }).exec();
        var comments = yield CommentsModel.find( { 'product_id' :  req.params.id }).exec();
        return {
            product : product,
            comments : comments
        };
    });
    getData.then( function(result){
        res.render('admin/productsDetail', { product: result.product , comments : result.comments });
    });
});

// ajax 라우팅
router.post('/products/ajax_comment/insert',adminRequired, function(req,res){
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

router.post('/products/ajax_comment/delete',adminRequired, function(req,res){
   
    CommentsModel.remove({id : req.body.comment_id }, function(err){
        res.json({ message : "success" });
    });

});


router.post('/products/ajax_summernote', adminRequired, upload.single('thumbnail'), function(req,res){
    res.send( '/uploads/' + req.file.filename);
});

router.get('/order', adminRequired,function(req,res){
    CheckoutModel.find( function(err, orderList){ //첫번째 인자는 err, 두번째는 받을 변수명
        res.render( 'admin/orderList' , 
            { orderList : orderList }
        );
    });
});
router.get('/order/edit/:id',adminRequired, function(req,res){
    CheckoutModel.findOne( { id : req.params.id } , function(err, order){
        res.render( 'admin/orderForm' , 
            { order : order }
        );
    });
});
router.post('/order/edit/:id', adminRequired, function(req,res){
    var query = {
        status : req.body.status,
        song_jang : req.body.song_jang
    };

    CheckoutModel.update({ id : req.params.id }, { $set : query }, function(err){
        res.redirect('/admin/order');
    });
});
router.get('/statistics', adminRequired, function(req,res){
    CheckoutModel.find( function(err, orderList){ 

        var barData = [];   // 넘겨줄 막대그래프 데이터 초기값 선언
        var pieData = [];   // 원차트에 넣어줄 데이터 삽입
        orderList.forEach(function(order){
            // 08-10 형식으로 날짜를 받아온다
            var date = new Date(order.created_at);
            var monthDay = (date.getMonth()+1) + '-' + date.getDate();
            
            // 날짜에 해당하는 키값으로 조회
            // 날짜별로 배열에 값 분기해서 넣음( 막대그래프는 날짜별 구매자 수이므로 )
            if(monthDay in barData){ 
                barData[monthDay]++; //있으면 더한다
            }else{
                barData[monthDay] = 1; //없으면 초기값 1넣어준다.
            }

            // 결재 상태를 검색해서 조회
            // 해당 결제상태별로 분기처리해야하므로
            if(order.status in pieData){
                pieData[order.status]++; //있으면 더한다
            }else{
                pieData[order.status] = 1; //없으면 결재상태+1
            }

        });

        res.render('admin/statistics' , { barData : barData , pieData:pieData });
    });
});






module.exports = router;