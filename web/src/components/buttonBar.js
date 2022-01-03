import React from 'react';
import styled from 'styled-components';
import { 
    Button, 
    Tooltip, 
    Popconfirm
} from 'antd';
import { 
    SaveOutlined, 
    DeleteOutlined, 
    ShareAltOutlined,
    UndoOutlined
} from '@ant-design/icons';

const CircleButton = styled(Button)`
    display: block;
    margin: 1em;
`;

const ButtonBar = (props) => {
    const { noteId, onSave, onDelete, isDeleted } = props;

    const showSave = noteId < 0 || !isDeleted;
    const showShare = noteId > 0 && !isDeleted;
    const showDelete = noteId > 0 && !isDeleted;
    const showRestore = isDeleted;
    const showDeletePermanent = isDeleted;

    return (
        <div>
            {
                showSave && 
                <Tooltip title="Save">
                    <CircleButton 
                        type="primary" 
                        shape="circle" 
                        icon={<SaveOutlined />} 
                        onClick={onSave}/>
                </Tooltip>
            }
            {
                showShare &&
                <Tooltip title="Share">
                    <CircleButton 
                        type="primary" 
                        shape="circle" 
                        icon={<ShareAltOutlined />}
                        onClick={() => alert('sharin')}
                    />
                </Tooltip>
            }
            {
                showDelete &&
                <Tooltip title="Delete">
                    <Popconfirm
                        title="Are you sure you want to delete this note?"                           
                        okText="Yes"
                        cancelText="No"
                        placement="left"
                        onConfirm={() => onDelete(noteId)}
                    >                            
                        <CircleButton 
                            type="primary" 
                            shape="circle" 
                            danger={true} 
                            icon={<DeleteOutlined />}
                        />
                    </Popconfirm>
                </Tooltip>
            }
            {
                showRestore &&
                <Tooltip title="Restore Note">
                    <CircleButton 
                        type="primary" 
                        shape="circle" 
                        icon={<UndoOutlined />}
                        onClick={() => alert('restoring')}
                    />
                </Tooltip>
            }
            {
                showDeletePermanent &&
                <Tooltip title="Delete Permanently">
                    <Popconfirm
                        title="Are you sure you want to permanently delete this note?"                           
                        okText="Yes"
                        cancelText="No"
                        placement="left"
                        onConfirm={() => alert('deleting' + noteId)}
                    >                            
                        <CircleButton 
                            type="primary" 
                            shape="circle" 
                            danger={true} 
                            icon={<DeleteOutlined />}
                        />
                    </Popconfirm>
                </Tooltip>
            }
        </div>
    );
};

export default ButtonBar;