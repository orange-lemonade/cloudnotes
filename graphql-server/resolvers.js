const resolvers = {
  Query: {
    note: async (_, { id }, { dataSources }) => {
      const result = await dataSources.notesAPI.getNote(id);
      const note = JSON.parse(result);

      return {
        id: note.id,
        title: note.title,
        noteText: note.note_text,
      };
    },
  },
  Mutation: {
      addNote: async (_, { title, noteText }, { dataSources }) => {
        const result = await dataSources.notesAPI.addNote(title, noteText);
        const note = JSON.parse(result);

        return {
            id: note.id,
            title: note.title,
            noteText: note.note_text,
        };
      }
  }
};

exports.resolvers = resolvers;
