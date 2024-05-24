const query = require('../db');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs')
const GenId = require("../utils/genId")
const dotenv = require("dotenv")

const genId = new GenId({ WorkerId: 1 });
const installLock = path.join(__dirname, '../install.lock');
const envPath = path.join(__dirname, '../.env');
const envData = dotenv.parse(fs.readFileSync(envPath))
const { DB_ROOT } = process.env
// 检查是否已经安装过
const checkInstallLock = (req, res, next) => {
    if (fs.existsSync(installLock)) {
        return res.json({
            code: 403,
            msg: '已经安装过，请不要重复安装'
        })
    }
    next()
}


// 获取.env文件内容
const getEnvData = (req, res) => {
    return res.json({
        code: 200,
        msg: '获取.env文件内容成功',
        data: envData,
        succeed: true
    })
}


// 数据库链接是否成功
const checkConnection = async (req, res) => {
    console.log(envData);
    try {
        await query('SELECT 1');
        console.log('数据库链接成功');
        return res.json({
            code: 200,
            msg: '数据库链接成功',
            succeed: true
        })
    } catch (error) {
        return res.json({
            code: 500,
            msg: '数据库链接失败',
        })
    }
}

// 测试邮件验证码
const verifyEmailCode = async (req, res) => {
    const { email, code } = req.body;
    try {
        const sessionCaptcha = req.session.captcha;
        if (!sessionCaptcha) {
            return res.json({
                code: 400,
                msg: '请获取验证码'
            });
        }
        console.log(email, code);
        console.log(sessionCaptcha);
        if (!sessionCaptcha[email]) {
            return res.json({
                code: 400,
                msg: '邮箱错误'
            });
        }

        const { captcha, expires } = sessionCaptcha[email];
        if (code !== captcha) {
            return res.json({
                code: 400,
                msg: '验证码错误'
            });
        }

        if (Date.now() > expires) {
            return res.json({
                code: 400,
                msg: '验证码已过期，请重新获取'
            });
        }

        return res.json({
            code: 200,
            msg: '验证码验证成功',
            succeed: true
        });

    } catch (error) {
        console.log(error);
        return res.json({
            code: 500,
            msg: '服务器错误'
        });
    }
}



