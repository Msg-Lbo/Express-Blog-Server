const query = require('../db');

// 获取导航栏
exports.getAllNav = async (req, res) => {
    try {
        const sql = `SELECT * FROM navigations ORDER BY sort ASC`;
        const [result] = await query(sql);
        return res.json({
            code: 200,
            msg: '获取成功',
            succeed: true,
            data: result
        })
    } catch (err) {
        console.log(err);
        return res.json({
            code: 500,
            msg: '服务端错误'
        })
    }
}

// 获取status为1的导航栏
exports.getNavByStatus = async (req, res) => {
    try {
        const sql = `SELECT * FROM navigations WHERE status = 1 ORDER BY sort ASC`;
        const [result] = await query(sql);
        return res.json({
            code: 200,
            msg: '获取成功',
            succeed: true,
            data: result
        })
    } catch (err) {
        console.log(err);
        return res.json({
            code: 500,
            msg: '服务端错误'
        })
    }
}

// 保存新导航栏
exports.saveNav = async (req, res) => {
    const { label, alias, sort } = req.body;
    if (!label || !alias) {
        return res.json({
            code: 400,
            msg: '参数错误',
            succeed: false
        })
    }
    try {
        const sql = `INSERT INTO navigations (label, alias, status, sort) VALUES (?, ?, ?, ?)`;
        const [result] = await query(sql, [label, alias, 0, sort || 0]);
        if (result.affectedRows) {
            return res.json({
                code: 200,
                msg: '保存成功',
                succeed: true
            })
        } else {
            return res.json({
                code: 400,
                msg: '保存失败',
            })
        }
    } catch (err) {
        console.log(err);
        return res.json({
            code: 500,
            msg: '服务端错误'
        })
    }
}

// 更新导航栏
exports.updateNav = async (req, res) => {
    const { id, label, alias, status, sort } = req.body;
    if (!id || !label || !alias || !status || !sort) {
        return res.json({
            code: 400,
            msg: '参数错误',
        })
    }
    try {
        const sql = `UPDATE navigations SET label =?, alias =?, status = ?, sort = ? WHERE id = ?`;
        const [result] = await query(sql, [label, alias, status, sort, id]);
        if (result.affectedRows) {
            return res.json({
                code: 200,
                msg: '更新成功',
                succeed: true
            })
        } else {
            return res.json({
                code: 400,
                msg: '更新失败',
            })
        }
    } catch (err) {
        console.log(err);
        return res.json({
            code: 500,
            msg: '服务端错误'
        })
    }
}

// 删除导航栏
exports.deleteNav = async (req, res) => {
    const { id } = req.body;
    if (!id) {
        return res.json({
            code: 400,
            msg: '参数错误',
        })
    }
    try {
        const sql = `DELETE FROM navigations WHERE id = ?`;
        const [result] = await query(sql, [id]);
        if (result.affectedRows) {
            return res.json({
                code: 200,
                msg: '删除成功',
                succeed: true
            })
        } else {
            return res.json({
                code: 400,
                msg: '删除失败',
            })
        }
    } catch (err) {
        console.log(err);
        return res.json({
            code: 500,
            msg: '服务端错误'
        })
    }
}

