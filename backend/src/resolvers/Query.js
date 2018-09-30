const { getUserId } = require('../utils/utils');

async function users(parent,args,context,info) {
    return context.db.query.users({},info)
}

async function user(parent,args,context,info) {
    const id = args.id;
    return context.db.query.user({where:{ id:id }},info)
}

async function me(parent,args,context,info) {
    let id = getUserId(context);
    return context.db.query.user({where:{ id }},info);
}

async function myfollowers(parent,args,context,info){
    let id = getUserId(context);
    return context.db.query.follows({
        where:{
            user_followed:{
                id:id
            }
        }
    },info)
}

async function myfollows(parent,args, context, info){
    let id = getUserId(context);
    return context.db.query.follows({
        where:{
            user_follower:{
                id:id
            }
        }
    },info)
}

async function allPhotos(parent, args, context, info){
    return context.db.query.photos({
        where:{},info
    },info)
}


async function likesUsers(parent, args, context, info){  
    return context.db.query.likeses({
        where:{
            photo_id:{
                id:args.photo_id
            }
        }
    },info)
}

async function comments(parent, args, context, info){
    return context.db.query.comments({
        where:{
            photo_id:{
                id:args.id
            }
        }
    },info)
}

module.exports = {
    users,
    user,
    me,
    myfollowers,
    myfollows,
    allPhotos,
    likesUsers,
    comments
}

