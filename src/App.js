import './App.css';
import { ChakraProvider, Box } from '@chakra-ui/react';
import theme from './theme';
import Nav from './components/NavBar';
import Header from './components/Hero';
import About from './components/About';
import { VStack } from "@chakra-ui/react";
import FormattedContainer from './components/FormattedContainer';
import Contact from './components/Contact';
import Footer from './components/Footer';
import AstrophysicsBackground from './components/AstrophysicsBackground';


function App() {
  // Available Colours:
  // blue, cyan, gray, green, orange, pink, purple, red, teal, yellow

  // edit this variable to change the color theme
  const color = "pink";

  return (
    <ChakraProvider theme={theme}>
      <Box position="relative" minH="100vh" overflow="hidden" bg="rgba(0, 0, 0, 0.2)">
        {/* Background Layers */}
        <AstrophysicsBackground hasQuasar={true} planetCount={5}/>
        {/* Content */}
        <Box position="relative" zIndex={1}>
          <VStack spacing={10}>
          <Nav color={color} />
          <Header color={color} />
          <About color={color} />
          <FormattedContainer color={color} category='exp' name='Experience'/>
          <FormattedContainer color={color} category='edu' name='Education'/>
          <FormattedContainer color={color} category='volunteer' name='Volunteering'/>
          <Contact color={color} />
          <Footer />
          </VStack>
        </Box>
      </Box>
    </ChakraProvider>
  );
}

export default App;
