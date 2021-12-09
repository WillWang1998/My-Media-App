import React, {useEffect, useState} from "react";
import {Avatar, Button, Card, List, message} from "antd";
import {DeleteOutlined, EditOutlined, MessageOutlined} from "@ant-design/icons";
import SubmitOrEditArticle from "./SubmitOrEditArticle";
import Comments from "./Comments";
import {showBackendMessage} from "../util/Functions";
import Images from "./Images";


const Article = (props) => {
    message.config({
        rtl: false,
    });

    const [id, setId] = useState(props.id);
    const [author, setAuthor] = useState("");
    const [authorDisplayedName, setAuthorDisplayedName] = useState("");
    const [avatar, setAvatar] = useState("");
    const [hideComments, setHideComments] = useState(true);
    const [hideEditor, setHideEditor] = useState(true);
    const [title, setTitle] = useState("");
    const [text, setText] = useState("");
    const [timestamp, setTimeStamp] = useState("");
    const [imageUrlList, setImageUrlList] = useState([]);
    const [commentIdList, setCommentIdList] = useState([]);

    useEffect(() => {
        const load = async () => {
            await fetch("https://comp531-rw48-mymedia.herokuapp.com/api/article/" + id, {
                method: "GET",
                credentials: "include",
            }).then(res => {
                if (res.ok) {
                    showBackendMessage();
                    return res.json();
                } else {
                    throw res.statusText;
                }
            }).then(async res => {
                setAuthor(res.author);
                setTitle(res.title);
                setText(res.text);
                setTimeStamp(new Date(res.timestamp).toLocaleString());
                setImageUrlList(imageUrlList => res.imageUrlList);
                setCommentIdList(commentIdList => res.commentIdList);
                await fetch("https://comp531-rw48-mymedia.herokuapp.com/api/profile/" + res.author, {
                    method: "GET",
                    credentials: "include",
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
                });
            }).catch(err => message.error(err, 1));
        };
        load();
    }, [props.id]);

    const onDelete = async () => {
        await fetch("https://comp531-rw48-mymedia.herokuapp.com/api/article/" + id, {
            method: "DELETE",
            credentials: "include",
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

    const onEditArticle = (values) => {
        setTitle(values.title);
        setText(values.text);
        setTimeStamp(values.timestamp);
        setImageUrlList(imageUrlList => values.images);
        setHideEditor(true);
    };

    return (
        <div>
            <List.Item
                key={props.title}
                actions={
                    props.username === author ? [
                        <Button type="link" onClick={() => setHideComments(!hideComments)}>
                            <MessageOutlined/>Comment
                        </Button>,
                        <Button type="link" onClick={() => setHideEditor(!hideEditor)}>
                            <EditOutlined/>Edit
                        </Button>,
                        <Button type="link" onClick={async () => {
                            setHideComments(true);
                            setHideEditor(true);
                            await onDelete();
                        }}>
                            <DeleteOutlined />Delete
                        </Button>,
                    ] : [
                        <Button type="link" onClick={() => setHideComments(!hideComments)}>
                            <MessageOutlined/>Comment
                        </Button>,
                    ]
                }
                extra={
                    imageUrlList && imageUrlList.length !== 0 ?
                    <Images images={imageUrlList}/> :
                    <></>
                }
            >
                <List.Item.Meta
                    avatar={<Avatar src={avatar}/>}
                    title={title}
                    description={
                        <div>
                            <span>
                                {authorDisplayedName},
                            </span>
                            <span>
                                {(new Date(timestamp)).toLocaleString()}
                            </span>
                        </div>
                    }/>
                {text}
            </List.Item>
            <div hidden={hideEditor}>
                <Card border="true">
                    <SubmitOrEditArticle
                        action={onEditArticle}
                        id={props.id}
                        title={title}
                        text={text}
                        imageUrlsList={imageUrlList}
                    />
                </Card>
            </div>
            <div hidden={hideComments}>
                <Card border="true">
                    <Comments commentIdList={commentIdList} articleId={id}/>
                </Card>
            </div>
        </div>
    );
}

export default Article;