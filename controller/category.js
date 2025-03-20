const query = require('../db');
const GenId = require("../utils/genId")
const genId = new GenId({ WorkerId: 1 });
// 创建分类
exports.createCategory = async (req, res) => {
    const { name, alias } = req.body;
    if (!name || !alias) {
        return res.json({
            code: 400,
            msg: '参数不完整'
        });
    }
    try {
        // 生成分类id
        const id = genId.NextId();
        const sql = `insert into categories (id,category_name,category_alias) values (?,?,?)`;
        const [result] = await query(sql, [id, name, alias]);
        if (result.affectedRows) {
            return res.json({
                code: 200,
                msg: '创建成功',
                succeed: true
            });
        }
        return res.json({
            code: 400,
            msg: '创建失败'
        });
    } catch (err) {
        console.log(err);
        return res.json({
            code: 500,
            msg: '创建失败'
        });
    }
}
// 获取所有分类
exports.getAllCategory = async (req, res) => {
    try {
        // 获取所有分类以及分类下的文章数
        const sql = `select categories.id, category_name, category_alias, count(articles.id) 
        as article_count from categories
        left join articles on categories.id=articles.category_id
        group by categories.id`;
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
// 按id删除分类
exports.deleteCategoryById = async (req, res) => {
    const { id } = req.body;
    if (!id) {
        return res.json({
            code: 400,
            msg: '参数不完整'
        });
    }
    try {
        // 删除分类前，将该分类下的所有文章的分类id设置为0
        const sql1 = `update articles set category_id=0 where category_id=${id}`;
        await query(sql1);
        const sql = `delete from categories where id=${id}`;
        const [result] = await query(sql);
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
// 按id修改分类
exports.updateCategoryById = async (req, res) => {
    const { id, name, alias } = req.body;
    if (!id || !name || !alias) {
        return res.json({
            code: 400,
            msg: '参数不完整'
        });
    }
    try {
        const sql = `update categories set category_name=?, category_alias=? where id=?`;
        const [result] = await query(sql, [name, alias, id]);
        if (result.affectedRows) {
            return res.json({
                code: 200,
                msg: '修改成功',
                succeed: true
            });
        }

        return res.json({
            code: 400,
            msg: '修改失败'
        });
    } catch (err) {
        console.log(err);
        return res.json({
            code: 500,
            msg: '修改失败'
        });
    }
}
// 按别名分页获取分类下的所有文章, 按时间降序
exports.getArticleByCategoryAlias = async (req, res) => {
    const { alias, page, pageSize } = req.query;
    // console.log(alias, page, pageSize);
    if (!alias || !page || !pageSize) {
        return res.json({
            code: 400,
            msg: '参数不完整'
        });
    }
    try {
        // 分页获取分类下的所有文章,将分类别名转为对应的分类名,评论数量
        const sql = `SELECT
        articles.id,
        articles.title,
        articles.description,
        categories.category_name AS category_name,
        articles.create_time,
        articles.update_time,
        articles.read_count, 
        count( comments.id ) AS comment_count 
    FROM
        articles
        LEFT JOIN categories ON articles.category_id = categories.id
        LEFT JOIN comments ON articles.id = comments.article_id 
    WHERE 
        category_alias = ?
    GROUP BY 
        articles.id
    ORDER BY 
        articles.id DESC 
    LIMIT ?, ?`;
        const [result] = await query(sql, [alias, ((page - 1) * pageSize), Number(pageSize)]);
        // 获取分类下的所有文章的总数
        const sql1 = `SELECT COUNT(*) AS total FROM articles WHERE category_id = ?`;
        const [result1] = await query(sql1, [result.category_id]);
        return res.json({
            code: 200,
            msg: '获取成功',
            succeed: true,
            data: {
                list: result,
                total: result1[0].total
            }
        });
    } catch (err) {
        console.log(err);
        return res.json({
            code: 500,
            msg: '获取失败'
        });
    }
}
