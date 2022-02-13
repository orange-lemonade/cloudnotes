const { ApolloServer } = require('apollo-server');
const {typeDefs} = require('./typedefs.js');
const { resolvers } = require('./resolvers.js');
const { NotesAPI } = require('./notesAPI.js');

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
// const server = new ApolloServer({ typeDefs, resolvers });

// // The `listen` method launches a web server.
// server.listen().then(({ url }) => {
//   console.log(`🚀  Server ready at ${url}`);
// });

const server = new ApolloServer({ 
    typeDefs, 
    resolvers,
    dataSources: () => {
        return {
            notesAPI: new NotesAPI()
        }
    },
    context: ({ req }) => {
        const token = req.headers.authorization || '';
        return { token };
        console.log('req')
        console.log(req);
    }
});
server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
