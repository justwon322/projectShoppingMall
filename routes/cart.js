var express = require('express');
var router = express.Router();
var ProductsModel = require('../models/ProductsModel');

router.get('/' , function(req, res){
    
    var totalAmount = 0; //총결제금액
    var cartList = {}; //장바구니 리스트
    //쿠키가 있는지 확인해서 뷰로 넘겨준다
    if( typeof(req.cookies.cartList) !== 'undefined'){
        //장바구니데이터
        var cartList = JSON.parse(unescape(req.cookies.cartList));//unescape???

        //총가격을 더해서 전달해준다.
        for( var key in cartList){
            totalAmount += parseInt(cartList[key].amount);
        }
        /*
        for( var key in cartList){
            
            ProductsModel.findOne( { 'id' :  key } , function(err ,product){
                
                totalAmount += product.price * cartList[key].amount;
                tempamount += totalAmount;
                 console.log(totalAmount);
                return totalAmount;
            });
             console.log(tempamount);
        }
        */
    }
    
    res.render('cart/index', { cartList : cartList , totalAmount : totalAmount } );
});


module.exports = router;