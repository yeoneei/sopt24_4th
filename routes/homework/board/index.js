var express = require('express');
var router = express.Router();
var pool = require('../../../config/dbConfig');
var moment = require('moment');
const crypto = require('crypto-promise');
const statusCode = require('../../../module/statusCode');
const resMessage = require('../../../module/responseMessage');
const util = require('../../../module/utils');

/* GET home page. */

router.post('/',async(req,res)=>{
    const getUserInfoQuery = 'SELECT * FROM 4th.user WHERE userIdx = ?';
    var getUserInfoResult;
    try{
        
        var connection = await pool.getConnection();
        getUserInfoResult = await connection.query(getUserInfoQuery,[req.body.writer]) || null;
        console.log(getUserInfoResult);
    }catch(err){
        connection.rollback(()=>{});
        console.log(err);
        next(err);
    }finally{
        pool.releaseConnection(connection);
    }

    if(getUserInfoResult != null){
        let hasedPw = await crypto.pbkdf2(String(req.body.boardPw),getUserInfoResult[0].salt,100,32,'SHA512');
        let basedPw = hasedPw.toString('base64');
        if(basedPw == getUserInfoResult[0].password){
            const insertBoardQuery ='INSERT INTO 4th.board (title, content, writer, boardPw, salt, writetime) VALUES (?, ?, ?, ?, ?, ?)';
            try{
                var connection = await pool.getConnection();
                let title = req.body.title;
                let content = req.body.content;
                let writer = getUserInfoResult[0].userIdx;
                let boardPw = getUserInfoResult[0].password;
                let salt = getUserInfoResult[0].salt;
                let writetime = moment().format('YYYY-MM-DD hh:mm:ss');
                let insertBoardResult = await connection.query(insertBoardQuery,[title,content,writer,boardPw,salt,writetime])||null;
                console.log(insertBoardResult);
            }catch (err){
                console.log(err)
                connection.rollback(()=>{});
                res.status(200).send(util.successFalse(statusCode.BAD_REQUEST,resMessage.BOARD_FAIL));
                next(err);
            }finally{
                pool.releaseConnection(connection);
                res.status(200).send(util.successTrue(statusCode.OK,resMessage.BOARD_SUCCESS));
            }


        }else{
            res.status(200).send(util.successFalse(statusCode.BAD_REQUEST,resMessage.MISS_MATCH_PW));
        }
        
        
    }
    
    
})
module.exports = router;
