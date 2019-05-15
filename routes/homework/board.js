var express = require('express');
var router = express.Router();
var pool = require('../../config/dbConfig');
var moment = require('moment');
const crypto = require('crypto-promise');
const statusCode = require('../../module/statusCode');
const resMessage = require('../../module/responseMessage');
const util = require('../../module/utils');

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

router.get('/:id',async(req,res)=>{
    let id = req.params.id;
    const postIdxQuery = 'SELECT * FROM 4th.board WHERE boardIdx = ?';
    
    let postIdxResult;
    try{
        var connection = await pool.getConnection();
        postIdxResult = await connection.query(postIdxQuery,[id]) || null;

    }catch(err){
        console.log(err);
        connection.rollback(()=>{});
        next(err);
        res.status(200).send(util.successFalse(statusCode.DB_ERROR,resMessage.READ_FAIL));
    }finally{
        pool.releaseConnection(connection);
    }

    if(postIdxResult != null){
        console.log(postIdxResult);
        let data = {
            title : postIdxResult[0].title,
            content : postIdxResult[0].content
        }
        res.status(200).send(util.successTrue(statusCode.OK,resMessage.READ_SUCCESS,data));
    }else{
        res.status(200).send(util.successTrue(statusCode.OK,resMessage.BOARD_EMPTY));
    }

})

router.delete('/',async(req,res)=>{
    let index = req.body.boardIdx;
    let deleteQuery = 'DELETE FROM 4th.board WHERE boardIdx =?';
    let deleteResult;
    try{
        var connection = await pool.getConnection();
        deleteResult = await connection.query(deleteQuery,[index])||null;
    }catch(err){
        console.log(err);
        connection.rollback(()=>{});
        next(err);
        res.status(200).send(util.successFalse(statusCode.DB_ERROR,resMessage.BOARD_DROP_FAIL));
    }finally{
        console.log(deleteResult);
        if(deleteResult!=null){
            res.status(200).send(util.successTrue(statusCode.OK,resMessage.BOARD_DROP_SUCCESS));
        }else{
            res.status(200).send(util.successFalse(statusCode.DB_ERROR,resMessage.BOARD_IDX_NULL));
        }
    }

})

router.get('/',async(req,res)=>{
    let getAllBoardQuery = 'SELECT * FROM 4th.board';
    let getAllBoardResult;
    try{
        var connection = await pool.getConnection();
        getAllBoardResult = await connection.query(getAllBoardQuery);
    }catch(err){
        console.log(err);
        connection.rollback(()=>{});
        next(err);
        res.status(200).send(util.successFalse(statusCode.DB_ERROR,resMessage.READ_FAIL));
    }finally{
        console.log(getAllBoardResult);
        let datas = new Array();
        for(key in getAllBoardResult){
            let temp = {
                title : getAllBoardResult[key].title,
                content : getAllBoardResult[key].connection 
            }
            datas.push(temp);
        }
        res.status(200).send(util.successTrue(statusCode.OK,resMessage.READ_SUCCESS,datas));

    }
})
module.exports = router;
