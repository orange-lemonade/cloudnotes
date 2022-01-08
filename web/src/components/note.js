import React, { useState, useEffect } from "react";
import styled from "styled-components";
import ReactQuill from "react-quill";
import { Image, Input } from "antd";
import spinner from "../assets/RollingSpinner.gif";
import { useAuth0 } from "@auth0/auth0-react";
import { EditOutlined } from "@ant-design/icons";
import "react-quill/dist/quill.snow.css";
import ButtonBar from "./buttonBar";
import Tags from "./tags";

const NoteContainer = styled.div`
  display: flex;
  flex-flow: row;
  margin-right: 9px;
  background-color: #f0f2f5;
  border-top-left-radius: 10px;
  align-items: flex-start;
  height: 100%;

`;

const LoadingContainer = styled.div`
  width: 50%;
  display: flex;
  justify-content: center;
  padding-top: 3rem;
  margin: 0 auto;
`;

const StyledInput = styled(Input)`
  padding-bottom: 0.5rem;
  font-size: 1.5rem;
  input[type="text"] {
    padding-left: 5px;
    font-size: 1.25rem;
    font-weight: bold;
  }

  &:hover {
    background-color: rgba(196, 196, 196, 0.5);
    border-radius: 10px;
  }
`;

const Editor = styled.div`
  display: flex;
  flex-flow: wrap;
  padding: 0.5em;
  width: 60vw;

  .note-editor {
    margin-top: 5px;
    border-radius: 10px;
    flex: 1 1 100%;
    max-height: 100%;

    .ql-container {
        height: auto;
    }
  }
`;

const Note = (props) => {
  const {
    noteId,
    onSave,
    onDelete,
    onRestore,
    onPermanentDelete,
    onTagCreate,
  } = props;

  let reactQuillRef = null;

  const [isLoading, setIsLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [noteText, setNoteText] = useState("");
  const [isDeleted, setIsDeleted] = useState();
  const { getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    const getNoteById = async () => {
      try {
        const token = await getAccessTokenSilently();
        const response = await fetch(
          `https://api.cloudnotes.link/note?id=${noteId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const responseData = await response.json();
        setIsLoading(false);
        setTitle(responseData.title);
        setNoteText(responseData.note_text);
        setIsDeleted(responseData.deleted);
      } catch (error) {
        console.log(error);
      }
    };

    if (noteId > 0) getNoteById();
    else {
      setIsLoading(false);
      setTitle("New note");
      setNoteText("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noteId]);

  return (
    <>
      {isLoading ? (
        <LoadingContainer>
          <Image src={spinner} />
        </LoadingContainer>
      ) : (
        <NoteContainer>
          <Editor>
            <StyledInput
              size="large"
              placeholder="Title"
              disabled={isDeleted === 1 ? true : false}
              prefix={<EditOutlined />}
              value={title}
              bordered={false}
              onChange={(e) => {
                setTitle(e.target.value);
                setNoteText(reactQuillRef.getEditor().getText());
              }}
            />

            {noteId > 0 && !isDeleted && (
              <Tags noteId={noteId} onTagCreate={onTagCreate} />
            )}

            <ReactQuill
              className="note-editor"
              readOnly={isDeleted === 1 ? true : false}
              theme="snow"
              value={noteText}
              ref={(el) => {
                reactQuillRef = el;
              }}
            />
          </Editor>
          <ButtonBar
            noteId={noteId}
            isDeleted={isDeleted === 1}
            onSave={() =>
              onSave(noteId, title, reactQuillRef.getEditorContents())
            }
            onDelete={onDelete}
            onRestore={onRestore}
            onPermanentDelete={onPermanentDelete}
            setIsDeleted={setIsDeleted}
          />
        </NoteContainer>
      )}
    </>
  );
};

export default Note;
