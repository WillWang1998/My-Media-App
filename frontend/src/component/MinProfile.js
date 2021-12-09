import React, {useEffect, useState} from "react";
import {Avatar, Card, Input, Button, Space, Divider, message} from "antd";
import {CheckOutlined, EditOutlined} from "@ant-design/icons";
import {showBackendMessage} from "../util/Functions";
import EventBus from "../util/EventBus";

const MinProfile = () => {
    message.config({
        rtl: false,
    });
    const [editing, setEditing] = useState(false);
    const [headline, setHeadline] = useState("");
    const [avatar, setAvatar] = useState("");
    const [displayedName, setDisplayedName] = useState("");

    const load = async () => {
        await fetch("https://comp531-rw48-mymedia.herokuapp.com/api/profile", {
            method: "GET",
        }).then(res => {
            if (res.ok) {
                showBackendMessage();
                return res.json();
            } else {
                throw res.statusText;
            }
        }).then(res => {
            setHeadline(res.headline);
            setAvatar(res.avatar);
            setDisplayedName(res.displayedName);
        }).catch(err => message.error(err, 1));
    };

    useEffect(() => load(), []);

    const onClick = async (values) => {
        if (editing) {
            setEditing(false);
            await fetch("https://comp531-rw48-mymedia.herokuapp.com/api/headline", {
                method: "PUT",
                
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    headline: headline,
                }),
            }).then(res => {
                if (res.ok) {
                    showBackendMessage();
                    return res.json();
                } else {
                    throw res.statusText;
                }
            }).then(() => EventBus.dispatchEvent("reload_profile"))
                .catch(err => message.error(err, 1));
        } else {
            setEditing(true);
        }
    }

    return (
        <Card bordered={true}>
            <Divider orientation="left">Me</Divider>
            <Card.Meta
                avatar={<Avatar src={avatar}/>}
                title={displayedName}
                description={
                    <Space size={0}>
                        <Button type="text" onClick={onClick}> {
                            editing ? <CheckOutlined/> : <EditOutlined/>
                        }
                        </Button> {
                            editing ? <Input value={headline} onChange={(e) => {
                                setHeadline(e.target.value);
                            }}/> :
                            <span>{headline}</span>}
                    </Space>
                }
            />
        </Card>
    )
}

export default MinProfile;
