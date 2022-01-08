import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Modal, Button, Input, Tooltip, message } from 'antd';
import { useAuth0 } from '@auth0/auth0-react';
import { isEmpty } from 'lodash';
import { CopyOutlined } from '@ant-design/icons';
import { showError, SILENT_ERROR, DISPLAY_ERROR } from '../utilities/error';

const EMPTY_URL = '';

const StyledButton = styled(Button)`
    padding: 0;
`;

const formatUrl = (id) => `${window.location.origin}/note?id=${id}`;

const ShareModal = (props) => {
    const { 
        noteId,
        visible, 
        onClose 
    } = props;

    const { getAccessTokenSilently } = useAuth0();

    const [shareLink, setShareLink] = useState(EMPTY_URL);
    const [shareLinkId, setShareLinkId] = useState(0);
    const [isShared, setIsShared] = useState(false);

    const inputRef = useRef(null); 

    const createShareLink = async () => {
        try {
            const token = await getAccessTokenSilently();

            const response = await fetch(`https://api.cloudnotes.link/share`, {
                method: 'POST',
                body: JSON.stringify({
                    "note_id": noteId
                }),
                headers: {
                    "Content-Type": 'application/json',
                    "Authorization": `Bearer ${token}`
                }
            });

            if (response.status === 200) {
                const responseData = await response.json();
                const link = (responseData && responseData.share_link) || EMPTY_URL;
                setShareLink(link);
                setShareLinkId((responseData && responseData.id) || 0);
                setIsShared(!isEmpty(link));
            }
            else showError(response.statusText, DISPLAY_ERROR);

        }
        catch (error) {
            showError(error, DISPLAY_ERROR);
        }
    };

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
                const link = (responseData && responseData.share_link) || EMPTY_URL;
                setShareLink(link);
                setShareLinkId((responseData && responseData.id) || 0);
                setIsShared(!isEmpty(link));
            }
            else showError(response.statusText, SILENT_ERROR);
        }
        catch (error) {
            showError(error, SILENT_ERROR);
        }
    };

    const stopSharing = async () => {
        try {
            const token = await getAccessTokenSilently();

            const response = await fetch(`https://api.cloudnotes.link/share?id=${shareLinkId}`, {
                method: 'DELETE',
                headers: {
                    "Content-Type": 'application/json',
                    "Authorization": `Bearer ${token}`
                }
            });

            if (response.status === 200) {
                setShareLink(EMPTY_URL);
                setIsShared(false);
            }
            else showError(response.statusText, DISPLAY_ERROR);
        }
        catch (error) {
            showError(error, DISPLAY_ERROR);
        }
    };

    useEffect(() => {
        if (noteId && noteId > 0)
            getShareLink();
    // eslint-disable-next-line react-hooks/exhaustive-deps        
    }, [noteId]);

    return (
        <>
            <Modal 
                title="Share Note"
                visible={visible} 
                onOk={onClose} 
                onCancel={onClose}
                cancelText="Cancel"
                okText="Done"
            >
                {isShared && 
                    <div>
                        <Input.Group compact>
                            <Input
                                style={{ width: 'calc(100% - 50px)' }}
                                value={formatUrl(shareLink)}
                                ref={inputRef}
                            />
                            <Tooltip title="Copy Link">
                                <Button 
                                    icon={<CopyOutlined />} 
                                    onClick={() => {
                                        const text = inputRef.current.state.value;
                                        navigator.clipboard.writeText(text);
                                        message.success('Copied!');
                                    }}/>
                            </Tooltip>
                        </Input.Group>
                        <StyledButton 
                            type="link"
                            onClick={stopSharing}
                            danger
                        >Stop sharing</StyledButton>
                    </div>
                }
                {!isShared && 
                    <div>
                        <p>Anyone with the link will be able to see the note.</p>                
                        <StyledButton 
                            type="link"
                            onClick={createShareLink}
                        >Create link</StyledButton>
                    </div>
                }
            </Modal>
        </>
    );
};

export default ShareModal;