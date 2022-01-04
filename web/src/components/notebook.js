import React, { useState, useEffect } from "react";
import { 
    Layout, 
    Divider, 
    Menu, 
    Empty,
    message 
} from 'antd';
import { 
    TagOutlined, 
    SnippetsOutlined, 
    DeleteOutlined, 
    EditOutlined
} from '@ant-design/icons';
import { useAuth0 } from '@auth0/auth0-react';
import styled from 'styled-components';
import Note from './note';

const { Sider, Content } = Layout;

const NoData = styled(Empty)`
    color: rgba(255, 255, 255, 0.65);
`;

const MenuDivider = styled(Divider)`
    border-top-color: rgba(255, 255, 255, 0.65);
    margin: 10px 0;
`;

const SILENT_ERROR = Symbol("silent");
const DISPLAY_ERROR = Symbol("display");
const showError = (errorType, errorMessage) => {
    if (errorType === DISPLAY_ERROR)
        message.error('There was an error processing your request');
    console.log(errorMessage);
};

const Notebook = () => {
    const { getAccessTokenSilently } = useAuth0();  
    const [state, setState] = useState({
        tags: [],
        notes: []
    });

    const saveNewNote = async (title, text) => {
        try {  
            const token = await getAccessTokenSilently();        
            const response = await fetch(`https://api.cloudnotes.link/note`, {
                method: "POST",
                body: JSON.stringify({ 
                    "title": title, 
                    "note_text": text 
                }),
                headers: {
                    "Content-Type": 'application/json',
                    "Authorization": `Bearer ${token}`
                }
            });

            const responseData = await response.json();
            if (response.status === 200) {
                message.success('Your note has been created');
                getAllNotes("all", responseData.id.toString());
            }
            else showError(response.statusText, DISPLAY_ERROR);
        } catch (error) {
            showError(error, DISPLAY_ERROR);
        }
    };

    const editNote = async (id, title, text) => {
        try {  
            const token = await getAccessTokenSilently();        
            const response = await fetch(`https://api.cloudnotes.link/note`, {
                method: "PATCH",
                body: JSON.stringify({ 
                    "id": id, 
                    "title": title, 
                    "note_text": text 
                }),
                headers: {
                    "Content-Type": 'application/json',
                    "Authorization": `Bearer ${token}`
                }
            });

            if (response.status === 200)
                message.success('Your changes have been saved');
            else showError(response.statusText, DISPLAY_ERROR);
        } catch (error) {
            showError(error, DISPLAY_ERROR);
        }
    };


    const onPermanentDelete = async (noteId) => {
        try {  
            const token = await getAccessTokenSilently();        
            const response = await fetch(`https://api.cloudnotes.link/bin?id=${noteId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": 'application/json',
                    "Authorization": `Bearer ${token}`
                }
            });

            if (response.status === 200) {
                message.success('Your note has been deleted permanently');
                getAllNotes("all");
            }
            else showError(response.statusText, DISPLAY_ERROR);
        } catch (error) {
            showError(error, DISPLAY_ERROR);
        }
    }

    const onRestore = async (noteId) => {
        try {  
            const token = await getAccessTokenSilently();        
            const response = await fetch(`https://api.cloudnotes.link/bin?id=${noteId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": 'application/json',
                    "Authorization": `Bearer ${token}`
                }
            });

            if (response.status === 200) {
                message.success('Your note has been restored');
                getAllNotes("all", noteId.toString());
            }
            else showError(response.statusText, DISPLAY_ERROR);
        } catch (error) {
            showError(error, DISPLAY_ERROR);
        }
    }

    const onSave = async (id, title, text) => 
        id <= 0 ? saveNewNote(title, text) : editNote(id, title, text);             


    const onDelete = async(id) => {
        try {
            const token = await getAccessTokenSilently();        
            const response = await fetch(`https://api.cloudnotes.link/note?id=${id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": 'application/json',
                    "Authorization": `Bearer ${token}`
                }
            });
            if (response.status === 200)
                message.info('Your note has been deleted');
            else showError(response.statusText, DISPLAY_ERROR);
        } catch (error) {
            console.log(error, DISPLAY_ERROR);
        }
    };

    const getNotesByTag = async (tagId) => {
        try {
            const token = await getAccessTokenSilently();            
            const response = await fetch(`https://api.cloudnotes.link/notes`, {
                method: "POST",
                body: JSON.stringify({ "tag_id": tagId }),
                headers: {
                    "Content-Type": 'application/json',
                    "Authorization": `Bearer ${token}`
                }
            });

            if (response.status === 200) {
                const responseData = await response.json();
                
                setState({
                    ...state,
                    notes: responseData,
                    selectedTag: tagId,
                    selectedNote: -1
                });
            }
            else showError(response.statusText, SILENT_ERROR);
        } catch (error) {
            showError(error, SILENT_ERROR);
        }
    };


    const getTrash = async (tagId) => {
        try {            
            const token = await getAccessTokenSilently();
            const response = await fetch(`https://api.cloudnotes.link/bin`, {
                method: "GET",
                headers: {
                    "Content-Type": 'application/json',
                    "Authorization": `Bearer ${token}`
                }
            });

            if (response.status === 200) {
                const responseData = await response.json();

                setState({
                    ...state,
                    notes: responseData,
                    selectedTag: tagId,
                    selectedNote: -1
                });
            }
            else showError(response.statusText, SILENT_ERROR);
        } catch (error) {
            showError(error, SILENT_ERROR);
        }
    };

    const getAllNotes = async (tagId, preselectedNote) => {
        try {
            const token = await getAccessTokenSilently();            
            const response = await fetch(`https://api.cloudnotes.link/notes`, {
                method: "GET",
                headers: {
                    "Content-Type": 'application/json',
                    "Authorization": `Bearer ${token}`
                }
            });

            if (response.status === 200) {
                const responseData = await response.json();

                setState({
                    ...state,
                    notes: responseData,
                    selectedTag: tagId,
                    selectedNote: preselectedNote || -1
                });
            }
            else showError(response.statusText, SILENT_ERROR);
        } catch (error) {
            showError(error, SILENT_ERROR);
        }
    };


    const handleTagClick = (e) => {
        const tag = e.key;

        switch (tag) {
            case "all":
                getAllNotes(tag);
                break;
            case "trash":
                getTrash(tag);
                break;
            case "new":
                setState({
                    ...state,
                    notes: [],
                    selectedNote: 0,
                    selectedTag: tag
                });
                break;
            default:
                getNotesByTag(tag);
        }
    };

    const handleNoteClick = (e) => {
        setState({
            ...state,
            selectedNote: e.key,
        });
    };

    useEffect(() => {
        const getTags = async () => {
            try {
                const token = await getAccessTokenSilently();

                const response = await fetch(`https://api.cloudnotes.link/tag`, {
                    method: "GET",
                    headers: {
                        "Content-Type": 'application/json',
                        "Authorization": `Bearer ${token}`
                    }
                });
                if (response.status === 200) {
                    const responseData = await response.json();

                    setState({
                        ...state,
                        tags: responseData
                    });
                }
                else showError(response.statusText, SILENT_ERROR);
            } catch (error) {
                showError(error, SILENT_ERROR);
            }
        };
        getTags();
    }, []);


    return (
        <>
            <Sider>
            <Menu
                onClick={handleTagClick}
                mode="inline"
                theme="dark"
                selectedKeys={[state.selectedTag]}
            >
                <Menu.Item 
                    key="new"
                    icon={<EditOutlined />}
                    >
                    New note
                </Menu.Item>
                <MenuDivider /> 
                <Menu.Item 
                    key="all"
                    icon={<SnippetsOutlined />}
                    >
                    All Notes
                </Menu.Item>
                <Menu.Item 
                    key="trash"
                    icon={<DeleteOutlined />}
                    >
                    Trash
                </Menu.Item>
                <MenuDivider /> 
                {
                    state.tags.map((item) => {
                        return <Menu.Item 
                                key={item.id}
                                icon={<TagOutlined />}
                                >
                                    {item.tag_text}
                                </Menu.Item>;
                    })
                }
            </Menu>
            </Sider>
            {
                state.selectedNote !== 0 && state.selectedTag && 
                    <Sider style={{"border-left": "1px solid rgba(255, 255, 255, 0.65)" }}>
                        {
                            state.notes.length === 0 ? 
                                <NoData 
                                    image={Empty.PRESENTED_IMAGE_SIMPLE} 
                                    description={"No notes"}
                                /> 
                                :
                                <Menu
                                    onClick={handleNoteClick}
                                    mode="inline"
                                    theme="dark"
                                    selectedKeys={[state.selectedNote]}
                                >
                                    {
                                        state.notes.map((item) => 
                                            <Menu.Item key={item.id}>{item.title}</Menu.Item>
                                        )
                                    }
                                </Menu>   
                        }
                    </Sider>
            }
            <Content>
                { 
                    state.selectedNote >= 0 &&
                        <Note 
                            noteId={parseInt(state.selectedNote) || -1}
                            onSave={onSave}
                            onDelete={onDelete}
                            onRestore={onRestore}
                            onPermanentDelete={onPermanentDelete}
                        />
                }
            </Content>
        </>
    );
};

export default Notebook;