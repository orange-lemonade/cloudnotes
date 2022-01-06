import React from 'react';
import styled from 'styled-components';
import logo from '../assets/CloudNotesLogo.png';
import { Image, Typography } from 'antd';

const { Text } = Typography;

const Wrapper = styled.div`
    display: flex;
    align-items: center;

    .logo-img {
        height: 1.5em;
    }
`;

const Title = styled(Text)`
    color: rgba(255, 255, 255, 0.85);
    margin-left: 0.25em;
    font-size: 1.5em;
`;

const Logo = () => {
    return (
        <Wrapper>
            <Image
                className="logo-img"
                src={logo}
                preview={false}
            />
            <Title>
                CloudNotes
            </Title>
        </Wrapper>
    );
}

export default Logo;
