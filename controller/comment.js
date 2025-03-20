const jwt = require("jsonwebtoken");
const query = require('../db');
const { TOKEN_SECRET } = process.env

// 发送评论
exports.sendComment = async (req, res) => {
    const { article_id, content, create_time, parent_id, nickname, email, identity, code } = req.body;
    if (!article_id || !content || !create_time || !parent_id || !nickname || !email || !code) {
        console.log(req.body);

        return res.json({
            code: 400,
            msg: '参数错误'
        });
    }
    try {
        // 如果有身份，则判断是否是管理员
        if (identity) {
            const token = req.session.token;
            // console.log("评论",req.session);
            if (!token) {
                return res.json({
                    code: 401,
                    msg: '请先登录'
                });
            }
            const decodedToken = jwt.verify(token, TOKEN_SECRET);
            if (decodedToken.identity !== 'admin') {
                return res.json({
                    code: 401,
                    msg: '权限不足,不允许配置身份'
                });
            }
        }

        // 验证码小写
        let lowerCaseCode = code.toLowerCase();
        // 判断验证码是否正确
        if (req.session.captcha !== lowerCaseCode) {
            return res.json({
                code: 400,
                msg: '验证码错误'
            });
        }
        const sql = 'insert into comments(article_id, content, create_time, parent_id, identity, nickname, email) values(?, ?, ?, ?, ?, ?, ?)';
        const [result] = await query(sql, [article_id, content, create_time, parent_id, identity, nickname, email]);
        if (result.affectedRows === 1) {
            // 如果是普通用户评论，发送邮件通知管理员
            if (!identity || identity !== 'admin') {
                // 查询管理员邮箱
                const [admin] = await query('select email from user where identity = ?', ['admin']);
                if (admin.length > 0) {
                    const sendEmail = require('../utils/sendEmail');
                    sendEmail(admin[0].email, '新评论通知', content);
                }
            }
            return res.json({
                code: 200,
                msg: '评论成功',
                succeed: true
            });
        }
    } catch (err) {
        console.log(err);
        return res.json({
            code: 500,
            msg: '服务端错误'
        });
    }
}
// 获取评论列表
exports.getCommentList = async (req, res) => {
    const { article_id, page = 1, pageSize = 20 } = req.query;
    try {
        const sql = 'select * from comments where article_id = ?';
        const [result] = await query(sql, [article_id]);
        const map = {};
        result.forEach(item => {
            // 把每一条数据的id作为map的key，把每一条数据作为value
            map[item.id] = item;
        });
        const tree = [];
        const total = result.length;
        // 遍历result，找到每一条数据的parent_id，如果有parent_id，就把它放到对应的parent_id的children属性中
        result.forEach(item => {
            // 找到每一条数据的parent_id所对应在map中的value
            const parent = map[item.parent_id];
            if (parent) {
                // 如果有parent_id，就把它放到对应的parent_id的children属性中
                (parent.children || (parent.children = [])).push(item);
            } else {
                // 如果没有parent_id，就把它放到tree数组中
                tree.push(item);
            }
        });
        // console.log(tree);
        return res.json({
            code: 200,
            msg: '获取评论列表成功',
            succeed: true,
            data: {
                total,
                tree
            }
        });
    } catch (err) {
        console.log(err);
        return res.json({
            code: 500,
            msg: '服务端错误'
        });
    }
}

// 分页获取所有评论
exports.getAllComment = async (req, res) => {
    const { page, pageSize } = req.query;
    try {
        // 获取article_id对应的文章名
        const sql = `select comments.id, comments.article_id, comments.content, comments.create_time, 
        comments.parent_id, comments.nickname, comments.email, articles.title 
        as article_title from comments 
        left join articles on comments.article_id = articles.id 
        order by comments.id desc limit ?, ?`
        const [result] = await query(sql, [(page - 1) * parseInt(pageSize), parseInt(pageSize)]);
        const sql2 = 'select count(*) as total from comments';
        const [result2] = await query(sql2);
        return res.json({
            code: 200,
            msg: '获取评论列表成功',
            succeed: true,
            data: {
                list: result,
                total: result2[0].total
            },

        });
    } catch (err) {
        console.log(err);
        return res.json({
            code: 500,
            msg: '服务端错误'
        });
    }
}

// 删除评论
exports.deleteCommentById = async (req, res) => {
    const { id } = req.body;
    try {
        // 删除评论,并且删除comments表中parent_id为该评论id的数据
        const sql = `delete from comments where id=? or parent_id=?`;
        const [result] = await query(sql, [id, id]);
        if (result.affectedRows !== 0) {
            return res.json({
                code: 200,
                msg: '删除成功',
                succeed: true
            });
        }
        return res.json({
            code: 400,
            msg: '删除失败'
        });
    } catch (err) {
        console.log(err);
        return res.json({
            code: 500,
            msg: '服务端错误'
        });
    }
}
