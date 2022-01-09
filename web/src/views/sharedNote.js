import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { showError, SILENT_ERROR } from "../utilities/error";
import styled from "styled-components";

const NoteContainer = styled.div`
  display: flex;
  flex-flow: column;
  padding: 2em;
  width: 70%;
  margin: 0 auto;
  .note-title {
    margin: auto;
    margin-bottom: 1em;
  }
`;

const SharedNote = (props) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [noteText, setNoteText] = useState("");
  const [noteTitle, setNoteTitle] = useState("");
  const id = searchParams.get("id");

  useEffect(() => {
    const getTags = async () => {
      try {
        const response = await fetch(
          `https://api.cloudnotes.link/sharedNote?n=${id}`,
          {
            method: "GET",
          }
        );
        if (response.status === 200) {
          const responseData = await response.json();
          if (responseData && responseData.length > 0) {
            setNoteText(responseData[0].note_text);
            setNoteTitle(responseData[0].title);
          } else {
            setNoteTitle("Note Not Found");
            setNoteText("Try again.");
          }
        } else showError(response.statusText, SILENT_ERROR);
      } catch (error) {
        showError(error, SILENT_ERROR);
      }
    };
    getTags();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <NoteContainer>
      <h1 className="note-title">{noteTitle}</h1>
      <div
        dangerouslySetInnerHTML={{ __html: noteText }}
        className="note-text"
      />
    </NoteContainer>
  );
};

export default SharedNote;
