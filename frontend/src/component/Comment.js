import React, {useEffect, useState} from "react";
import {Button, Input, Comment as AntdComment, message} from "antd";
import {DeleteOutlined, EditOutlined} from "@ant-design/icons";
import {showBackendMessage} from "../util/Functions";

const Comment = (props) => {
    message.config({
        rtl: false,
    });

    const [hideEditor, setHideEditor] = useState(true);
    const [id, setId] = useState(props.id);
    const [username, setUsername] = useState("");
    const [author, setAuthor] = useState("");
    const [authorDisplayedName, setAuthorDisplayedName] = useState("");
    const [avatar, setAvatar] = useState("");
    const [text, setText] = useState("");
    const [timeStamp, setTimeStamp] = useState(0);

    const load = async () => {
        await fetch("https://comp531-rw48-mymedia.herokuapp.com/api/comment/" + id, {
            method: "GET",
            credentials: "include"
        }).then(res => {
            if (res.ok) {
                showBackendMessage();
                return res.json();
            } else {
                throw res.statusText;
            }
        }).then(async res => {
            setAuthor(res.author);
            setUsername(res.username);
            setText(res.text);
            setTimeStamp(res.timestamp);
            await fetch("https://comp531-rw48-mymedia.herokuapp.com/api/profile/" + res.author, {
                method: "GET",
                
            }).then(res => {
                if (res.ok) {
                    showBackendMessage();
                    return res.json();
                } else {
                    throw res.statusText;
                }
            }).then(res => {
                setAuthorDisplayedName(res.displayedName);
                setAvatar(res.avatar);
            }).catch(err => message.error(err, 1));
        }).catch(err => message.error(err, 1));
    }

    const onDelete = async () => {
        await fetch("https://comp531-rw48-mymedia.herokuapp.com/api/comment/" + id, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                articleId: props.articleId,
            })
        }).then(res => {
            if (res.ok) {
                showBackendMessage();
                return res.json();
            } else {
                throw res.statusText;
            }
        }).then(() => {
            props.deleteAction(props.id);
            message.success("Delete successfully!");
        }).catch(err => message.error(err, 1));
    };

    const onSubmit = async (value) => {
        if (!value) {
            message.error("Please input your comment!", 1);
            return;
        }
        await fetch("https://comp531-rw48-mymedia.herokuapp.com/api/comment/" + id, {
            method: "PUT",
            
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                text: value,
            }),
        }).then(res => {
            if (res.ok) {
                showBackendMessage();
                return res.json();
            } else {
                throw res.statusText;
            }
        }).then(res => {
            setText(res.text);
            message.success("Update successfully!");
        }).catch(err => message.error(err, 1));
    }

    useEffect(() => load(), []);

    return (
        <li>
        <AntdComment
            author={authorDisplayedName}
            avatar={avatar}
            content={text}
            actions={
                username === author ? [
                    <Button type="link" onClick={() => setHideEditor(!hideEditor)}>
                        <EditOutlined/>Edit
                    </Button>,
                    <Button type="link" onClick={async () => {
                        setHideEditor(true)
                        await onDelete();
                    }}>
                        <DeleteOutlined/>Delete
                    </Button>
                ] : []
            }
            datetime={(new Date(timeStamp)).toLocaleString()}
        />
        <div hidden={hideEditor}>
            <Input.Search
                allowClear
                onSearch={onSubmit}
                defaultValue={text}
                enterButton="Comment"
            />
        </div>
        </li>
    )
};

export default Comment;
