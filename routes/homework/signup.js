var express = require('express');
var router = express.Router();
var pool = require('../../config/dbConfig');
const crypto = require('crypto-promise');

const statusCode = require('../../module/statusCode');
const resMessage = require('../../module/responseMessage');
const util = require('../../module/utils');

/* GET home page. */

router.post('/',async(req,res)=>{
    let salt = await crypto.randomBytes(32);
    salt = salt.toString('base64');
    let hasedPw = await crypto.pbkdf2(String(req.body.password),salt,100,32,'SHA512');
    let basedPw = hasedPw.toString('base64');
    let userid = req.body.id;
    const getAllUserIdQuery = 'SELECT id FROM 4th.user';
    console.log(basedPw);
    
    let getAllUserIdResult;
    try{
        var connection = await pool.getConnection();
        getAllUserIdResult = await connection.query(getAllUserIdQuery) || null;
    } catch(err){
        connection.rollback(()=>{});
        console.log(err);
        next(err);
    }finally{
        pool.releaseConnection(connection);
    }
    let idCheck = false;
    for(key in getAllUserIdResult){
        console.log(getAllUserIdResult[key].id);
        if(getAllUserIdResult[key].id==userid){
            idCheck = true;
            break;
        }
    }


    if(idCheck==true){
        //이거 반응이 안옴 왜지????????
        res.status(200).send(util.successFalse(statusCode.BAD_REQUEST,resMessage.ALREADY_ID));
    }else{
        const insertUserQuery ='INSERT INTO 4th.user (id, name, password, salt) VALUES (?, ?, ?, ?)';
       try{
            var connection = await pool.getConnection();
            let result = await connection.query(insertUserQuery, [userid, req.body.name, basedPw, salt]) || null;
            console.log(result)
       }catch(err){
           console.log(err);
           connection.rollback(()=>{});
           res.status(200).send(util.successFalse(statusCode.BAD_REQUEST,resMessage.SAVE_FAIL));
           nect(err);
       }finally{
           pool.releaseConnection(connection);
           res.status(200).send(util.successTrue(statusCode.OK, resMessage.SAVE_SUCCESS));
       }
            
        

    }
   
})

module.exports = router;
