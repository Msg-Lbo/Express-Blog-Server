const query = require('../db');
// 保存设置
exports.saveSettings = async (req, res) => {
    try {
        const {
            Title,
            Ico,
            Logo,
            Avatar,
            LogoText,
            LogoText2,
            GongAn,
            Icp,
            MoeIcp,
            LeftBgLight,
            LeftBgDark,
            AllowRegister,
        } = req.body;
        const allowRegister = AllowRegister === "true" ? 1 : 0;
        const sql = 'update settings set Title = ?, Ico = ?, Logo = ?, Avatar = ?, LogoText = ?, LogoText2 = ?, GongAn = ?, Icp = ?, MoeIcp = ?, LeftBgLight = ?, LeftBgDark = ?, AllowRegister = ? where id = 1';
        const [result] = await query(sql, [Title, Ico, Logo, Avatar, LogoText, LogoText2, GongAn, Icp, MoeIcp, LeftBgLight, LeftBgDark, allowRegister]);
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
            msg: '服务端错误'
        })
    }
}

// 获取设置
exports.getSettings = async (req, res) => {
    try {
        const sql = 'select * from settings where id = 1';
        const [result] = await query(sql);
        const data = {
            Title: result[0].Title,
            Ico: result[0].Ico,
            Logo: result[0].Logo,
            Avatar: result[0].Avatar,
            LogoText: result[0].LogoText,
            LogoText2: result[0].LogoText2,
            GongAn: result[0].GongAn,
            Icp: result[0].Icp,
            MoeIcp: result[0].MoeIcp,
            LeftBgLight: result[0].LeftBgLight,
            LeftBgDark: result[0].LeftBgDark,
            AllowRegister: result[0].AllowRegister === 1 ? true : false,
            About: result[0].About,
            FriendTemplate: result[0].FriendTemplate,
        }
        return res.json({
            code: 200,
            msg: '获取成功',
            succeed: true,
            data: data
        });
    } catch (err) {
        console.log(err);
        return res.json({
            code: 500,
            msg: '服务端错误'
        })
    }
}


// 保存友链模板
exports.saveFriendTemplate = async (req, res) => {
    try {
        const { FriendTemplate } = req.body;
        const sql = 'update settings set FriendTemplate = ? where id = 1';
        const [result] = await query(sql, [FriendTemplate]);
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
            msg: '服务端错误'
        })
    }
}

// 保存关于
exports.saveAbout = async (req, res) => {
    try {
        const { About } = req.body;
        const sql = 'update settings set About = ? where id = 1';
        const [result] = await query(sql, [About]);
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
            msg: '服务端错误'
        })
    }
}


// 汇总数据，文章总数，阅读数，comments表总条数
exports.getSummary = async (req, res) => {
    try {
        const sql = `SELECT
        (SELECT COUNT(*) FROM articles) AS article_count,
        (SELECT SUM(read_count) FROM articles) AS total_reads,
        (SELECT COUNT(*) FROM comments) AS total_comments;`;
        const [result] = await query(sql);
        return res.json({
            code: 200,
            msg: '获取成功',
            succeed: true,
            data: result[0]
        });
    } catch (err) {
        console.log(err);
        return res.json({
            code: 500,
            msg: '获取失败'
        });
    }
}