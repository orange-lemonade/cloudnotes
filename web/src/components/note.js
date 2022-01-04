import React, { useState, useEffect } from "react";
import styled from 'styled-components';
import ReactQuill from 'react-quill';
import { 
    Tag, 
    Input, 
} from 'antd';
import { useAuth0 } from '@auth0/auth0-react';
import { 
    PlusOutlined, 
    EditOutlined
} from '@ant-design/icons';
import 'react-quill/dist/quill.snow.css';
import ButtonBar from "./buttonBar";

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

const Tags = styled.div`
    flex: 0 0 auto;
    margin: 0.5em;
    justify-content: flex-end;

    .add-tag {
        background: #fff;
        border-style: dashed;
    }
`;

const Note = (props) => {
    console.log(props);
    const { noteId, onSave, onDelete, onRestore, onPermanentDelete } = props;

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
                console.log(responseData);
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
    }, [props.noteId]);

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
                    noteId > 0 && 
                        <Tags>
                            <Tag closable={true}>hi</Tag>
                            <Tag className="add-tag" onClick={() => {}}>
                                <PlusOutlined /> Add Tag
                            </Tag>
                        </Tags>
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
                onSave={() => {
                    const editorContent = reactQuillRef.getEditorContents();
                    onSave(noteId, title, editorContent);
                }}
                onDelete={onDelete}
                isDeleted={isDeleted === 1}
                onRestore={onRestore}
                onPermanentDelete={onPermanentDelete}
            />
           
        </NoteContainer>
    );
};

export default Note;