const express = require('express');
const RSS = require('rss');
const query = require('../db');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const rssSql = `select * from settings where id = 1`;
        const [rss] = await query(rssSql);
        let feed = new RSS({
            title: rss[0].RssTitle,
            description: rss[0].RssDesc,
            feed_url: rss[0].FeedUrl,
            site_url: rss[0].SiteUrl,
            // image_url: 'http://example.com/icon.png',
            // managingEditor: '编辑',
            webMaster: rss[0].webMaster,
            copyright: rss[0].CopyRight,
            language: rss[0].Language,
            // pubDate: '发布日期',
            // ttl: '60',
            // generator: 'Feed for Node.js'

        });
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
                url: `${rss[0].SiteUrl}/#/detail/${result[i].id}`,
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

router.post('/save-rss', async (req, res) => {
    const { RssTitle, RssDesc, FeedUrl, SiteUrl, Language, CopyRight, WebMaster } = req.body;
    try {
        const sql = `update settings set RssTitle = ?, RssDesc = ?, FeedUrl = ?, SiteUrl = ?, Language = ?, CopyRight = ?, WebMaster = ? where id = 1`;
        const [result] = await query(sql, [RssTitle, RssDesc, FeedUrl, SiteUrl, Language, CopyRight, WebMaster]);
        if (result.affectedRows) {
            return res.json({
                code: 200,
                msg: '保存成功',
                succeed: true
            });
        }
    } catch (err) {
        console.log(err);
        return res.json({
            code: 500,
            msg: '保存失败'
        });
    }
})

router.get('/get-rss', async (req, res) => {
    try {
        const sql = `select * from settings where id = 1`;
        const [result] = await query(sql);
        const data = {
            RssTitle: result[0].RssTitle,
            RssDesc: result[0].RssDesc,
            FeedUrl: result[0].FeedUrl,
            SiteUrl: result[0].SiteUrl,
            Language: result[0].Language,
            CopyRight: result[0].CopyRight,
            WebMaster: result[0].WebMaster,
        }
        return res.json({
            code: 200,
            msg: '获取成功',
            data: data,
            succeed: true
        });
    } catch (err) {
        console.log(err);
        return res.json({
            code: 500,
            msg: '获取失败'
        });
    }
})


module.exports = router;