const { ApolloServer } = require("apollo-server-lambda");
const { typeDefs } = require("./typedefs.js");
const { resolvers } = require("./resolvers.js");
const { NotesAPI } = require("./notesAPI.js");

const server = new ApolloServer({
  typeDefs,
  resolvers,
  dataSources: () => {
    return {
      notesAPI: new NotesAPI(),
    };
  },
  context: ({ event }) => {
    const token = event.headers.Authorization || "";
    return { token };
  },
});

exports.graphqlHandler = server.createHandler();
