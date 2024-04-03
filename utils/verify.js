
const jwt = require("jsonwebtoken");
const { TOKEN_SECRET } = process.env
// 对请求中的cookie中的token进行验证
const authToken = async (req, res, next) => {
    // 获取cookie中的token
    const token = req.session.token;
    // 如果没有token
    if (!token) {
        return res.json({
            code: 401,
            msg: "请先登录",
        });
    }
    // 如果有token
    try {
        // 验证token
        const decodedToken = jwt.verify(token, TOKEN_SECRET);
        // req.userId = decodedToken.userId;
        if (decodedToken.identity !== 'admin') {
            return res.json({
                code: 401,
                msg: "权限不足",
            });
        }

        // 如果token过期
        if (decodedToken.exp <= Date.now() / 1000) {
            return res.json({
                code: 400,
                msg: "登录已过期",
            });
        }
        // 如果token未过期
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.json({
                code: 401,
                msg: '登录已过期'
            });
        }
        console.log("服务端错误：", error);
        return res.json({
            code: 400,
            msg: "服务端错误",
        });
    }
};

module.exports = authToken;
