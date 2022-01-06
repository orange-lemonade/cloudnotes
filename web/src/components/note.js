import React, { useState, useEffect } from "react";
import styled from 'styled-components';
import ReactQuill from 'react-quill';
import { Input } from 'antd';
import { useAuth0 } from '@auth0/auth0-react';
import { EditOutlined } from '@ant-design/icons';
import 'react-quill/dist/quill.snow.css';
import ButtonBar from "./buttonBar";
import Tags from './tags';

const NoteContainer = styled.div`
    display: flex;
    flex-flow: row;
    margin-right: 9px;
`;

const Editor = styled.div`
    display: flex;
    flex-flow: wrap;
    padding: 0.5em;

    .note-editor {
        flex: 1 1 100%;
        height: 100%;
    }
`;

const Note = (props) => {
    const { 
        noteId, 
        onSave, 
        onDelete, 
        onRestore, 
        onPermanentDelete, 
        onTagCreate 
    } = props;

    let reactQuillRef = null

    const [title, setTitle] = useState('');
    const [noteText, setNoteText] = useState('');
    const [isDeleted, setIsDeleted] = useState();

    const { getAccessTokenSilently} = useAuth0();

    useEffect(() => {
        const getNoteById = async () => {
            try {
                const token = await getAccessTokenSilently();
                const response = await fetch(`https://api.cloudnotes.link/note?id=${noteId}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": 'application/json',
                        "Authorization": `Bearer ${token}`
                    }
                });
                const responseData = await response.json();
                setTitle(responseData.title);
                setNoteText(responseData.note_text);
                setIsDeleted(responseData.deleted);
            } catch (error) {
                console.log(error);
            }
        };

        if (noteId > 0)
            getNoteById();
        else {
            setTitle("New note");
            setNoteText("");
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [noteId]);

    return (
        <NoteContainer>
            <Editor>

                <Input 
                    size="large" 
                    placeholder="Title" 
                    prefix={<EditOutlined />} 
                    value={title}
                    bordered={false}
                    onChange={e => { 
                        setTitle(e.target.value);
                        setNoteText(reactQuillRef.getEditor().getText());
                    }}
                />

                {
                    noteId > 0 && !isDeleted &&
                        <Tags 
                            noteId={noteId}
                            onTagCreate={onTagCreate}
                        />
                }

                <ReactQuill 
                    className="note-editor"
                    theme="snow" 
                    value={noteText} 
                    ref={(el) => { reactQuillRef = el; }}
                />

            </Editor>
            
            <ButtonBar
                noteId={noteId}
                isDeleted={isDeleted === 1}
                onSave={() => onSave(noteId, title, reactQuillRef.getEditorContents())}
                onDelete={onDelete}
                onRestore={onRestore}
                onPermanentDelete={onPermanentDelete}
            />
           
        </NoteContainer>
    );
};

export default Note;