const createTables = async (req, res) => {
    const { account, password, email } = req.body;
    try {
        console.log('开始创建user表');
        await query(`CREATE TABLE  IF NOT EXISTS ${DB_ROOT}.user (
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

        console.log('开始创建超级用户');
        const hashPassword = await bcrypt.hash(password, 10);
        const createUserResult = await query(`INSERT INTO ${DB_ROOT}.user (account, nickname, email, password, identity) VALUES (?, ?, ?, ?, ?)`, [account, account, email, hashPassword, 'admin']);
        if (createUserResult.affectedRows === 1) {
            console.log('创建超级用户成功');
        } else {
            console.log('创建超级用户失败,请检查账号是否重复');
        }

        console.log('开始创建tags表');
        await query(`CREATE TABLE IF NOT EXISTS ${DB_ROOT}.tags (
          id int(11) NOT NULL AUTO_INCREMENT,
          label varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
          PRIMARY KEY (id) USING BTREE
        ) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;`);
        console.log('创建 tags 表成功');


        console.log('开始创建settings表');
        await query(`CREATE TABLE IF NOT EXISTS ${DB_ROOT}.settings  (
            id int(11) NOT NULL AUTO_INCREMENT,
            Title varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
            Ico varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
            Logo varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
            LogoText varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
            LogoText2 varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
            GongAn varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
            AllowRegister tinyint(1) NOT NULL DEFAULT 0,
            MoeIcp varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
            Icp varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL, 
            Domain varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
            About text CHARACTER SET utf8 COLLATE utf8_general_ci NULL,
            FriendTemplate text CHARACTER SET utf8 COLLATE utf8_general_ci NULL,
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
        const [result] = await query(`SELECT * FROM ${DB_ROOT}.settings WHERE id = 1`);
        const defaultSettings = [{
            id: 1,
            Title: 'Express-Blog-Server',
            Ico: 'https://www.express-blog-server.com/favicon.ico',
            Logo: 'https://www.express-blog-server.com/logo.png',
            LogoText: 'Express-Blog-Server',
            LogoText2: 'Express-Blog-Server',
            GongAn: '京ICP证00101000010号-1',
            AllowRegister: 1,
            MoeIcp: '沪ICP备12003582号-1',
            Icp: '京ICP证00101000010号',
            About: 'Express-Blog-Next是一个基于Node.js和MySQL开发的博客系统，旨在为广大程序员提供一个简单、快速、免费的博客发布平台。',
            FriendTemplate: '',
        }]
        if (result.length) {
            console.log('settings表已存在默认数据,更新');
            await query(`UPDATE ${DB_ROOT}.settings SET ? WHERE id = 1`, defaultSettings);
        } else {
            console.log('开始填充settings表');
            await query(`INSERT INTO ${DB_ROOT}.settings SET ?`, defaultSettings);
            console.log('填充 settings 表成功');
        }


        console.log('开始创建navigations表');
        await query(`CREATE TABLE IF NOT EXISTS ${DB_ROOT}.navigations  (
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

        const [navigations] = await query(`SELECT * FROM ${DB_ROOT}.navigations`);
        if (navigations.length) {
            console.log('navigations表已存在数据');
        } else {
            const sql = `INSERT INTO ${DB_ROOT}.navigations (label, alias, status, sort) 
            VALUES 
            ('首页', '', 1, 1), 
            ('友链', 'links', 1, 2), 
            ('关于', 'about', 1, 3)
            `;
            await query(sql);
            console.log('填充 navigations 表成功');
        }



        console.log('开始创建images表');
        await query(`CREATE TABLE IF NOT EXISTS ${DB_ROOT}.images  (
            id int(11) NOT NULL AUTO_INCREMENT,
            image_id varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
            url varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
            image_name varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
            PRIMARY KEY (id) USING BTREE
          ) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = DYNAMIC;`)
        console.log('创建 images 表成功');

        console.log('开始创建friends表');
        await query(`CREATE TABLE IF NOT EXISTS ${DB_ROOT}.friends  (
            id bigint(20) NOT NULL,
            name varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
            link varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
            description varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
            email varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
            logo varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
            status tinyint(1) NOT NULL DEFAULT 0,
            PRIMARY KEY (id) USING BTREE
          ) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = DYNAMIC;`)
        console.log('创建 friends 表成功');

        console.log('开始创建comments表');
        await query(`CREATE TABLE IF NOT EXISTS ${DB_ROOT}.comments  (
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
        await query(`CREATE TABLE IF NOT EXISTS ${DB_ROOT}.categories  (
            id bigint(20) NOT NULL,
            category_name varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
            category_alias varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
            PRIMARY KEY (id) USING BTREE
          ) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = DYNAMIC;`)
        console.log('创建 categories 表成功');

        // 填充 categories 表

        console.log("填充 categories 表");

        const [categories] = await query(`SELECT * FROM ${DB_ROOT}.categories`);
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
            await query(`INSERT INTO ${DB_ROOT}.categories SET ?`, defaultCategories);
        }


        console.log('开始创建articles表');
        await query(`CREATE TABLE IF NOT EXISTS ${DB_ROOT}.articles  (
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
          ) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = DYNAMIC;`)
        console.log('创建 articles 表成功');

        // 填充 articles 表
        console.log("填充 articles 表");
        const [articles] = await query(`SELECT * FROM ${DB_ROOT}.articles`);
        const [category] = await query(`SELECT * FROM ${DB_ROOT}.categories WHERE category_alias = 'default'`);
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
            await query(`INSERT INTO ${DB_ROOT}.articles SET ?`, defaultArticles);
        }


        console.log('开始创建article_tags表');
        await query(`CREATE TABLE IF NOT EXISTS ${DB_ROOT}.article_tags  (
            article_id int(11) NOT NULL,
            tag_id int(11) NOT NULL,
            PRIMARY KEY (article_id, tag_id) USING BTREE,
            INDEX tag_id(tag_id) USING BTREE,
            CONSTRAINT article_tags_ibfk_1 FOREIGN KEY (article_id) REFERENCES ${DB_ROOT}.articles (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
            CONSTRAINT article_tags_ibfk_2 FOREIGN KEY (tag_id) REFERENCES ${DB_ROOT}.tags (id) ON DELETE CASCADE ON UPDATE RESTRICT
          ) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;`)
        console.log('创建 article_tags 表成功');

        console.log("开始创建carousel表");
        await query(`CREATE TABLE IF NOT EXISTS ${DB_ROOT}.carousel  (
            id int(11) NOT NULL AUTO_INCREMENT,
            title varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
            cover varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
            link varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
            PRIMARY KEY (id) USING BTREE
          ) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;`)
        console.log('创建 carousel 表成功');


        // 创建install.lock文件，表示项目已安装
        fs.writeFileSync(installLock, 'lock');
        console.log('创建 install.lock 文件成功');
        res.json({
            code: 200,
            msg: '后端安装成功',
            succeed: true,
        })
    } catch (error) {
        console.log('后端安装失败,请检查日志', error);
        const data = {
            message: error.message,
            code: error.code,
            errno: error.errno,
            sqlState: error.sqlState,
            sqlMessage: error.sqlMessage,
        }
        res.json({
            code: 500,
            msg: '后端安装失败,请检查',
            data: data,
            succeed: false,
        })
        return
    }
}

module.exports = { checkInstallLock, verifyEmailCode, getEnvData, checkConnection, createTables }