import {
  Box,
  Container,
  Stack,
  Text,
  useColorModeValue,
  Link
} from "@chakra-ui/react";

export default function Footer() {
  return (
    <Box
      bg={useColorModeValue("gray.50", "gray.900")}
      color={useColorModeValue("gray.700", "gray.200")}
    >
      <Container
        as={Stack}
        maxW={"6xl"}
        py={4}
        align="center"
      >
        <Text>
          © 2025 Ashley Monaghan. All rights reserved. Based on{" "}
          <Link href="https://github.com/eldoraboo/portable-portfolio" isExternal color="blue.400">
            eldoraboo's portable portfolio
          </Link>
          . Designed by{" "}
          <Link href="https://www.saikumarmk.com/" isExternal color="blue.400">
            Sai
          </Link>
          .
        </Text>
      </Container>
    </Box>
  );
}
