
var aboutme = "***京东夺宝岛抢拍-V 1.0-小逗粑粑***\n"

console.log(aboutme);
console.log("个人主页：http://weibo.com/kongkongss");


var code = "<div id='qp_div'>"
        + "最高出价<input type='text' id='qp_max_price' />&nbsp;&nbsp;&nbsp;&nbsp;"
        + "递增金额<input type='text' id='qp_inc_amount' />&nbsp;&nbsp;&nbsp;&nbsp;"
        + "<input type='button' value='后台抢拍' id='qp_btn_begin' class='qp_btn'/>&nbsp;&nbsp;&nbsp;&nbsp;"
        + "<input type='button' value='手动抢拍' id='qp_btn_manual' class='qp_btn'/>&nbsp;&nbsp;&nbsp;&nbsp;"
        + "<input type='button' value='剩余时间' id='qp_btn_remain' class='qp_btn'/>&nbsp;&nbsp;&nbsp;&nbsp;"
        + "</div>";
$('body').prepend(code);

// 取商品拍卖编号
var num = queryNum();
// 取商品售价
var priceSale = queryPriceSale();
// 准备出价
var myMoney;

var timer;

$('#qp_btn_begin').on('click', function () {
    queryPriceCurrent(num, true);
});

$('#qp_btn_manual').on('click', function() {
    clearTimeout(timer);
    queryPriceCurrent(num, false);
});

$('#qp_btn_remain').on('click', function() {
    queryCurRemainTime(num, function () {
    });
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
            console.info("获取商品商城售价失败!");
            return;
    };
    console.info("商品售价为:"+price);
    price = price.substring(1)
    return price
}

http://dbitem.jd.com/json/current/englishquery?paimaiId=11886385&skuId=0&t=211184&start=0&end=9

function queryCurRemainTime (num, Fun) {
    // var host = "http://paimai.jd.com"
    // var currentInterface = host + "/services/currentList.action?paimaiIds="+num+"&callback=showData&t=1432893946478&callback=jQuery8717195&_=1432893946480"
    var host = "http://dbditem.jd.com"    
    var currentInterface = host + "/json/current/englishquery?paimaiId="+num+"&skuId=0&t=211184&start=0&end=9"
    $.get(currentInterface, function (data) {
        // var start = data.indexOf('[')
        // var end   = data.lastIndexOf(']') + 1
        // data = data.substring(start, end)

        // var objs = $.parseJSON(data)
        // var priceCurrent = objs[0].currentPrice
        // var remainTime   = objs[0].remainTime

        var priceCurrent = data["currentPrice"]
        var remainTime   = data["remainTime"]

        var time = configIntTime(remainTime);
        console.info("剩余时间: "+remainTime)
        if (time.minute > 0) {
            console.info("商品当前报价："+priceCurrent+"     "+"剩余时间: "+time.minute+"分:"+time.second+"秒"+time.minSecond+"毫秒")
        }else{
            console.info("商品当前报价："+priceCurrent+"     "+"剩余时间: "+time.second+"秒"+time.minSecond+"毫秒")
        };

        var productInfo = {};
        productInfo.priceCurrent = priceCurrent;
        productInfo.remainTime   = remainTime;
        productInfo.minute       = time.minute;
        productInfo.second       = time.second;
        productInfo.minSecond    = time.minSecond;
        Fun(productInfo);
    });
}

function configIntTime (intTime) {
        if (intTime < 0){
            var time = {}
            time.minute = -1
            time.second = -1
            time.minSecond = -1
            return time
        }
        var totalSecond = Math.floor(intTime / 1000) 
        var minute = Math.floor(totalSecond / 60) 
        var second = Math.floor(totalSecond % 60) 
        var minSecond = intTime - totalSecond * 1000;
        var time = {};
        time.minute = minute;
        time.second = second;
        time.minSecond = minSecond;
        return time;
}

function queryPriceCurrent(num, auto) {
    queryCurRemainTime(num, function (productInfo){
        var priceCurrent = productInfo.priceCurrent; //当前报价
        // 拍卖报价
        var increaseAmount = $('#qp_inc_amount').val()
        if (increaseAmount == null || increaseAmount == '' || increaseAmount == undefined) {
            increaseAmount = 1;
        };        

        var max = $('#qp_max_price').val()
        if (max == null || max == '') {
            clearTimeout(timer);
            console.info("请输入最高出价!");
            return;
        };
        var money = priceCurrent * 1 + increaseAmount * 1.00
        myMoney = money
        console.info("准备出价: "+money+"     "+"最大出价: "+max)

        if (priceCurrent*1.00 > max*1.00){
            console.info("当前价：" + priceCurrent +", 已超出你的报价最大值" + max)
            return;
        };

        if (auto) {
            if (productInfo.minute > 0) {
                console.info("时间还太早了哦!")
                clearTimeout(timer);
                timer = setTimeout("queryPriceCurrent(num, true)",50000);
                return;
            }else{
                if (productInfo.second > 10) {
                    clearTimeout(timer);
                    timer = setTimeout("queryPriceCurrent(num, true)",5000);
                    return;
                }else if (productInfo.second <= 10 && productInfo.second > 2){
                    clearTimeout(timer);
                    timer = setTimeout("queryPriceCurrent(num, true)",500);
                    return;
                }else{
                    // if (productInfo.second < 0) {
                    //     clearTimeout(timer);
                    //     timer = setTimeout("queryPriceCurrent(num, false)",500);
                    //     return;
                    // }
                    // if (productInfo.second < 1) {
                        clearTimeout(timer);
                        var waitTime = productInfo.remainTime - 1750;
                        console.info("小于3秒remainTime:"+productInfo.remainTime+"----------waitTime:"+waitTime)
                        if (waitTime > 0) {
                            timer = setTimeout("queryPriceCurrent(num, false)",waitTime);
                        }else{
                            queryPriceCurrent(num, false);
                        }
                        return;
                    // }
                    // clearTimeout(timer);
                    // timer = setTimeout("queryPriceCurrent(num, true)",300);
                    // return;
                };
            };

        }else{
            bid(num, money)
        };
        
    });   
}

// http://dbditem.jd.com/services/bid.action?t=511152&paimaiId=11979774&price=1170&proxyFlag=0&bidSource=0
function bid(paimaiId, price) {
    
    var url = "http://dbditem.jd.com/services/bid.action?t=" + getRamdomNumber();
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
        }
    });
}

function getRamdomNumber(){
    var num=""; 
    for(var i=0;i<6;i++) 
    { 
        num+=Math.floor(Math.random()*10); 
    } 
    return num;
}







