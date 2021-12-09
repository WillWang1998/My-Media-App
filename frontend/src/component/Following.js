import React, {useEffect, useState} from "react";
import {Avatar, Button, List, message} from "antd";
import {showBackendMessage} from "../util/Functions";


const Following = (props) => {

    message.config({
        rtl: false,
    });

    const [username, setUsername] = useState(props.username);
    const [avatar, setAvatar] = useState("");
    const [displayedName, setDisplayedName] = useState("");
    const [headline, setHeadline] = useState("");

    const load = async () => {
        if (!username) return;
        await fetch("https://comp531-rw48-mymedia.herokuapp.com/api/profile/" + username, {
            method: "GET",
        }).then(res => {
            if (res.ok) {
                showBackendMessage();
                return res.json();
            } else {
                throw res.statusText;
            }
        }).then(res => {
            setAvatar(res.avatar);
            setDisplayedName(res.displayedName);
            setHeadline(res.headline);
        }).catch(err => message.error(err, 1));
    };

    useEffect(() => load(), []);

    const onClick = async () => {
        props.action(username)();
    }

    return (
        <List.Item actions={[
            <Button type="text" onClick={onClick}>
                {props.actionSymbol}
            </Button>,
        ]}>
            <List.Item.Meta
                avatar={<Avatar src={avatar}/>}
                title={displayedName}
                description={headline}
            />
        </List.Item>
    )
};

export default Following;
