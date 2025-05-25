import {
  Divider,
  Stack,
  Text,
  Container,
  Box,
  HStack,
  Heading,
  Center,
  Image,
} from "@chakra-ui/react";
import { FaLinkedin, FaEnvelope } from "react-icons/fa";
import useYamlSection from "./useYamlSection";
export default function Contact({ color }) {


  const profile = useYamlSection('profile');

  if (!profile) {
    return <p>Loading...</p>; // or a spinner
  }

  const linkedin = () => {
    window.open(`${profile.contact.linkedin}`, "_blank", "noreferrer,noopener");
  };
  // const github = () => {
  //   window.open(`${profile.contact.github}`, "_blank", "noreferrer,noopener");
  // };
  const email = () => {
    window.open(`mailto:${profile.contact.email_2}`, "_blank", "noreferrer,noopener");
  };
  return (
    <>
      <Container maxW={"5xl"} id="contact"
        bg="rgba(0, 0, 0, 0.4)" // semi-transparent dark
        backdropFilter="blur(10px)" // frosted glass
        borderRadius="2xl"
        boxShadow="lg">
        <Stack
          as={Box}
          textAlign={"center"}
          spacing={{ base: 8, md: 5 }}
          pb={{ base: 20, md: 5 }}
        >
          <Stack align="center" direction="row" p={4}>
            <HStack mx={4}>
              <Text fontWeight={800} fontSize={"4xl"} color={`${color}.400`}>Contact</Text>
            </HStack>
            <Divider orientation="horizontal" />
          </Stack>
          <Stack spacing={4} as={Container} maxW={"3xl"} textAlign={"center"}>
            <Heading fontSize={"3xl"}>Let's stay in touch!</Heading>
            <Text fontSize={"xl"} px={4}>
              {profile.contact.email_1}
            </Text>
            <Text fontSize={"xl"} px={4}>
              {profile.contact.email_2}
            </Text>
            <Text color={`${color}.500`} fontWeight={600} fontSize={"lg"} px={4}>
              {profile.contact.linkedin}
            </Text>
            
            <Center>
              <HStack pt={4} spacing={10}>
                <FaLinkedin onClick={linkedin} size={28} />
                <FaEnvelope onClick={email} size={28} />
              </HStack>
            </Center>
          </Stack>
        </Stack>
      <Image src={"/assets/ashley.webp"} pb={5} />
      </Container>
    </>
  );
}

