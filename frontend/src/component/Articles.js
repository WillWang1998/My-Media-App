import React, {memo, useEffect, useState} from "react";
import {Card, Divider, Input, List, message, Space} from "antd";
import Article from "./Article";
import SubmitOrEditArticle from "./SubmitOrEditArticle";
import {showBackendMessage, stringArrayEqual} from "../util/Functions";
import EventBus from "../util/EventBus";

const Articles = () => {
    message.config({
        rtl: false,
    });

    const [selectedArticleIds, setSelectedArticleIds] = useState([]);
    const [username, setUsername] = useState("");

    const load = async () => {
        await fetch("https://comp531-rw48-mymedia.herokuapp.com/api/search/article", {
            method: "POST",
        }).then(res => {
            if (res.ok) {
                showBackendMessage();
                return res.json();
            } else {
                throw res.statusText;
            }
        }).then(res => {
            setUsername(res.username);
            setSelectedArticleIds(selectedArticleIds => res.ids);
        }).catch(err => message.error(err, 1));
    }

    useEffect(() => load(), []);
    EventBus.addEventListener("reload_articles", load);
    const onSearch = async (value) => {
        await fetch("https://comp531-rw48-mymedia.herokuapp.com/api/search/article", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                keyWord: value,
            })
        }).then(res => {
            if (res.ok) {
                showBackendMessage();
                return res.json();
            } else {
                throw res.statusText;
            }
        }).then(res => {
            setSelectedArticleIds(selectedArticleIds => res.ids);
        }).catch(err => message.error(err, 1));
    }

    const onSubmitArticle = (id) => {
        setSelectedArticleIds(selectedArticleIds => [id, ...selectedArticleIds]);
    }

    const onDeleteArticle = (id) => {
        setSelectedArticleIds(selectedArticleIds => selectedArticleIds.filter((item) => item !== id));
    }

    const ArticleList = (props) => {
        return (
            <List
                itemLayout="vertical"
                size="large"
                dataSource={props.selectedArticleIds}
                renderItem={item => <Article id={item} username={username} deleteAction={onDeleteArticle}/>}
                pagination={{
                    position: "top",
                    pageSize: 5
                }}
            />
        );
    }

    const areEqualArticleList = (prevProps, nextProps) => {
        return stringArrayEqual(prevProps.selectedArticleIds, nextProps.selectedArticleIds);
    }

    memo(ArticleList, areEqualArticleList);

    return (
        <Space direction="vertical" style={{width: "100%"}}>
            <SubmitOrEditArticle action={onSubmitArticle}/>

            <Card bordered={true}>
                <Input.Search
                    allowClear
                    enterButton="Search"
                    size="large"
                    onSearch={onSearch}
                />
                <Divider orientation="left">Posts</Divider>
                <ArticleList selectedArticleIds={selectedArticleIds}/>
            </Card>
        </Space>
    )
}

export default Articles;
