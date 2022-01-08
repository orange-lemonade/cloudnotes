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
        background-color: #080c11;
        padding: 0 24px;
    }
`;

const ContentLayout = styled(Layout)`
    border-top-left-radius: ${(props) => (props.showBorder ? "10px" : "none")};
    background: linear-gradient(180deg, rgba(8,12,17,1) 0%, rgba(20,30,44,1) 41%, rgba(67,92,126,1) 100%);
`;

const NavBar = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const LoginContainer = styled.div` 
    margin: auto;
    margin-top: 5em;
    color: #b0b0b0;
    display: flex;
    flex-flow: column;
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
            <ContentLayout showBorder={isAuthenticated}>
                {
                    !isAuthenticated && 
                        <LoginContainer>
                            <p>Log in to begin using CloudNotes</p>
                            <br></br>
                            <Button 
                                type="primary"
                                onClick={() => loginWithRedirect()}
                            >Log In</Button>
                        </LoginContainer>
                }
                {
                    isAuthenticated && <Notebook></Notebook>
                }
            </ContentLayout>
        </AppLayout>
    );
}

export default Home;
