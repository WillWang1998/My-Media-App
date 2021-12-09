import React, {memo, useEffect, useRef, useState} from "react";
import {Card, Input, List, message} from "antd";
import Comment from "./Comment";
import {showBackendMessage, stringArrayEqual} from "../util/Functions";


// TODO: Comments sort
const Comments = (props) => {
    message.config({
        rtl: false,
    });

    const commentRef = useRef();
    const [commentIdList, setCommentIdList] = useState(props.commentIdList);

    useEffect(() => {
        setCommentIdList(commentIdList => props.commentIdList.reverse());
    }, [props]);

    const addNewComment = async (value) => {
        if (!value) {
            message.error("Please input your comment!", 1);
            return;
        }
        await fetch("https://comp531-rw48-mymedia.herokuapp.com/api/comment", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                articleID: props.articleId,
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
            setCommentIdList(commentIdList => res.comments.reverse());
            commentRef.current.setValue("");
            message.success("Comment Successfully!", 1);
        }).catch(err => message.error(err, 1));
    }

    const onDeleteComment = (id) => {
        setCommentIdList(commentIdList => commentIdList.filter((item) => {
            return item !== id;
        }));
    }


    const MemoList = (_props) => {
        return (
            <List
                header={`${_props.commentIdList ? _props.commentIdList.length : 0} replies`}
                itemLayout="horizontal"
                dataSource={_props.commentIdList}
                renderItem={item => <Comment articleId={props.articleId}
                                             id={item}
                                             deleteAction={onDeleteComment}/>}
            />
        )
    }

    const areEqualMemoList = (prevProps, nextProps) => {
        return stringArrayEqual(prevProps.commentIdList, nextProps.commentIdList);
    }

    memo(MemoList, areEqualMemoList);

    return (
        <Card>
            <MemoList commentIdList={commentIdList}/>
            <Input.Search
                allowClear
                onSearch={addNewComment}
                ref={commentRef}
                enterButton="Comment"/>
        </Card>
    )
}

// const areEqualComments = (prevProps, nextProps) => {
//     return stringArrayEqual(prevProps.commentIdList, nextProps.commentIdList);
// }
//
// export default memo(Comments, areEqualComments);

export default Comments;
