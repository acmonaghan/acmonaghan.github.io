import {
  Divider,
  Stack,
  Text,
  Container,
  Box,
  HStack,
  Link,
} from "@chakra-ui/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import useYamlSection from "./useYamlSection";

// Chakra-style Markdown renderer
const markdownComponents = {
  p: (props) => <Text fontSize="xl" pb={4} textAlign="left" {...props} />,
  strong: (props) => <Text as="span" fontWeight="bold" color="pink.400" {...props} />,
  a: ({ href, children }) => (
    <Link href={href} isExternal color="teal.500" fontWeight="semibold">
      {children}
    </Link>
  ),
};

export default function About({ color }) {
  const profile = useYamlSection('profile')

  if (!profile) {
    return <p>Loading...</p>; // or a spinner
  }

  return (
    <Container
      maxW="5xl"
      id="about"
      bg="rgba(0, 0, 0, 0.4)" // semi-transparent dark
      backdropFilter="blur(10px)" // frosted glass
      borderRadius="2xl"
      boxShadow="lg"
      p={6} // optional: padding
    >
      <Stack
        as={Box}
        textAlign="center"
        spacing={{ base: 8, md: 5 }}
        pb={{ base: 20, md: 5 }}
      >
        <Stack align="center" direction="row" px={4}>
          <HStack mx={4}>
            <Text fontWeight={800} color={`${color}.400`} fontSize={"4xl"}>About</Text>
          </HStack>
          <Divider orientation="horizontal" />
        </Stack>

        <Box px={4}>
          <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>
            {profile.about}
          </ReactMarkdown>
        </Box>
      </Stack>
    </Container>
  );
}
