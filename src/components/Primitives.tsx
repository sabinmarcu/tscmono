import styled from '@emotion/styled';
import { Link as GatsbyLink } from "gatsby"
import { Global, css } from '@emotion/react'

const globalStyles = css`
  html, body, #___gatsby, #gatsby-focus-wrapper {
    width: 100vw;
    height: 100vh;
    font-family: sans-serif;
    margin: 0;
    padding: 0;
    font-size: max(1vmin, 10px);
  }
  * {
    box-sizing: border-box;
  }
`;

export const Main = styled.main`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-flow: column nowrap;
  width: 100vw;
  height: 100vh;
`;

export const Title = styled.h1`
  font-size: 6rem;
  background: radial-gradient(white, transparent);
  padding: 6vmin;
  text-align: center;
`;

export const Subtitle = styled.h2`
  font-size: 1.5rem;
  background: radial-gradient(white, transparent);
  padding: 0 25px;
`;

export const Text = styled(Subtitle)`
  opacity: 0.8;
  font-weight: lighter;
`;

export const Link = styled.a`
  color: #03a9f4;
`;

export const Reset = () => (
  <Global styles={globalStyles} />
)

export const InternalLink = styled(GatsbyLink)`
  color: #03a9f4;
`;
