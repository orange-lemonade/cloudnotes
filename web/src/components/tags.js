import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Select } from 'antd';
import { useAuth0 } from '@auth0/auth0-react';
import { isEmpty } from 'lodash';

const { Option } = Select;

const TagsWrapper = styled.div`
    flex: 0 0 100%;
    margin: 0.5em 0;
    justify-content: flex-end;

    .add-tag {
        background: #fff;
        border-style: dashed;
    }
`;

const Tags = (props) => {

    const { noteId, onTagCreate } = props;

    const [noteTags, setNoteTags] = useState([]);
    const [allTags, setAllTags] = useState([]);
    const { getAccessTokenSilently } = useAuth0();

    const addTag = async (tagText) => {
        try {
            const token = await getAccessTokenSilently();
            const response = await fetch(`https://api.cloudnotes.link/tag`, {
                method: "POST",
                body: JSON.stringify({
                    note_id: noteId,
                    tag_text: tagText
                }),
                headers: {
                    "Content-Type": 'application/json',
                    "Authorization": `Bearer ${token}`
                }
            });
            if (response.status === 200) {
                const responseData = await response.json();
                if (responseData.id) {
                    setNoteTags([...noteTags, responseData]);
                    setAllTags([...allTags, responseData]);
                    onTagCreate(responseData);
                }
                else {
                    setNoteTags([...noteTags, allTags.find(tag => tag.tag_text === tagText)]);
                }
            } 
        }
        catch (error) {
            console.error(error);
        }
    };

    const untagNote = async (tagId) => {
        try {
            const token = await getAccessTokenSilently();

            const response = await fetch(`https://api.cloudnotes.link/tag`, {
                method: "PUT",
                body: JSON.stringify({
                    note_id: noteId,
                    tag_id: tagId
                }),
                headers: {
                    "Content-Type": 'application/json',
                    "Authorization": `Bearer ${token}`
                }
            });

            if (response.status === 200) {
                setNoteTags(noteTags.filter(tag => tag.id.toString() !== tagId));
            }
        }
        catch (error) {
            console.error(error);
        }

    };
    
    const getNoteTags = async () => {
        try {
            const token = await getAccessTokenSilently();
            const response = await fetch(`https://api.cloudnotes.link/tag?id=${noteId}`, {
                method: "GET",
                headers: {
                    "Content-Type": 'application/json',
                    "Authorization": `Bearer ${token}`
                }
            });
            if (response.status === 200) {
                const responseData = await response.json();
                setNoteTags(responseData);
            }           
        }
        catch (error) {
            console.error(error);
        }
    };
    
    const getAllTags = async () => {
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
                setAllTags(responseData);
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        getNoteTags();
        getAllTags();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [noteId]);

    return (
        <TagsWrapper>
            <Select 
                mode="tags" 
                style={{ width: '100%' }} 
                placeholder="Select tags" 
                onSelect={(value, obj) => addTag(isEmpty(obj) ? value : obj.children)}
                value={noteTags.map(tag => tag.id.toString())}
                onDeselect={value => untagNote(value)}
            >
                {
                    allTags.map(tag => {
                        return <Option 
                                    key={tag.id}>
                                        {tag.tag_text}
                                </Option>
                    })
                }
            </Select>
        </TagsWrapper>
    )
};

export default Tags;