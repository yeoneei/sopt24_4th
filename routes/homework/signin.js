var express = require('express');
var router = express.Router();
var pool = require('../../config/dbConfig');
const crypto = require('crypto-promise');

const statusCode = require('../../module/statusCode');
const resMessage = require('../../module/responseMessage');
const util = require('../../module/utils');

/* GET home page. */
router.post('/', async(req,res)=>{
    let id = req.body.id;
    let pw = req.body.password;

    try{
        const getUserInfoQuery = 'SELECT * FROM 4th.user where id = ?'
        const connection = await pool.getConnection();
        var getUserInfoResult = await connection.query(getUserInfoQuery,[id]) || null;
    }catch(err){
        connection.rollback(()=>{});
        console.log(err);
        next(err);
    }finally{

    }

    console.log(getUserInfoResult[0]);

    if(getUserInfoResult == null){
        res.status(200).send(util.successFalse(statusCode.NOT_FOUND,resMessage.NO_USER));
    }else{
        let dbPw =  getUserInfoResult[0].password;
        let salt =  getUserInfoResult[0].salt;
        let hasedPw = await crypto.pbkdf2(req.body.password,salt,100,32,'SHA512');
        let basedPw = hasedPw.toString('base64');
        let data ={
            id: id,
        }
        if(basedPw == dbPw){
            res.status(200).send(util.successTrue(statusCode.OK,resMessage.LOGIN_SUCCESS,data));
        }else{
            res.status(200).send(util.successFalse(statusCode.NOT_FOUND,resMessage.LOGIN_FAIL));
        }
    }

    
})
module.exports = router;
