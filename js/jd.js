
var aboutme = "***京东夺宝岛抢拍-V 1.0-小逗粑粑***\n"

console.log(aboutme);
console.log("个人主页：http://weibo.com/kongkongss");


var code = "<div id='qp_div'>"
        + "最高出价<input type='text' id='qp_max_price' />&nbsp;&nbsp;&nbsp;&nbsp;"
        + "递增金额<input type='text' id='qp_inc_amount' />&nbsp;&nbsp;&nbsp;&nbsp;"
        + "<input type='button' value='后台抢拍' id='qp_btn_begin' class='qp_btn'/>&nbsp;&nbsp;&nbsp;&nbsp;"
        + "<input type='button' value='手动抢拍' id='qp_btn_manual' class='qp_btn'/>&nbsp;&nbsp;&nbsp;&nbsp;"
        + "【抢拍间隔两秒】<span id='say' style='color:red;'></span>"
        + "</div>";
$('body').prepend(code);

// 取商品拍卖编号
var num = queryNum();
// 取商品售价
var priceSale = queryPriceSale();

var timer;

$('#qp_btn_begin').on('click', function () {
    queryPriceCurrent(num, true);
});

$('#qp_btn_manual').on('click', function() {
    clearTimeout(timer);
    queryPriceCurrent(num, false);
});

function queryNum() {
    var addr = window.location.href;
    var ind = addr.lastIndexOf('/');
    var num = addr.substring(ind+1)
    return num;
}

// 取商品商城售价
function queryPriceSale(){
    var price = $('.product_intro > .intro_detail .auction_intro del').html()
    if (price== undefined || price == '') {
        price = $('.product_intro > .intro_detail .auction_intro #auction1dangqianjia').html()
        if (price == undefined || price == '') {
            console.info("获取商品商城售价失败!");
            return;
        }
    };
    console.info("商品售价为:"+price);
    price = price.substring(1)
    return price
}

function queryPriceCurrent(num, auto) {
    var host = "http://paimai.jd.com"
    var currentInterface = host + "/services/currentList.action?paimaiIds="+num+"&callback=showData&t=1432893946478&callback=jQuery8717195&_=1432893946480"
    $.get(currentInterface, function(data) {
        var start = data.indexOf('[')
        var end = data.lastIndexOf(']') + 1
        data = data.substring(start, end)

        var objs = $.parseJSON(data)
        var priceCurrent = objs[0].currentPrice
        console.info("商品当前报价："+priceCurrent)
        // 拍卖报价
        var increaseAmount = $('#qp_inc_amount').val()
        if (increaseAmount == null || increaseAmount == '' || increaseAmount == undefined) {
            increaseAmount = 1;
        };
        bid(num, (priceCurrent * 1 + increaseAmount * 1.00), auto)
    });
}

function bid(paimaiId, price, auto) {
    var max = $('#qp_max_price').val()
    if (max == null || max == '') {
        clearTimeout(timer);
        console.info("请输入最高出价!");
        return;
    };
    console.info("priceCurrent * 1 + increaseAmount="+price)
    if (price*1.00 < max*1.00) {
        var url = "/services/bid.action?t=" + getRamdomNumber();
        var data = {paimaiId:paimaiId,price:price,proxyFlag:0,bidSource:0};
        jQuery.getJSON(url,data,function(jqXHR){
            if(jqXHR!=undefined){
                if(jqXHR.result=='200'){
                    console.info("恭喜您，出价成功:" + price);
                }else if(jqXHR.result=='login'){
                    window.location.href='http://passport.jd.com/new/login.aspx?ReturnUrl='+window.location.href;
                }else{
                    // {"message":"同一用户连续出价","result":525}
                    // {"message":"拍卖出价频率过快","result":517}
                    console.info("很抱歉，出价失败" + jqXHR.message);
                };
                if (auto && jqXHR.result == '525') {
                    timer = setTimeout("queryPriceCurrent(num, true)",1900);
                }else{
                    timer = setTimeout("queryPriceCurrent(num, true)",2000);
                };
            }
        });
    } else {
        console.info("当前价：" + price +", 已超出你的报价最大值" + max)
    }
}

function getRamdomNumber(){
    var num=""; 
    for(var i=0;i<6;i++) 
    { 
        num+=Math.floor(Math.random()*10); 
    } 
    return num;
}







