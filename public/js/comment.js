var prepage = 2;
var page = 1;
var pages = 0;
var comments = [];
//提交评论
$('#messageBtn').on('click',function() {
    if($('#messageContent').val() == ""){
        $('.inputErr').html('<div style="margin-bottom:10px;">请输入评论~</div>');
    }
    else{
        $('.inputErr').html('');
        $.ajax({
            type: 'POST',
            url: 'api/comment/post',
            data: {
                contentid: $('#contentId').val(),
                content: $('#messageContent').val()
            },
            success: function(responseData) {
                content: $('#messageContent').val('');
                comments = responseData.data.comments.reverse();
                renderComment();
            }
        })
    }
});
//每次页面重载时获取一下该文章的所有评论
$.ajax({
    url: "/api/comment",
    data: {
        contentid: $("#contentId").val()
    },
    success: function(responseData) {
        comments = responseData.data.reverse();
        renderComment();
    }
});
$('.pager').off().delegate('a','click',function(){ 
    if($(this).hasClass('pre')){
        page--;
    }else{
        page++;
    }
    renderComment();
});
function renderComment() {
    $('#messageCount').html(comments.length);

    var pages = Math.ceil(comments.length / prepage);
    if(pages == 0){
        pages = 1;
    }
    var start = (page - 1) * prepage;
    var end = start + prepage;
    if(end > comments.length){
        end = comments.length;
    }
    var $lis = $('.pager li');
    $lis.eq(1).html( page + "/" + pages);

    if(page <= 1){
        page = 1;
        $lis.eq(0).html('<span><img class="imgTurnLeft" src="../../public/images/noLeft.svg"></span>');
    } else{
        $lis.eq(0).html('<a id="pre" class="pre" href="javascript:;"><img class="imgTurnLeft" src="../../public/images/turnLeft.svg"></a>');
    }
    if(page >= pages){
        page = pages;
        $lis.eq(2).html('<span><img class="imgTurnLeft" src="../../public/images/noRight.svg"></span>');
    }else{
        $lis.eq(2).html('<a id="next" class="next" href="javascript:;"><img class="imgTurnLeft" src="../../public/images/turnRight.svg"></a>');
    }

    var html = '';
    for(var i = start;i < end;i++){
        html += '<div class="messageBox">' + 
        '<p class="name clear"><img class="imgDiscuss fl" src="../../public/images/peopleDiscuss.svg"><span class="fl">' + comments[i].username + 
        '</span><span class="fr"><img class="imgDiscussTime fl" src="../../public/images/time.svg">' + formatDate(comments[i].postTime) +
        '</span></p><p><img class="imgDiscussContent fl" src="../../public/images/disContent.svg">' + 
        comments[i].content +'</p>' + 
    '</div>';
    }
    $('.messageList').html(html);
}

function formatDate(d) {
    var date1 = new Date(d);
    return date1.getFullYear() + '年' + (date1.getMonth() + 1) + '月' + date1.getDate() + '日' + date1.getHours() + ':' + date1.getMinutes() + ':' + date1.getSeconds();
}