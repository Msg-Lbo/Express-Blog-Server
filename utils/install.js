const query = require('../db');
const bcrypt = require('bcryptjs')
const GenId = require("../utils/genId")
const genId = new GenId({ WorkerId: 1 });
// 数据库链接是否成功
const checkConnection = async () => {
    try {
        await query('SELECT 1');
        console.log('数据库链接成功');
        return true;
    } catch (error) {
        console.log('数据库链接失败');
        return false;
    }
}

const createTables = async (req, res) => {
    if (!await checkConnection()) {
        return;
    }
    try {
        console.log('开始创建user表');
        await query(`CREATE TABLE  IF NOT EXISTS blog.user (
            id int(11) NOT NULL AUTO_INCREMENT,
            account varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
            email varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
            password varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
            avatar varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
            nickname varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
            identity varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '游客',
            PRIMARY KEY (id) USING BTREE
          ) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = DYNAMIC;`);
        console.log('创建 user 表成功');

        console.log('开始创建tags表');
        await query(`CREATE TABLE IF NOT EXISTS blog.tags (
          id int(11) NOT NULL AUTO_INCREMENT,
          label varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
          PRIMARY KEY (id) USING BTREE
        ) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;`);
        console.log('创建 tags 表成功');


        console.log('开始创建settings表');
        await query(`CREATE TABLE IF NOT EXISTS blog.settings  (
            id int(11) NOT NULL AUTO_INCREMENT,
            Title varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
            Ico varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
            Avatar varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
            Logo varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
            LogoText varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
            LogoText2 varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
            GongAn varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
            LeftBgLight varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
            LeftBgDark varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
            AllowRegister tinyint(1) NOT NULL DEFAULT 0,
            MoeIcp varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
            Icp varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL, 
            About text CHARACTER SET utf8 COLLATE utf8_general_ci NULL,
            RssTitle varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
            RssDesc varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
            FeedUrl varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
            SiteUrl varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
            Language varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
            CopyRight varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
            WebMaster varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
            PRIMARY KEY (id) USING BTREE
          ) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = DYNAMIC;`)
        console.log('创建 settings 表成功');

        console.log("填充settings表");
        // 为id=1的settings表填充默认数据
        const [result] = await query("SELECT * FROM blog.settings WHERE id = 1");
        if (result.length) {
            console.log('settings表已存在默认数据');
            await query("update blog.settings set id = 1, Title = 'Express-Blog-Server', Ico = 'https://www.express-blog-server.com/favicon.ico', Avatar = 'https://www.express-blog-server.com/avatar.png', Logo = 'https://www.express-blog-server.com/logo.png', LogoText = 'Express-Blog-Server', LogoText2 = 'Express-Blog-Server', GongAn = 'https://www.express-blog-server.com/gongan.png', LeftBgLight = 'https://www.express-blog-server.com/bg-light.jpg', LeftBgDark = 'https://www.express-blog-server.com/bg-dark.jpg', AllowRegister = 1, MoeIcp = '沪ICP备12003582号-1', Icp = '京ICP证00101000010号', About = 'Express-Blog-Server是一个基于Node.js和MySQL开发的博客系统，旨在为广大程序员提供一个简单、快速、免费的博客发布平台。'")
        } else {
            console.log('开始填充settings表');
            const defaultSettings = [
                {
                    id: 1,
                    Title: 'Express-Blog-Server',
                    Ico: 'https://www.express-blog-server.com/favicon.ico',
                    Avatar: 'https://www.express-blog-server.com/avatar.png',
                    Logo: 'https://www.express-blog-server.com/logo.png',
                    LogoText: 'Express-Blog-Server',
                    LogoText2: 'Express-Blog-Server',
                    GongAn: 'https://www.express-blog-server.com/gongan.png',
                    LeftBgLight: 'https://www.express-blog-server.com/bg-light.jpg',
                    LeftBgDark: 'https://www.express-blog-server.com/bg-dark.jpg',
                    AllowRegister: 1,
                    MoeIcp: '沪ICP备12003582号-1',
                    Icp: '京ICP证00101000010号',
                    About: 'Express-Blog-Next是一个基于Node.js和MySQL开发的博客系统，旨在为广大程序员提供一个简单、快速、免费的博客发布平台。'
                }]
            await query("INSERT INTO blog.settings SET ?", defaultSettings);
            console.log('填充 settings 表成功');
        }


        console.log('开始创建navigations表');
        await query(`CREATE TABLE IF NOT EXISTS blog.navigations  (
                id int(11) NOT NULL AUTO_INCREMENT,
                label varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
                alias varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
                status int(1) NOT NULL DEFAULT 0,
                sort int(3) UNSIGNED NULL DEFAULT 0,
                PRIMARY KEY (id) USING BTREE
              ) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;`)
        console.log('创建 navigations 表成功');

        console.log('填充navigations表');
        // 如果navigations表已存在数据，则不再插入默认数据

        const [navigations] = await query("SELECT * FROM blog.navigations");
        if (navigations.length) {
            console.log('navigations表已存在数据');
        } else {
            const sql = `INSERT INTO blog.navigations (label, alias, status, sort) 
            VALUES 
            ('首页', 'home', 1, 1), 
            ('友链', 'links', 1, 2), 
            ('关于', 'about', 1, 3)
            `;
            await query(sql);
            console.log('填充 navigations 表成功');
        }



        console.log('开始创建images表');
        await query(`CREATE TABLE IF NOT EXISTS blog.images  (
            id int(11) NOT NULL AUTO_INCREMENT,
            image_id varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
            url varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
            image_name varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
            PRIMARY KEY (id) USING BTREE
          ) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = DYNAMIC;`)
        console.log('创建 images 表成功');

        console.log('开始创建friends表');
        await query(`CREATE TABLE IF NOT EXISTS blog.friends  (
            id bigint(20) NOT NULL,
            name varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
            link varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
            description varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
            email varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
            logo varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
            status tinyint(1) NOT NULL DEFAULT 0,
            PRIMARY KEY (id) USING BTREE
          ) ENGINE = MyISAM CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = DYNAMIC;`)
        console.log('创建 friends 表成功');

        console.log('开始创建comments表');
        await query(`CREATE TABLE IF NOT EXISTS blog.comments  (
            id int(11) NOT NULL AUTO_INCREMENT,
            article_id varchar(11) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
            parent_id varchar(11) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
            nickname varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
            email varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
            content varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
            create_time bigint(20) NULL DEFAULT NULL,
            identity varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
            PRIMARY KEY (id) USING BTREE
          ) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = DYNAMIC;`)
        console.log('创建 comments 表成功');

        console.log('开始创建categories表');
        await query(`CREATE TABLE IF NOT EXISTS blog.categories  (
            id bigint(20) NOT NULL,
            category_name varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
            category_alias varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
            PRIMARY KEY (id) USING BTREE
          ) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = DYNAMIC;`)
        console.log('创建 categories 表成功');

        // 填充 categories 表

        console.log("填充 categories 表");

        const [categories] = await query("SELECT * FROM blog.categories");
        if (categories.length) {
            console.log('categories 表已存在数据');
        } else {
            const id = genId.NextId()
            const defaultCategories = [
                {
                    id: id,
                    category_name: '默认分类',
                    category_alias: 'default',
                }]
            await query("INSERT INTO blog.categories SET ?", defaultCategories);
        }


        console.log('开始创建articles表');
        await query(`CREATE TABLE IF NOT EXISTS blog.articles  (
            id int(11) NOT NULL AUTO_INCREMENT,
            title varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
            description varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
            content text CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
            create_time bigint(20) NOT NULL,
            update_time bigint(20) NULL DEFAULT NULL,
            top tinyint(1) NOT NULL DEFAULT 0,
            category_id bigint(20) NULL DEFAULT NULL,
            read_count int(11) NULL DEFAULT 0,
            PRIMARY KEY (id) USING BTREE
          ) ENGINE = InnoDB AUTO_INCREMENT = 172 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = DYNAMIC;`)
        console.log('创建 articles 表成功');

        // 填充 articles 表
        console.log("填充 articles 表");
        const [articles] = await query("SELECT * FROM blog.articles");
        const [category] = await query("SELECT * FROM blog.categories WHERE category_alias = 'default'");
        if (articles.length) {
            console.log('articles 表已存在数据');
        } else {
            const defaultArticles = [
                {
                    title: '第一篇文章',
                    description: '第一篇文章',
                    content: '第一篇文章',
                    create_time: new Date().getTime(),
                    update_time: new Date().getTime(),
                    top: 1,
                    category_id: category[0].id,
                    read_count: 0,
                }]
            await query("INSERT INTO blog.articles SET ?", defaultArticles);
        }


        console.log('开始创建article_tags表');
        await query(`CREATE TABLE IF NOT EXISTS blog.article_tags  (
            article_id int(11) NOT NULL,
            tag_id int(11) NOT NULL,
            PRIMARY KEY (article_id, tag_id) USING BTREE,
            INDEX tag_id(tag_id) USING BTREE,
            CONSTRAINT article_tags_ibfk_1 FOREIGN KEY (article_id) REFERENCES blog.articles (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
            CONSTRAINT article_tags_ibfk_2 FOREIGN KEY (tag_id) REFERENCES blog.tags (id) ON DELETE CASCADE ON UPDATE RESTRICT
          ) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;`)
        console.log('创建 article_tags 表成功');
        res.json({
            code: 200,
            msg: '创建表成功',
            succeed: true,
        })
    } catch (error) {
        console.log('创建表失败', error);
    }
}

const createSuperuser = async (req, res) => {
    const { account, password, email } = req.body;
    try {
        const hashPassword = await bcrypt.hash(password, 10);
        const result = await query(`INSERT INTO blog.user (account, email, password, identity) VALUES (?, ?, ?, ?)`, [account, email, hashPassword, 'admin']);
        if (result.affectedRows) {
            console.log('创建超级管理员成功');
        }
        res.json({
            code: 200,
            msg: '创建超级管理员成功',
            succeed: true,
        })
    } catch (error) {
        console.log('创建超级管理员失败', error);
        res.json({
            code: 500,
            msg: '创建超级管理员失败',
            succeed: false,
        })
    }

}

module.exports = { createTables, createSuperuser }