import React, {memo, useEffect, useState} from "react";
import {Card, List, Input, Divider, message} from "antd";
import {showBackendMessage, stringArrayEqual} from "../util/Functions";
import EventBus from "../util/EventBus";
import Following from "./Following";
import {CloseCircleOutlined, PlusCircleOutlined} from "@ant-design/icons";

const Followings = () => {

    message.config({
        rtl: false,
    });
    const [followings, setFollowings] = useState([]);
    const [searchUserList, setSearchUserList] = useState([]);
    const [showSearchUserList, setShowSearchUserList] = useState(false);

    const load = async () => {
        await fetch("https://comp531-rw48-mymedia.herokuapp.com/api/following", {
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
            setFollowings(followings => res.followings);
        }).catch(err => message.error(err, 1));
    };

    useEffect(() => load(), []);

    const showSearchResult = async (value) => {
        if (value === "") {
            setShowSearchUserList(false);
            setSearchUserList([]);
        } else {
            setShowSearchUserList(true);
            await fetch("https://comp531-rw48-mymedia.herokuapp.com/api/following/search", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    keyWord: value,
                }),
            }).then(res => {
                if (res.ok) {
                    showBackendMessage();
                    return res.json();
                } else {
                    throw res.statusText;
                }
            }).then(res => {
                setSearchUserList(searchUserList => res.searchResult);
            }).catch(err => message.error(err, 1));
        }
    }

    const addNewFollowing = (value) => async () => {
        await fetch("https://comp531-rw48-mymedia.herokuapp.com/api/following/" + value, {
            method: "PUT",
            credentials: "include",
        }).then(res => {
            if (res.ok) {
                showBackendMessage();
                return res.json();
            } else {
                throw res.statusText;
            }
        }).then(res => {
            message.success("Added a new following user");
            setFollowings(followings => res.followings);
            setSearchUserList(searchUserList => searchUserList.filter(item => item !== value));
            EventBus.dispatchEvent("reload_articles");
        }).catch(err => message.error(err, 1));
    };

    const deleteFollowing = (value) => async () => {
        await fetch("https://comp531-rw48-mymedia.herokuapp.com/api/following/" + value, {
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
            message.success("Delete a followed user");
            setFollowings(followings => followings.filter(item => item !== value));
            EventBus.dispatchEvent("reload_articles");
        }).catch(err => message.error(err, 1));
    };

    const MemoList = (props) => {
        return (
            <List
                dataSource={props.userList}
                renderItem={(item) => <Following
                    username={item}
                    action={props.action}
                    actionSymbol={props.symbol}
                />}
                pagination={{
                    position: "bottom",
                    pageSize: 5
                }}
            />
        )
    }

    const areEqualMemoList = (prevProps, nextProps) => {
        return stringArrayEqual(prevProps.commentIdList, nextProps.commentIdList);
    }

    memo(MemoList, areEqualMemoList);

    return (
        <Card bordered={true}>
            <Divider orientation="left">My followings</Divider>
            <Input.Search
                allowClear
                enterButton="Search"
                size="large"
                onSearch={showSearchResult}
            />
            <div hidden={!showSearchUserList}>
                <Card bordered={true}>
                    <MemoList userList={searchUserList} symbol={<PlusCircleOutlined />} action={addNewFollowing}/>
                </Card>
            </div>
            <MemoList userList={followings} symbol={<CloseCircleOutlined />} action={deleteFollowing}/>
        </Card>
    )
}

export default Followings;
