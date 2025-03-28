const nodeMail = require("../smtp");
const { EMAIL_NAME, EMAIL_USER } = process.env
const sendMail = (to, subject, params) => {
    let html = ""
    if (subject === "验证码") {
        html = `
            <p>您好！</p>
            <p>您的验证码是：<strong style="color:orangered;">${params}</strong></p>
            <p>如果不是您本人操作，请无视此邮件</p>
            `
    } else if (subject === "回复评论") {
        html = `
            <p>您好！</p>
            <p>您的评论收到回复,请前往网站查看详细</p>
            `
    } else if (subject === "友链通过") {
        html = `
            <p>您好！</p>
            <p>您的友链申请已通过,请前往网站查看详细</p>
            `
    } else if (subject === "友链被驳回") {
        html = `
            <p>您好！</p>
            <p>您的友链申请被驳回，请修改您的申请或者站点</p>
            <p>原因是: ${params}</p>
            `
    } else if (subject === "友链更新") {
        html = `
            <p>您好！</p>
            <p>您的友链已更新,请前往网站查看详细</p>
            `
    } else if (subject === "新评论通知") {
        html = `
            <p>您好！</p>
            <p>内容: ${params}</p>
            <p>有新的评论发布,请前往网站查看详细</p>
            `
    } else if (subject === "评论回复通知") {
        html = `
            <p>您好！</p>
            <p>内容: ${params}</p>
            <p>您的评论有新的回复,请前往网站查看详细</p>
            `
    }
    // 发送的配置项
    const mail = {
        from: `"${EMAIL_NAME}" <${EMAIL_USER}>`,
        subject: subject,
        to: to,
        html: html
    }
    try {
        nodeMail.sendMail(mail, (err, info) => {
            if (err) {
                // console.log("发送失败", err)
                return err
            }
            console.log("发送成功")
            return info
        })
    } catch (e) {
        console.log(e)
    }

}

module.exports = sendMail
