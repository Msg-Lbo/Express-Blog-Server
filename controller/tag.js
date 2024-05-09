const query = require('../db');

// 添加标签
exports.saveTags = async (req, res) => {
    const { tag } = req.body;
    if (!tag) {
        return res.json({
            code: 400,
            msg: '参数错误',
        })
    }
    try {
        const insertSql = 'INSERT INTO tags (label) VALUES (?)'
        const [result] = await query(insertSql, [tag.label]);
        if (result.affectedRows) {
            return res.json({
                code: 200,
                msg: '更新成功',
                succeed: true
            })
        } else {
            return res.json({
                code: 400,
                msg: '标签已存在',
                succeed: false
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

// 获取标签列表
exports.getTagList = async (req, res) => {
    try {
        const sql = `SELECT * FROM tags`;
        const [result] = await query(sql);
        return res.json({
            code: 200,
            msg: '获取成功',
            data: result,
            succeed: true
        })
    } catch (err) {
        console.log(err);
        return res.json({
            code: 500,
            msg: '服务端错误'
        })
    }
}

// 删除标签
exports.deleteTag = async (req, res) => {
    const { id } = req.body;
    if (!id) {
        return res.json({
            code: 400,
            msg: '参数错误'
        })
    }
    try {
        // 删除标签
        const deleteSql = 'DELETE FROM tags WHERE id = ?'
        const [result] = await query(deleteSql, [id]);
        if (result.affectedRows) {
            return res.json({
                code: 200,
                msg: '删除成功',
                succeed: true
            })
        } else {
            return res.json({
                code: 404,
                msg: '标签不存在',
                succeed: false
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