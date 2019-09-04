
var express = require('express');
var router = express.Router();

var Category = require('../models/Category');
var Content = require('../models/Content');
var User = require("../models/User");

var data;
function beautySub(str, len) {
    var reg = /[\u4e00-\u9fa5]/g,    //专业匹配中文
        slice = str.substring(0, len),
        chineseCharNum = (~~(slice.match(reg) && slice.match(reg).length)),
        realen = slice.length*2 - chineseCharNum;
    return str.substr(0, realen) + (realen < str.length ? "..." : "");
}

/*
* 处理通用的数据
* */
router.use(function (req, res, next) {
    data = {
        userInfo: req.userInfo,
        categories: []
    }
    Category.find().then(function(categories) {
        data.categories = categories;
        Content.find().then(function (contents) {
            data.contents = contents;
            let sum = 0;
            for (let i = 0; i < contents.length;i++){
                sum+=contents[i].views;
            };
            data.viewsSum = sum;
            data.count = contents.length;
            
            User.find().then(function(users){
                data.usersNumber = users.length;
            });
        });
        next();
    });
});

/*
* 首页
* */
router.get('/', function(req, res, next) {
    data.category = req.query.category || '';
    data.count = 0;
    data.page = Number(req.query.page || 1);
    data.limit = 2;
    data.pages = 0;
    var where = {};
    if (data.category) {
        where.category = data.category
    }
    Content.where(where).count().then(function(count) {
        data.count = count;
        //计算总页数
        data.pages = Math.ceil(data.count / data.limit);
        //取值不能超过pages
        data.page = Math.min( data.page, data.pages );
        //取值不能小于1
        data.page = Math.max( data.page, 1 );
        var skip = (data.page - 1) * data.limit;
        return Content.where(where).find().limit(data.limit).skip(skip).populate(['category', 'user']).sort({
            addTime: -1
        });
    }).then(function(contents) {
        data.contents = contents;
        res.render('main/index', data);
    })
});

router.get('/view', function (req, res){
    var contentId = req.query.contentid || '';
    Content.findOne({
        _id: contentId
    }).then(function (content) {
        data.content = content;
        Category.findOne({_id: content.category}).then(function(category) {
            data.content.category = category;
            content.views++;
            content.save();
            res.render('main/view', data);
        });
    });
});

module.exports = router;