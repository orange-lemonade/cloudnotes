import React, { useState } from "react";
import styled from "styled-components";
import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";

const Container = styled.div`
  min-width: 100vw;
  min-height: 100vh;
  background-color: #0f044c;
`;
//Header-----------------------------
const Header = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  height: 5rem;
  display: flex;
  justify-content: space-between;
`;

const Logo = styled.div`
  height: 100%;
  display: flex;
  color: #eee;
  padding: 2.5rem 2rem;
`;

const LogoIcon = styled.img`
  height: 2rem;
  margin-right: 5px;
`;
const LogoName = styled.h3`
  font-size: 2.25rem;
  font-family: "Roboto Condensed", sans-serif;
`;

const ProfileContainer = styled.div`
  height: 100%;
  padding: 1.5rem 2rem;
`;

const Profile = styled.div`
  height: 3.25rem;
  width: 3.25rem;
  background-color: #eee;
  border-radius: 100%;
  border: 1px white solid;
  transition: 0.15s ease-in-out;
  :hover {
    cursor: pointer;
    border-color: #141e61;
  }
`;

const ProfilePicture = styled.img`
  height: 100%;
  width: 100%;
  overflow: hidden;
  border-radius: 100%;
`;

const ProfilePopup = styled(Popup)`
  /* // use your custom style for ".popup-overlay" */
  /* &-overlay {
    background-color: red;
    color:white;
  } */
  /* // use your custom style for ".popup-content"*/
  &-content {
    padding: 1rem;
    background-color: #eeeeee;
  }
  &-arrow {
    display: none;
  }
`;

const ProfilePopupMenu = styled.ul`
  list-style: none;
  font-family: "Roboto", Arial, Helvetica, sans-serif;
  font-size: 1.15rem;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  letter-spacing: 1px;
`;

const SignOutLink = styled.a`
  text-decoration: none;
  color: #dc3545;
  transition: 0.15s ease-in-out;
  &:hover {
    filter: brightness(85%);
  }
`;
//Header-End-----------------------------
//Main-----------------------------------
const Main = styled.main`
  height: calc(100vh - 5rem);
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr 2fr;
  grid-template-rows: 1fr;
  gap: 0px 0px;
  grid-template-areas: "SideBar Notes Notes";
`;

const SideBar = styled.nav`
  grid-area: SideBar;
`;

const Notes = styled.div`
  grid-area: Notes;
  background-color: blue;
`;
//Main-End-------------------------------
function App() {
  return (
    <Container>
      <Header>
        <Logo>
          <LogoIcon src="CloudNotesLogo.png" />
          <LogoName>CloudNotes</LogoName>
        </Logo>
        <ProfileContainer>
          <ProfilePopup
            trigger={() => (
              <Profile title="Open Menu">
                <ProfilePicture src="profile.png" />
              </Profile>
            )}
            keepTooltipInside
            closeOnDocumentClick
            position="bottom center"
          >
            <ProfilePopupMenu>
              <li>
                <SignOutLink title="Sign Out" href="#">
                  Sign Out
                </SignOutLink>
              </li>
            </ProfilePopupMenu>
          </ProfilePopup>
        </ProfileContainer>
      </Header>
      <Main>
        <SideBar></SideBar>
        <Notes></Notes>
      </Main>
    </Container>
  );
}

export default App;
