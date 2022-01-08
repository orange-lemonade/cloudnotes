import React, { useState } from "react";
import styled from "styled-components";
import { Button, Tooltip, Popconfirm } from "antd";
import {
    SaveOutlined,
    DeleteOutlined,
    ShareAltOutlined,
    UndoOutlined,
} from "@ant-design/icons";
import ShareModal from './shareModal';

const CircleButton = styled(Button)`
  display: block;
  margin: 1em;
`;

const ButtonBar = (props) => {
    const {
        noteId,
        onSave,
        onDelete,
        isDeleted,
        onRestore,
        onPermanentDelete,
        setIsDeleted,
    } = props;

    const showSave = noteId < 0 || !isDeleted;
    const showShare = noteId > 0 && !isDeleted;
    const showDelete = noteId > 0 && !isDeleted;
    const showRestore = isDeleted;
    const showDeletePermanent = isDeleted;

    const [showShareModal, setShowShareModal] = useState(false);

    return (
        <div>
            {showSave && (
                <Tooltip title="Save">
                    <CircleButton
                        type="primary"
                        shape="circle"
                        icon={<SaveOutlined />}
                        onClick={onSave}
                    />
                </Tooltip>
            )}

            {showShare &&
                <Tooltip title="Share">
                    <CircleButton
                        type="primary"
                        shape="circle"
                        icon={<ShareAltOutlined />}
                        onClick={() => setShowShareModal(true)}
                    />
                </Tooltip>
            }
            {showShare &&
                <ShareModal
                    noteId={noteId}
                    visible={showShareModal}
                    onClose={() => setShowShareModal(false)}
                />
            }
            {showDelete && (
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
            )}
            {showRestore && (
                <Tooltip title="Restore Note">
                    <CircleButton
                        type="primary"
                        shape="circle"
                        icon={<UndoOutlined />}
                        onClick={() => {
                            setIsDeleted(false);
                            onRestore(noteId);
                        }}
                    />
                </Tooltip>
            )}
            {showDeletePermanent && (
                <Tooltip title="Delete Permanently">
                    <Popconfirm
                        title="Are you sure you want to permanently delete this note?"
                        okText="Yes"
                        cancelText="No"
                        placement="left"
                        onConfirm={() => onPermanentDelete(noteId)}
                    >
                        <CircleButton
                            type="primary"
                            shape="circle"
                            danger={true}
                            icon={<DeleteOutlined />}
                        />
                    </Popconfirm>
                </Tooltip>
            )}
        </div>
    );
};

export default ButtonBar;
