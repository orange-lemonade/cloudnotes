const { gql } = require('apollo-server');

const typeDefs = gql`
  type Query {
    hello: String,
    note(id: ID!): Note
  }
  type Note {
      id: ID,
      title: String,
      noteText: String
  }
  type Mutation {
      addNote(title: String, noteText: String): Note
  }
`;

exports.typeDefs = typeDefs;