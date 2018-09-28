const {GraphQLServer} = require('graphql-yoga');
const {Prisma} = require('prisma-binding');
const Query = require('./resolvers/Query');
const Mutation = require('./resolvers/Mutation');

const resolvers = {
    Query,
    Mutation
}

const server = new GraphQLServer ({
    typeDefs:'./src/schema.graphql',
    resolvers,
    context: req => ({
        ...req,
        db: new Prisma ({
            typeDefs: 'src/generated/prisma.graphql',
            endpoint:'https://us1.prisma.sh/enrique-alvarez-barajas-c39ae6/instagram_db/dev',
            debug:true
        })
    }),
    resolverValidationOptions: {
        requireResolversForResolveType:false
    }
})

module.exports = {server,resolvers};