import "../App.css"
import React, {useEffect} from "react";
import {Col, message, Row, Space} from "antd";
import MyMediaMenu from "./Menu";
import Followings from "./Followings";
import MinProfile from "./MinProfile";
import Articles from "./Articles";
import {showBackendMessage} from "../util/Functions";


const Home = () => {
    message.config({
        rtl: false,
    });

    const style = {padding: '46px 0'};

    useEffect(showBackendMessage, []);

    return (
        <>
            <MyMediaMenu/>
            <Row gutter={{xs: 8, sm: 16, md: 24, lg: 32}} style={style}>
                <Col className="gutter-row" xs={0} sm={0} md={3} lg={3} xl={3}/>
                <Col className="gutter-row" xs={24} sm={24} md={6} lg={6} xl={6}>
                    <Space direction="vertical" style={{width: "100%"}}>
                        <MinProfile/>
                        <Followings/>
                    </Space>
                </Col>
                <Col className="gutter-row" xs={24} sm={24} md={12} lg={12} xl={12}>
                    <Articles/>
                </Col>
                <Col className="gutter-row" xs={0} sm={0} md={3} lg={3} xl={3}/>
            </Row>
        </>
    );
}

export default Home;
