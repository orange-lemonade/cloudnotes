import React from "react";
import { Layout, Button, Tooltip } from 'antd';
import styled from 'styled-components';
import Logo from '../components/logo';
import { LogoutOutlined } from '@ant-design/icons';
import Notebook from '../components/notebook';
import { useAuth0 } from '@auth0/auth0-react';

const { Header } = Layout;

const AppLayout = styled(Layout)`
    height: 100%;
    
    .app-header {
        background-color: #0F044C;
        padding: 0 24px;
        /* border-bottom: 1px solid rgba(255, 255, 255, 0.65); */
    }
    
`;

const ContentLayout = styled(Layout)`
    border-top-left-radius: 10px;
    background-color: #0F044C;


`;
const NavBar = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

function Home() {
    const { 
        isAuthenticated, 
        loginWithRedirect,
        logout 
    } = useAuth0();
    
    return (
        <AppLayout>
            <Header theme="light" className="app-header">
                <NavBar>
                    <Logo ></Logo>
                    {
                        isAuthenticated &&
                        <Tooltip title="Log Out">
                            <Button
                                shape="circle"
                                icon={<LogoutOutlined />}
                                type="primary"
                                onClick={() =>
                                    logout({ returnTo: window.location.origin })
                                }
                                danger />
                        </Tooltip>
                    }
                </NavBar>
            </Header>
            <ContentLayout>
                {
                    !isAuthenticated && <button onClick={() => loginWithRedirect()}>Log In</button>
                }
                {
                    isAuthenticated && <Notebook></Notebook>
                }
            </ContentLayout>
        </AppLayout>
    );
}

export default Home;
