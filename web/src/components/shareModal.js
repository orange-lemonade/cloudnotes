import React, { useState, useEffect } from 'react';
import { Modal } from 'antd';
import { useAuth0 } from '@auth0/auth0-react';

const EMPTY_URL = '';

const ShareModal = (props) => {
    const { 
        noteId,
        visible, 
        onClose 
    } = props;

    const { getAccessTokenSilently } = useAuth0();

    const [shareLink, setShareLink] = useState(EMPTY_URL);

    const getShareLink = async () => {
        try {
            const token = await getAccessTokenSilently();

            const response = await fetch(`https://api.cloudnotes.link/share?note_id=${noteId}`, {
                method: 'GET',
                headers: {
                    "Content-Type": 'application/json',
                    "Authorization": `Bearer ${token}`
                }
            });

            if (response.status === 200) {
                const responseData = await response.json();
                setShareLink(responseData);
            }

            

        }
        catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (noteId && noteId > 0)
            getShareLink();
    }, [noteId]);

    return (
        <>
            <Modal 
                title="Share Note"
                visible={visible} 
                onOk={onClose} 
                okText="Done"
            >
                <p>{shareLink}</p>
            </Modal>
        </>
    );
};

export default ShareModal;