import React, { useState, useEffect } from "react";
import { View, ImageBackground, Image, StyleSheet, Text } from "react-native";
import { RectButton } from "react-native-gesture-handler";
import { Feather as Icon } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import RNPickerSelect from "react-native-picker-select";
import axios from "axios";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 32,
  },

  main: {
    flex: 1,
    justifyContent: "center",
  },

  title: {
    color: "#322153",
    fontSize: 32,
    fontFamily: "Ubuntu_700Bold",
    maxWidth: 260,
    marginTop: 64,
  },

  description: {
    color: "#6C6C80",
    fontSize: 16,
    marginTop: 16,
    fontFamily: "Roboto_400Regular",
    maxWidth: 260,
    lineHeight: 24,
  },

  footer: {},

  input: {
    height: 60,
    backgroundColor: "#FFF",
    borderRadius: 10,
    marginBottom: 8,
    paddingHorizontal: 24,
    fontSize: 16,
  },

  button: {
    backgroundColor: "#34CB79",
    height: 60,
    flexDirection: "row",
    borderRadius: 10,
    overflow: "hidden",
    alignItems: "center",
    marginTop: 8,
  },

  buttonIcon: {
    height: 60,
    width: 60,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },

  buttonText: {
    flex: 1,
    justifyContent: "center",
    textAlign: "center",
    color: "#FFFFFF",
    fontFamily: "Roboto_500Medium",
    fontSize: 16,
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderRadius: 4,
    backgroundColor: "#FFF",
    color: "black",
    paddingRight: 30, // to ensure the text is never behind the icon
    marginBottom: 10,
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderRadius: 8,
    backgroundColor: "#FFF",
    color: "black",
    paddingRight: 30, // to ensure the text is never behind the icon
    marginBottom: 10,
  },
  iconContainer: {
    top: 5,
    right: 15,
  },
});

interface IBGEStateResponse {
  id: number;
  sigla: string;
}

interface IBGECityResponse {
  id: number;
  nome: string;
}

const Home = () => {
  const logo = require("../../assets/logo.png");
  const bg = require("../../assets/home-background.png");
  const navigation = useNavigation();
  const [states, setStates] = useState<IBGEStateResponse[]>([]);
  const [cities, setCities] = useState<IBGECityResponse[]>([]);
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  function handleNavigationToPoints() {
    navigation.navigate("Points", { state: selectedState, city: selectedCity });
  }

  useEffect(() => {
    axios
      .get<IBGEStateResponse[]>(
        "https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome"
      )
      .then((resp) => {
        setStates(resp.data);
      });
  }, []);

  useEffect(() => {
    if (selectedState === "0") {
      return;
    }

    axios
      .get<IBGECityResponse[]>(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedState}/distritos?orderBy=nome`
      )
      .then((resp) => {
        setCities(resp.data);
      });
  }, [selectedState]);

  return (
    <ImageBackground
      source={bg}
      style={styles.container}
      imageStyle={{ width: 274, height: 368 }}
    >
      <View style={styles.main}>
        <Image source={logo} />
        <View>
          <Text style={styles.title}>
            Seu marketplace de coleta de resíduos
          </Text>
          <Text style={styles.description}>
            Ajudamos pessoas a encontrarem pontos de coleta de forma eficiente.
          </Text>
        </View>
      </View>

      <RNPickerSelect
        onValueChange={(value) => setSelectedState(value)}
        style={pickerSelectStyles}
        useNativeAndroidPickerStyle={false}
        Icon={() => {
          return <Icon name="chevron-down" color="#000" size={24} />;
        }}
        items={states.map((state) => {
          return { label: state.sigla, value: state.sigla };
        })}
      />

      <RNPickerSelect
        onValueChange={(value) => setSelectedCity(value)}
        style={pickerSelectStyles}
        useNativeAndroidPickerStyle={false}
        Icon={() => {
          return <Icon name="chevron-down" color="#000" size={24} />;
        }}
        items={cities.map((city) => {
          return { label: city.nome, value: city.nome };
        })}
      />

      <View style={styles.footer}>
        <RectButton style={styles.button} onPress={handleNavigationToPoints}>
          <View style={styles.buttonIcon}>
            <Text>
              {" "}
              <Icon name="arrow-right" color="#FFF" size={24} />{" "}
            </Text>
          </View>
          <Text style={styles.buttonText}>Entrar</Text>
        </RectButton>
      </View>
    </ImageBackground>
  );
};

export default Home;
