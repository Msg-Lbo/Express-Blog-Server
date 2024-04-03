const query = require('../db');
const GenId = require('../utils/genid');
const genid = new GenId({ WorkerId: 1 });
const sendMail = require('../utils/sendEmail');
const jwt = require("jsonwebtoken");
const { TOKEN_SECRET } = process.env

function validateParams(...params) {
    return params.every(param => param);
}

// 申请友链
exports.applyFriend = async (req, res) => {
    const { name, link, email, description, logo, code } = req.body;
    try {
        const token = req.session.token;
        // console.log(token);
        const decodedToken = jwt.verify(token, TOKEN_SECRET);

        if (decodedToken.identity === 'admin') {
            if (!validateParams(name, link, email, description, logo)) {
                return res.json({
                    code: 400,
                    msg: '参数不完整'
                });
            }
            const id = genid.NextId();
            const sql = 'insert into friends (id, name, link, email, description, logo) values (?, ?, ?, ?, ?, ?)';
            const [result] = await query(sql, [id, name, link, email, description, logo]);
            if (result.affectedRows) {
                return res.json({
                    code: 200,
                    msg: '申请成功',
                    succeed: true
                });
            }
            return res.json({
                code: 400,
                msg: '申请失败'
            });
        }

        if (!validateParams(name, link, email, description, logo, code)) {
            return res.json({
                code: 400,
                msg: '参数不完整'
            });
        }
        const sessionCaptcha = req.session.captcha;
        if (!sessionCaptcha) {
            return res.json({
                code: 400,
                msg: '请获取验证码'
            });
        }

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

        const id = genid.NextId();
        const sql = 'insert into friends (id, name, link, email, description, logo) values (?, ?, ?, ?, ?, ?)';
        const [result] = await query(sql, [id, name, link, email, description, logo]);
        if (result.affectedRows) {
            return res.json({
                code: 200,
                msg: '申请成功',
                succeed: true
            });
        }
        return res.json({
            code: 400,
            msg: '申请失败'
        });
    } catch (err) {
        console.log(err);
        return res.json({
            code: 500,
            msg: '服务端错误'
        });
    }
}



// 允许友链
exports.allowFriend = async (req, res) => {
    const { id } = req.body;
    if (!id) {
        return res.json({
            code: 400,
            msg: '参数不完整'
        });
    }
    try {
        // 获取id对应的友链信息
        const sql1 = 'select email from friends where id=?';
        const [result1] = await query(sql1, [id]);
        // console.log(result1[0].email);
        const sql = 'update friends set status=1 where id=?';
        const [result] = await query(sql, [id]);
        if (result.affectedRows) {
            sendMail(result1[0].email, "友链通过")
            return res.json({
                code: 200,
                msg: '已通过',
                succeed: true
            });
        }
        return res.json({
            code: 400,
            msg: '更新失败'
        });
    } catch (err) {
        console.log(err);
        return res.json({
            code: 500,
            msg: '服务端错误'
        })
    }
}
// 驳回友链
exports.refuseFriend = async (req, res) => {
    const { id, reason } = req.body;
    if (!id) {
        return res.json({
            code: 400,
            msg: '参数不完整'
        });
    }
    try {
        // 获取id对应的友链信息
        const sql1 = 'select email from friends where id=?';
        const [result1] = await query(sql1, [id]);
        // console.log(result1[0].email);
        if (result1.length === 0) {
            return res.json({
                code: 400,
                msg: '邮箱不存在'
            });
        }
        // 修改友链装状态填为0
        const sql = 'update friends set status=0 where id=?';
        const [result] = await query(sql, [id]);
        if (result.affectedRows) {
            sendMail(result1[0].email, "友链被驳回", reason)
            return res.json({
                code: 200,
                msg: '已拒绝',
                succeed: true
            });
        }
        return res.json({
            code: 400,
            msg: '更新失败'
        });
    } catch (err) {
        console.log(err);
        return res.json({
            code: 500,
            msg: '服务端错误'
        })
    }
}
// 删除友链
exports.deleteFriend = async (req, res) => {
    const { id } = req.body;
    if (!id) {
        return res.json({
            code: 400,
            msg: '参数不完整'
        });
    }
    try {
        const sql = 'delete from friends where id=?';
        const [result] = await query(sql, [id]);
        if (result.affectedRows) {
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
            msg: '删除失败'
        });
    }
}
// 获取已通过的友链
exports.getAllowFriends = async (req, res) => {
    try {
        const sql = 'select * from friends where status=1';
        const [result] = await query(sql);
        return res.json({
            code: 200,
            msg: '获取成功',
            succeed: true,
            data: result
        });
    } catch (err) {
        console.log(err);
        return res.json({
            code: 500,
            msg: '获取失败'
        });
    }
}
// 获取指定状态的友链
exports.getFriendByStatus = async (req, res) => {
    const { status } = req.query;
    if (!status) {
        return res.json({
            code: 400,
            msg: '参数不完整'
        });
    }
    try {
        const sql = 'select * from friends where status=?';
        const [result] = await query(sql, [status]);
        return res.json({
            code: 200,
            msg: '获取成功',
            succeed: true,
            data: result
        });
    } catch (err) {
        console.log(err);
        return res.json({
            code: 500,
            msg: '获取失败'
        });
    }
}
// 更新友链
exports.updateFriend = async (req, res) => {
    const { id, name, link, email, description, logo } = req.body;
    if (!id || !name || !link || !email || !description || !logo) {
        return res.json({
            code: 400,
            msg: '参数不完整'
        });
    }
    try {
        const sql = 'update friends set name=?, link=?, email=?, description=?, logo=? where id=?';
        const [result] = await query(sql, [name, link, email, description, logo, id]);
        if (result.affectedRows) {
            sendMail(email, "友链更新")
            return res.json({
                code: 200,
                msg: '更新成功',
                succeed: true
            });
        }
        return res.json({
            code: 400,
            msg: '更新失败'
        });
    } catch (err) {
        console.log(err);
        return res.json({
            code: 500,
            msg: '更新失败'
        });
    }
}
