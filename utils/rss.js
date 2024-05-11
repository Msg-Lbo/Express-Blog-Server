const express = require('express');
const RSS = require('rss');
const query = require('../db');

const router = express.Router();

router.get('/', async (req, res) => {
    let feed = new RSS({
        title: '一楼没太阳',
        description: '只有坏掉的东西才会停下来',
        feed_url: 'http://192.168.31.20:5173/#/feed',
        site_url: 'http://192.168.31.20:5173',
        // image_url: 'http://example.com/icon.png',
        // managingEditor: '编辑',
        webMaster: '一楼没太阳',
        copyright: '版权信息',
        language: 'zh-cn',
        // pubDate: '发布日期',
        // ttl: '60',
        // generator: 'Feed for Node.js'

    });

    try {
        const sql = `
        select 
            articles.id, 
            articles.category_id, 
            articles.title, 
            articles.description, 
            articles.create_time, 
            articles.update_time, 
            articles.read_count,
            articles.top,
            categories.category_name as category_name,
            count(comments.id) as comment_count from articles
        left join categories on articles.category_id=categories.id
        left join comments on articles.id=comments.article_id
        where articles.top=1
        group by articles.id
        order by articles.create_time desc`;
        const [result] = await query(sql);
        /* 循环添加文章到 feed */
        for (let i = 0; i < result.length; i++) {
            feed.item({
                title: result[i].title,
                description: result[i].description,
                url: `http://192.168.31.20:5173/#/detail/${result[i].id}`,
                categories: [result[i].category_name],
                date: result[i].create_time,
            });
        }
        /* 设置正确的内容类型 */
        res.set('Content-Type', 'text/xml');

        /* 发送生成的 RSS 订阅 */
        res.send(feed.xml());
    } catch (err) {
        console.log(err);
        return res.json({
            code: 500,
            msg: '获取失败'
        });
    }


});

router.post('/save', async (req, res) => {
    const { title, description, url, categories, date } = req.body;
    try{
        const sql = `update settings set Title = ?, Ico = ?, Logo = ?, Avatar = ?, LogoText = ?, LogoText2 = ?, GongAn = ?, Ipc = ?, LeftBgLight = ?, LeftBgDark = ?, AllowRegister = ? where id = 1`;
        const [result] = await query(sql, [title, description, url, categories, date]);
    }catch(err){
        console.log(err);
        return res.json({
            code: 500,
            msg: '保存失败'
        });
    }
})


module.exports = router;