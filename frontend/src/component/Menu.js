import React from "react";
import {Menu, ConfigProvider, message} from 'antd';
import {
    HomeOutlined,
    UserOutlined,
    LogoutOutlined
} from '@ant-design/icons';
import Cookies from "js-cookie";
import {useHistory, useLocation} from "react-router-dom";
import Sticky from 'react-stickynode';
import EventBus from "../util/EventBus";

const MyMediaMenu = () => {
    const location = useLocation();
    const history = useHistory();
    const curPath = location.pathname.slice(1);

    message.config({
        rtl: false,
    });

    const onSelect = async (info) => {
        if (curPath !== info.key) {
            if (info.key === "logout") {
                await fetch("https://comp531-rw48-mymedia.herokuapp.com/api/logout", {
                    method: "PUT",
                    credentials: "include",
                });
                Cookies.remove("isLoggedIn");
                history.push({
                    pathname: "/landing",
                });
                EventBus.dispatchEvent("clear_all_states");
            } else if (info.key === "profile") {
                history.push({
                    pathname: "/profile",
                });
            } else {
                history.push({
                    pathname: "/home",
                })
            }
        }
    }

    return (
        <Sticky innerZ="1">
            <ConfigProvider direction="rtl">
                <Menu
                    theme="dark"
                    mode="horizontal"
                    onSelect={onSelect}
                    selectedKeys={[curPath]}>
                    <Menu.Item key="logout">
                        <LogoutOutlined/>Log Out
                    </Menu.Item>
                    <Menu.Item key="profile">
                        <UserOutlined/>Profile
                    </Menu.Item>
                    <Menu.Item key="home">
                        <HomeOutlined/>Home
                    </Menu.Item>
                </Menu>
            </ConfigProvider>
        </Sticky>
    )
}

export default MyMediaMenu;
