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
            message.success('Your note has been created');
            getAllNotes("all", responseData.id.toString());
        } catch (error) {
            console.log(error);
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

            const responseData = await response.json();

            message.success('Your changes have been saved');
            //if (responseData) show success message
        } catch (error) {
            console.log(error);
        }
    };


    const onSave = async (id, title, text) => {
       // debugger;
        id <= 0 ? saveNewNote(title, text) : editNote(id, title, text);             
    };

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
            console.log(response);
            message.info('Your note has been deleted');
        } catch (error) {
            console.log(error);
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

            const responseData = await response.json();
            console.log(responseData);
            setState({
                ...state,
                notes: responseData,
                selectedTag: tagId,
                selectedNote: -1
            });
        } catch (error) {
            console.log(error);
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

            const responseData = await response.json();

            setState({
                ...state,
                notes: responseData,
                selectedTag: tagId,
                selectedNote: -1
            });
        } catch (error) {
            console.log(error);
        }
    };

    const getAllNotes = async (tagId, preselectedNote) => {
        try {
            //debugger
            const token = await getAccessTokenSilently();
            
            const response = await fetch(`https://api.cloudnotes.link/notes`, {
                method: "GET",
                headers: {
                    "Content-Type": 'application/json',
                    "Authorization": `Bearer ${token}`
                }
            });

            const responseData = await response.json();
            console.log(responseData);

            setState({
                ...state,
                notes: responseData,
                selectedTag: tagId,
                selectedNote: preselectedNote || -1
            });
        } catch (error) {
            console.log(error);
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
    }

    const handleNoteClick = (e) => {
        setState({
            ...state,
            selectedNote: e.key,
        });
    }

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

                const responseData = await response.json();

                setState({
                    ...state,
                    tags: responseData
                });
            } catch (error) {
                console.log(error);
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
                state.selectedNote !== 0 && 
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
                                        state.notes.map((item) => {
                                            return <Menu.Item key={item.id}>
                                                        {item.title}
                                                    </Menu.Item>;
                                        })
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
                        />
                }
            </Content>
        </>
    );
};

export default Notebook;