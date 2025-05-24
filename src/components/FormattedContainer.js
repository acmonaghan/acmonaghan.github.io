import {
  Divider,
  Stack,
  Text,
  Container,
  Box,
  HStack,
  Card,
  CardHeader,
  CardBody,
  Flex,
  Badge,
  Image,
  List,
  ListItem,
  ListIcon,
} from "@chakra-ui/react";
import { ChevronRightIcon } from "@chakra-ui/icons";
import { Fade } from "react-reveal";
import ReactMarkdown from "react-markdown";
import useYamlSection from "./useYamlSection";

export default function FormattedContainer({ color, category = "exp", name = "Experience" }) {
  const experience = useYamlSection(category);
  if (!experience) {
    return <p>Loading...</p>;
  }

  return (
    <Container maxW={"5xl"} id="experience"   bg="rgba(0, 0, 0, 0.4)" // semi-transparent dark
  backdropFilter="blur(10px)" // frosted glass
  borderRadius="2xl"
  boxShadow="lg"
  p={6}
  >
      <Stack as={Box} textAlign={"left"} spacing={{ base: 8, md: 5 }} pb={{ base: 20, md: 5 }}>
        <Stack align="center" direction="row" px={4}>
          <HStack mx={4}>
            <Text fontWeight={800} fontSize={"4xl"} color={`${color}.400`}>
              {name}
            </Text>
          </HStack>
          <Divider orientation="horizontal" />
        </Stack>

        <Stack px={4} spacing={4} >
          {experience.map((exp, idx) => (
            <Fade bottom key={exp.company + idx}>
              <Card size="sm"  bg="rgba(0, 0, 0, 0.4)" // semi-transparent dark
  backdropFilter="blur(10px)" // frosted glass
  borderRadius="2xl"
  boxShadow="lg">
                <CardHeader>
                  <Flex justifyContent="space-between" align="left">
                    <HStack>
                      {exp.image && (
                        <Image src={exp.image} h={50} alt={`${exp.company} logo`} />
                      )}
                      <Box px={2} textAlign="left">
                        <Text fontWeight={600}>{exp.company}</Text>
                        <Text color="gray.500">{exp.duration}</Text>
                      </Box>
                    </HStack>
                  </Flex>
                </CardHeader>

                <CardBody>
                  <Stack spacing={6}>
                    {exp.roles.map((role, roleIdx) => (
                      <Box key={roleIdx}>
                        <Box mb={2}>
                          <Text fontWeight={600}>{role.position}</Text>
                          <Text fontSize="sm" color="gray.500">
                            {role.start} – {role.end}
                          </Text>
                        </Box>

                        <List align="left" spacing={3}>
                          {role.listItems?.map((item, index) => (
                            <ListItem key={index}>
                              <ListIcon boxSize={6} as={ChevronRightIcon} color={`${color}.500`} />
                              <ReactMarkdown
                                components={{
                                  p: ({ children }) => <>{children}</>,
                                }}
                              >
                                {item}
                              </ReactMarkdown>
                            </ListItem>
                          ))}
                        </List>

                        {role.badges?.length > 0 && (
                          <HStack spacing={2} mt={3}>
                            {role.badges.map((badge, bIdx) => (
                              <Badge key={bIdx} colorScheme={badge.color || "gray"}>
                                {badge.name}
                              </Badge>
                            ))}
                          </HStack>
                        )}
                      </Box>
                    ))}
                  </Stack>
                </CardBody>
              </Card>
            </Fade>
          ))}
        </Stack>
      </Stack>
    </Container>
  );
}
