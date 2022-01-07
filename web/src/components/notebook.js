import React, { useState, useEffect } from "react";
import { Layout, Divider, Menu, Empty, message } from "antd";
import {
  TagOutlined,
  SnippetsOutlined,
  DeleteOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { useAuth0 } from "@auth0/auth0-react";
import styled from "styled-components";
import { isUndefined } from "lodash";
import Note from "./note";

const { Sider, Content } = Layout;

const NoData = styled(Empty)`
  color: rgba(255, 255, 255, 0.65);
`;

const MenuDivider = styled(Divider)`
  border-top-color: rgba(255, 255, 255, 0.65);
  margin: 10px 0;
`;

const StyledSider = styled(Sider)`
  border-top-left-radius: ${(props) => (props.secondary ? "10px" : "0")};

  background-color: ${(props) => (props.secondary ? "#787A91" : "#0F044C")};
  .ant-menu.ant-menu-dark,
  .ant-menu-dark .ant-menu-sub,
  .ant-menu.ant-menu-dark .ant-menu-sub {
    background-color: ${(props) => (props.secondary ? "#787A91" : "#0F044C")};
    border-radius: 10px;
    color: white;
  }

  .ant-menu-dark.ant-menu-inline .ant-menu-item,
  .ant-menu-dark.ant-menu-inline .ant-menu-submenu-title {
    background-color: ${(props) => (props.secondary ? "#787A91" : "#0F044C")};
    margin-top: 0.5rem;
    color: white;
    padding-top: 4px;
    padding-bottom: 4px;

    &:hover {
      background-color: rgba(196, 196, 196, 0.5);
    }
  }
`;

const StyledMenu = styled(Menu)`
  background-color: ${(props) => (props.secondary ? "#787A91" : "#0F044C")};
  .ant-layout-sider-children {
    background-color: red;
  }
`;

const StyledContent = styled(Content)`
  padding: 0.75rem;
  border-top-left-radius: ${(props) =>
    props.selectedNote === 0 ? "10px" : "0"};

  background-color: ${(props) => (props.secondary ? "#0F044C" : "#f0f2f5")};
`;

const StyledMenuItem = styled(Menu.Item)`
  background-color: ${(props) => (props.secondary ? "#787A91" : "#0F044C")};
`;

const SILENT_ERROR = Symbol("silent");
const DISPLAY_ERROR = Symbol("display");
const showError = (errorType, errorMessage) => {
  if (errorType === DISPLAY_ERROR)
    message.error("There was an error processing your request");
  console.error(errorMessage);
};

const Notebook = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [state, setState] = useState({
    tags: [],
    notes: [],
    fetchedTags: false,
  });

  const onTagCreate = async (tag) => {
    setState({
      ...state,
      tags: [...state.tags, tag],
    });
  };

  const saveNewNote = async (title, text) => {
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(`https://api.cloudnotes.link/note`, {
        method: "POST",
        body: JSON.stringify({
          title: title,
          note_text: text,
        }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const responseData = await response.json();
      if (response.status === 200) {
        message.success("Your note has been created");
        getAllNotes("all", responseData.id.toString());
      } else showError(response.statusText, DISPLAY_ERROR);
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
          id: id,
          title: title,
          note_text: text,
        }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        message.success("Your changes have been saved");
        getAllNotes("all", id);
      } else showError(response.statusText, DISPLAY_ERROR);
    } catch (error) {
      showError(error, DISPLAY_ERROR);
    }
  };

  const onPermanentDelete = async (noteId) => {
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(
        `https://api.cloudnotes.link/bin?id=${noteId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        message.success("Your note has been deleted permanently");
        getAllNotes("all");
      } else showError(response.statusText, DISPLAY_ERROR);
    } catch (error) {
      showError(error, DISPLAY_ERROR);
    }
  };

  const onRestore = async (noteId) => {
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(
        `https://api.cloudnotes.link/bin?id=${noteId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        message.success("Your note has been restored");

        getAllNotes("all", noteId.toString());
      } else showError(response.statusText, DISPLAY_ERROR);
    } catch (error) {
      showError(error, DISPLAY_ERROR);
    }
  };

  const onSave = async (id, title, text) => {
    console.log(id, title, text);
    id <= 0 ? saveNewNote(title, text) : editNote(id, title, text);
  };

  const onDelete = async (id) => {
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(
        `https://api.cloudnotes.link/note?id=${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status === 200) {
        message.info("Your note has been deleted");
        getAllNotes("all");
      } else showError(response.statusText, DISPLAY_ERROR);
    } catch (error) {
      showError(error, DISPLAY_ERROR);
    }
  };

  const getNotesByTag = async (tagId) => {
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(`https://api.cloudnotes.link/notes`, {
        method: "POST",
        body: JSON.stringify({ tag_id: tagId }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        const responseData = await response.json();

        setState({
          ...state,
          notes: responseData,
          selectedTag: tagId,
          selectedNote: -1,
        });
      } else showError(response.statusText, SILENT_ERROR);
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
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        const responseData = await response.json();

        setState({
          ...state,
          notes: responseData,
          selectedTag: tagId,
          selectedNote: -1,
        });
      } else showError(response.statusText, SILENT_ERROR);
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
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        const responseData = await response.json();

        setState({
          ...state,
          notes: responseData,
          selectedTag: tagId,
          selectedNote: preselectedNote || -1,
        });
      } else showError(response.statusText, SILENT_ERROR);
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
          selectedTag: tag,
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
    if (state.fetchedTags && isUndefined(state.selectedTag)) {
      getAllNotes("all");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.fetchedTags]);

  useEffect(() => {
    const getTags = async () => {
      try {
        const token = await getAccessTokenSilently();

        const response = await fetch(`https://api.cloudnotes.link/tag`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.status === 200) {
          const responseData = await response.json();

          setState({
            ...state,
            tags: responseData,
            fetchedTags: true,
          });
        } else showError(response.statusText, SILENT_ERROR);
      } catch (error) {
        showError(error, SILENT_ERROR);
      }
    };
    getTags();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <StyledSider>
        <StyledMenu
          onClick={handleTagClick}
          mode="inline"
          theme="dark"
          selectedKeys={[state.selectedTag]}
        >
          <StyledMenuItem key="new" icon={<EditOutlined />}>
            New note
          </StyledMenuItem>
          <MenuDivider />
          <StyledMenuItem key="all" icon={<SnippetsOutlined />}>
            All Notes
          </StyledMenuItem>
          <StyledMenuItem key="trash" icon={<DeleteOutlined />}>
            Trash
          </StyledMenuItem>
          <MenuDivider />
          {state.tags.map((item) => {
            return (
              <StyledMenuItem key={item.id} icon={<TagOutlined />}>
                {item.tag_text}
              </StyledMenuItem>
            );
          })}
        </StyledMenu>
      </StyledSider>
      {state.selectedNote !== 0 && state.selectedTag && (
        <StyledSider secondary={true}>
          {state.notes.length === 0 ? (
            <NoData
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={"No notes"}
            />
          ) : (
            <StyledMenu
              onClick={handleNoteClick}
              mode="inline"
              theme="dark"
              secondary={true}
              selectedKeys={[state.selectedNote]}
            >
              {state.notes.map((item) => (
                <StyledMenuItem secondary={true} key={item.id}>
                  {item.title !== "" ? item.title : "No Title"}
                </StyledMenuItem>
              ))}
            </StyledMenu>
          )}
        </StyledSider>
      )}
      <StyledContent selectedNote={state.selectedNote}>
        {state.selectedNote >= 0 && (
          <Note
            noteId={parseInt(state.selectedNote) || -1}
            onSave={onSave}
            onDelete={onDelete}
            onRestore={onRestore}
            onPermanentDelete={onPermanentDelete}
            onTagCreate={onTagCreate}
          />
        )}
      </StyledContent>
    </>
  );
};

export default Notebook;
