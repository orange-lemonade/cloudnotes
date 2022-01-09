# CloudNotes API Documentation

## Web Application : [https://www.cloudnotes.link/](https://www.cloudnotes.link/)

## API Endpoint : [https://api.cloudnotes.link/](https://api.cloudnotes.link/)

---

## Authentication

Each endpoint of the Api (with the exception of the `/sharedNote`) has their `JWT`'s authenticated and handled by Auth0.

---

## `/note` - NoteController Lambda Function (JWT Authorized)

| HTTP Method | Function       | Required Query Parameters                            | Required Request Body                                     | Return                                                                                                                             |
| ----------- | -------------- | ---------------------------------------------------- | --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `GET`       | **getNote**    | `id` (string) = ID of note to be retrieved           | _N/A_                                                     | Returns the `Note` that was specified in the `id` Query Param.                                                                     |
| `POST`      | **createNote** | _N/A_                                                | `{ "title": string, "note_text": string }`                | Creates a new `Note` entry with the supplied `title` and `note_text` for the currently logged in user. Returns the created `Note`. |
| `PATCH`     | **updateNote** | _N/A_                                                | `{ "id": integer, "title": string, "note_text": string }` | Updates the specified `Note` entry using the `id` with the supplied `title` and `note_text`. Returns the updated `Note`.           |
| `DELETE`    | **deleteNote** | `id` (string) = ID of note to be marked for deletion | _N/A_                                                     | Marks the specified `Note` entry for deletion using the `id` Query Param . Returns the newly marked `Note`.                        |

## `/notes` - NotesController Lambda Function (JWT Authorized)

| HTTP Method | Function           | Required Query Parameters | Required Request Body   | Return                                                                                                 |
| ----------- | ------------------ | ------------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------ |
| `GET`       | **getNotes**       | _N/A_                     | _N/A_                   | Returns an `array` of `Note`(s) that are **not** marked for deletion for the currently logged in user. |
| `POST`      | **getNotesForTag** | _N/A_                     | `{ "tag_id": integer }` | Creates a new `Note` entry with the supplied `title` and `note_text`. Returns the created `Note`.      |

## `/tag` - TagController Lambda Function (JWT Authorized)

| HTTP Method | Function      | Required Query Parameters               | Required Request Body                                               | Return                                                                                                                                                                         |
| ----------- | ------------- | --------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `GET`       | **getTags**   | _N/A_                                   | `id` (string, optional) Optional param that takes the a `Note`'s id | Returns an `array` of `Tag`(s) for the currently logged in user if no `id` is passed in the query params. Returns `Tag`s for specified `Note` if id is passed in query params. |
| `POST`      | **createTag** | _N/A_                                   | `{ "note_id": integer, "tag_text": string }`                        | Creates a new `Tag` entry with the supplied `tag_text`. Also creates a `NoteTag` entry linking the `Note` and `Tag`. Returns the created `Tag`.                                |
| `PUT`       | **removeTag** | _N/A_                                   | `{ "note_id": integer, "tag_id": integer }`                         | Removes `NoteTag` link for specified `Note` and `Tag`.                                                                                                                         |
| `PATCH`     | **updateTag** | _N/A_                                   | `{ "id": integer, "tag_text": string }`                             | Updates the specified `Tag` entry using the `id` with the supplied `tag_text`. Returns the updated `Tag`.                                                                      |
| `DELETE`    | **deleteTag** | `id` (string) = ID of tag to be deleted | _N/A_                                                               | Deletes specified `Tag` entry using the `id`. `NoteTag` entries are deleted in cascade. Returns success `response` on deletion.                                                |

## `/bin` - TrashController Lambda Function (JWT Authorized)

| HTTP Method | Function                 | Required Query Parameters                 | Required Request Body | Return                                                                                                                                                                                   |
| ----------- | ------------------------ | ----------------------------------------- | --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET`       | **getNotesFromTrash**    | _N/A_                                     | _N/A_                 | Returns an `array` of `Notes`(s) that **are** marked for deletion for the currently logged in user.                                                                                      |
| `PATCH`     | **restoreNoteFromTrash** | `id` (string) = ID of note to be restored | _N/A_                 | The `Note` entry specified by the `id` Query Param will be restored from the trash bin. Returns the newly restored `Note`.                                                               |
| `DELETE`    | **deleteTag**            | `id` (string) = ID of note to be deleted  | _N/A_                 | The `Note` entry specified by the `id` Query Param will be deleted **permanently** from the trash bin. `NoteTag` entries are deleted in cascade. Returns success `response` on deletion. |

## `/share` - ShareController Lambda Function (JWT Authorized)

| HTTP Method | Function            | Required Query Parameters                                  | Required Request Body    | Return                                                                                                                         |
| ----------- | ------------------- | ---------------------------------------------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| `GET`       | **getShareLink**    | `note_id` (string) = ID of note associated with share link | _N/A_                    | Returns the `ShareLink` that is associated with the `Note` specified with the `note_id` Query Param.                           |
| `POST`      | **createShareLink** | _N/A_                                                      | `{ "note_id": integer }` | Creates a new `ShareLink` for the specified `Note` using the supplied `note_id`. Returns the created `ShareLink`.              |
| `PATCH`     | **updateShareLink** | `id` (string) = ID of sharelink to be updated              | _N/A_                    | Generates a new share link for the specified `ShareLink` using the supplied `id` Query Param. Returns the updated `ShareLink`. |
| `DELETE`    | **updateShareLink** | `id` (string) = ID of sharelink to be deleted              | _N/A_                    | Deletes specified `ShareLink` entry using the `id`. Returns success `response` on deletion.                                    |

## `/sharedNote` - SharedLinkController Lambda Function (Public)

| HTTP Method | Function         | Required Query Parameters                   | Required Request Body | Return                                                                                         |
| ----------- | ---------------- | ------------------------------------------- | --------------------- | ---------------------------------------------------------------------------------------------- |
| `GET`       | **getShareLink** | `n` (string) = link to publicly shared note | _N/A_                 | Returns the `Note` that is associated with the `ShareLink` specified with the `n` Query Param. |

---

## TrashReaper Lambda Function (Event-Driven)

| Event              | Action Definition                                                           |
| ------------------ | --------------------------------------------------------------------------- |
| Every **24** hours | Deletes an `Note`(s) that have been marked for deletion for over `30` days. |

---

## Models of Objects Returned By Api

| Object      | Model Definition                                                                                                                                                                   |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Note`      | `{ "id" : integer, "user_id" : string, "title" : string, "note_text" : string, "created_on" : timestamp, "updated_on" : timestamp, "deleted", integer, "deleted_on" : timestamp }` |
| `Tag`       | `{ "id" : integer, "user_id" : string, "tag_text" : string }`                                                                                                                      |
| `ShareLink` | `{ "id" : integer, "note_id" : integer, "share_link" : string }`                                                                                                                   |

---
