import {
  Box,
  Heading,
  Container,
  Text,
  Button,
  Stack,
} from "@chakra-ui/react";
import useYamlSection from "./useYamlSection";

export default function Header({ color }) {
  const profile = useYamlSection('profile');

  if (!profile) {
    return <p>Loading...</p>; // or a spinner
  }

  const scrollToContact = () => {
    const contactSection = document.querySelector("#contact");
    contactSection.scrollIntoView({ behavior: "smooth" });
  };
  const linkedin = () => {
    window.open(
      `${profile.contact.linkedin}`,
      "_blank",
      "noreferrer,noopener"
    );
  };
  return (
    <>
      <Heading>
        <link
          href="https://fonts.googleapis.com/css2?family=Caveat:wght@700&display=swap"
          rel="stylesheet"
        />
      </Heading>

      <Container maxW={"3xl"} id="hero">
        <Stack
          as={Box}
          textAlign={"center"}
          spacing={{ base: 8, md: 14 }}
          pb={{ base: 20, md: 36 }}
          pt={{ base: 36, md: 52 }}
        >
          <Heading
            fontWeight={600}
            fontSize={{ base: "2xl", sm: "4xl", md: "6xl" }}
            lineHeight={"110%"}
          >
            {profile.header.name} <br />
            <Text as={"span"} color={`${color}.400`}>
              {profile.header.role}
            </Text>
          </Heading>
          <Text

            fontSize={{ base: "lg", sm: "xl", md: "2xl" }}
            bg="rgba(0, 0, 0, 0.4)" // semi-transparent dark
            backdropFilter="blur(10px)" // frosted glass
            borderRadius="2xl"
            boxShadow="lg"
            p={6}
          >
            {profile.header.description}
          </Text>
          <Stack
            direction={"column"}
            spacing={3}
            align={"center"}
            alignSelf={"center"}
            position={"relative"}
          >
            <Button
              colorScheme={color}
              bg={`${color}.400`}
              rounded={"full"}
              px={6}
              _hover={{
                bg: `${color}.500`,
              }}
              onClick={linkedin}
            >
              Let's connect!
            </Button>
            <Button
              variant={"link"}
              colorScheme={"blue"}
              size={"sm"}
              onClick={scrollToContact}
            >
              Contact Me
            </Button>
          </Stack>
        </Stack>
      </Container>
    </>
  );
}


