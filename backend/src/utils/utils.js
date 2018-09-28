const jwt = require('jsonwebtoken');
const { APP_SECRET } = require('../Const');

function getUserId(context){
    const Authorization = context.request.get('Authorization');
    if(Authorization){
        const token = Authorization.replace('JWT ','');
        const { userId } = jwt.verify(token,APP_SECRET);
        return userId;
    }
    throw new Error("Not authenticated");
}

module.exports = {
    getUserId
}