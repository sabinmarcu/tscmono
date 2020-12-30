import Background from "../components/background"
import { InternalLink, Main, Reset, Subtitle, Text, Title } from "../components/Primitives"
// markup
const NotFoundPage = () => {
  return (
    <Main>
      <Reset />
      <Background edge />
      <Title>
        TSC Mono
        <Subtitle>Coming Soon!</Subtitle>
      </Title>
      <Text>This page does not exist yet. Please <InternalLink to="/">go home</InternalLink> for more info</Text>
    </Main>
  )
}

export default NotFoundPage
