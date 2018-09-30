const bcrypt = require('bcrypt');
const jsonwebtoken = require('jsonwebtoken');
const { APP_SECRET, PRICES } = require("../Const");
const { getUserId } = require('../utils/utils');

const getID = `{ id }`;

const queryUser = `{
    id,
    email,
    full_name,
    user_name,
    birth_date,
    suscription{
        suscription_type,
        end_date
    }
}`

Date.prototype.addDays = function(days){
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}

async function signup(parent,args,context,info) {
    const password = await bcrypt.hash(args.password,10);

    const user = await context.db.mutation.createUser(
       {data:{...args,password,suscription:{
           create:{
               suscription_type : "FREE",
               price:0,
               end_date: new Date().addDays(30) 
           }
       }
    }},queryUser
    )

    const token = jsonwebtoken.sign({userId:user.id},APP_SECRET);

    return {
        token,
        user
    }

}

async function login(parent,args,context,info){

    const user = await context.db.query.user({
        where:{email:args.email}
    })

    if(!user){
        throw new Error("Not user find");
    }

    const validPassword = await bcrypt.compare(args.password, user.password);
    console.log(validPassword);
    if(!validPassword) throw new Error ("Invalid password")

    const token = jsonwebtoken.sign({userId:user.id},APP_SECRET);

    return {
        token,
        user
    }

}

async function upgradeSuscription(parent,args,context,info){
    let user = getUserId(context)

    let days = (args.suscription_type == "PREMIUM") ? 90 : 30;

    // Paypal Stuff here

    let updatedUser = await context.db.mutation.updateUser(
        {
            data:{
                suscription:{
                    update:
                    {
                            suscription_type:args.suscription_type,
                            end_date:new Date().addDays(days),
                            price:PRICES[args.suscription_type]
                        }
                }
            },
            where:{
                id:user
            }

        },queryUser)

    return updatedUser


}   



  async function updateUser(parent,args,context,info) {
    let userId = getUserId(context);
    if(args.password) args.password = await bcrypt.hash(args.password,10);
    
    let updateUser = await context.db.mutation.updateUser({
        data:{...args}, 
        where:{
            id:userId
        }
    });

    return updateUser;
}

const queryFollow = `{
    user_follower{
        user_name
    }
    user_followed{
        user_name
    }
}`

async function follow(parent, args, context, info){
    let followed_id = args.followedd_id;
    let follower_id = getUserId(context);
    console.log("Follower ------> ",follower_id);
    console.log("Followed ------> ",followed_id);
    let newFollower = await context.db.mutation.createFollow({
        data:{
            user_followed:{
                connect:{
                    id:followed_id
                }
            },
            user_follower:{
                connect:{
                    id:follower_id
                }
            }
    }
},queryFollow
)

    return newFollower;
}

const queryPhoto = `{
    user{
        user_name
    }
    upload_date,
    url,
    description,
    likes
}`

async function postPhoto(parent, args, context, info){
    let user_id = getUserId(context);

    let newPhoto = await context.db.mutation.createPhoto({
        data:{
            user:{
                connect:{
                    id:user_id
                }
            },
            ...args,
            upload_date: new Date(),
            likes: 0
        }
    },queryPhoto);

    return newPhoto;
}

const queryLike=`{
    like_by{
        user_name
    },
    photo_id{
        user{
            user_name
        }
        id
        likes
        description
    },
    time_stamp
}`

async function likePhoto(parent, args, context, info){
    let id = getUserId(context);
    let newLike = await context.db.mutation.createLikes({
        data:{
            time_stamp: new Date(),
            like_by:{
                connect:{
                    id:id
                }
            },
            photo_id:{
                connect:{
                    id:args.photo_id
                }
                
            }
        }
    },queryLike)

    return newLike;
}

const queryUpdateLikes = `{
    count
}`

const queryUpdateLikesOnPhoto = `{
    likes
}`

// async function updateLikeOnPhoto(parent,args,context,info){
//     let id = getUserId(context);
    
//     let updateLikeOnPhoto = await context.db.mutation.updatePhoto({
//         data:{
//             likes: updateLikes(parent,args,context,info)
//         },
//         where:{
//             id
//         }
//     })
// }

async function likesUserss(parent, args, context, info){  
    let likes = await context.db.query.likeses({
        where:{
            photo_id:{
                id:args.photo_id
            }
        }
    })
    console.log(likes.length);
    return likes.length;
}


async function updateLikes(parent, args, context, info){
    let id = getUserId(context);
    let likes = likesUserss(parent, args,context, info);
    let updateLike = await context.db.mutation.updateManyLikeses({
        data:{
            photo_id:{
                update:{
                    likes: likes
                }
            }
        },
        where:{
            photo_id:{
                id:args.photo_id
            }
        }
    })

    return updateLike;
}

const queryComment = `{
    photo_id{
        user{
            user_name
        }
        description
    }
    time_stamp
    comment
    commented_by{
        user_name
    }
}`

async function comment(parent, args, context, info){
    let id = getUserId(context);
    let newComment = await context.db.mutation.createComment({
        data:{
            time_stamp: new Date(),
            photo_id:{
                connect:{
                    id:args.photo_id
                }
            },
            commented_by:{
                connect:{
                    id:id
                }
            },
            comment:args.comment
        }
    },queryComment);

    return newComment;
}

  module.exports = {
    signup,
    login,
    upgradeSuscription,
    updateUser,
    follow,
    postPhoto,
    likePhoto,
    updateLikes,
    comment
}