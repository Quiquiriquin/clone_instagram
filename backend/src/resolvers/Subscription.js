function newLikeInPhoto(parent,args,context,info){
    return context.db.subscription.likes(
        { where: { mutation_in: [ "CREATED" ] } },
    info)
}

function newFollower(parent, args, context, info){
    return context.db.subscription.follow({
        where: {mutation_in: [ "CREATED" ] }
    },info)
}

function updateLikeInPhoto(parent, args, context, info){
    let likes = ++args.photo_id.likes
    return context.db.mutation.updateManyLikeses({
        data:{
            photo_id:{
                update:{
                    likes:likes
                }
            }
        }
    })
}

const newLike = {
    subscribe : newLikeInPhoto
}

const newFollowToMe = {
    subscribe: newFollower
}

module.exports = {
    newLike,
    newFollowToMe
}