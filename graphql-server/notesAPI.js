const { RESTDataSource } = require('apollo-datasource-rest');

class NotesAPI extends RESTDataSource {
    constructor() {
        super();
        this.baseURL = 'https://api.cloudnotes.link/';
    }
    willSendRequest(request) {
        const token = this.context.token;
        request.headers.set('Content-Type', "application/json");
        request.headers.set('Authorization', `Bearer ${token}`);
    }
    async getNote(id) {
        return this.get(`note?id=${encodeURIComponent(id)}`);
    }
    async addNote(title, noteText) {
        return this.post(`note`, {
            title,
            note_text: noteText
        });
    }
}

exports.NotesAPI = NotesAPI;
