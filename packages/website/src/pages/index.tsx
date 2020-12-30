import Background from "../components/Background"
import { Link, Main, Reset, Subtitle, Text, Title } from "../components/Primitives";
import { docs, github, npm } from "../config/links";

const IndexPage = () => {
  return (
    <Main>
      <Reset />
      <Background edge />
      <Title>
        TSC Mono
        <Subtitle>Coming Soon!</Subtitle>
      </Title>
      <Text>
        In the mean-time, check out the <Link href={docs.stable}>Stable</Link> and <Link href={docs.nightly}>Nightly</Link> channel documentations.
      </Text>
      <Text>
        Or get involved with the project on <Link href={github}>Github</Link>
      </Text>
      <Text>
        Or even start checking things out. The packages are all on <Link href={npm}>NPM</Link>
      </Text>
    </Main>
  )
}

export default IndexPage
