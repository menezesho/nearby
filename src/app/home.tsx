import { useEffect, useState } from "react";
import { View, Alert, Text } from "react-native";
import { router, useFocusEffect } from "expo-router";
import MapView, { LatLng, Callout, Marker } from "react-native-maps";
import * as Location from "expo-location";

import { api } from "@/services/api";
import { colors, fontFamily } from "@/styles/theme";

import { Categories, CategoryProps } from "@/components/categories";
import { PlaceProps } from "@/components/places/components/place";
import { Places } from "@/components/places";

type MarketProps = PlaceProps & LatLng;

export default function Home() {
  const [categories, setCategories] = useState<CategoryProps[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CategoryProps | null>(null);
  const [places, setPlaces] = useState<MarketProps[]>([]);
  const [location, setLocation] = useState<LatLng | null>(null);

  async function fetchCategories() {
    try {
      const { data } = await api.get("/categories");
      setCategories(data);
      setSelectedCategory(data[0]);
    } catch (error) {
      console.error(error);
      Alert.alert("Cartegorias", "Não foi possível carregar as categorias!");
    }
  }

  async function fetchPlaces() {
    try {
      if (!selectedCategory) return;

      const { data } = await api.get(`/markets/category/${selectedCategory?.id}`);
      setPlaces(data);
    } catch (error) {
      console.error(error);
      Alert.alert("Locais", "Não foi possível carregar os locais!");
    }
  }

  async function getCurrentLocation() {
    try {
      const { granted } = await Location.requestForegroundPermissionsAsync();

      if (!granted) {
        Alert.alert("Permissão de localização", "É necessário permitir o acesso à localização!");
        return;
      }


      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
        timeInterval: 10000,
      });

      setLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) {
      console.error(error);
      Alert.alert("Localização", "Não foi possível obter a localização atual!");
    }
  }

  useEffect(() => {
    getCurrentLocation();
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchPlaces();
  }, [selectedCategory]);

  useFocusEffect(() => {
    fetchPlaces();
  });

  return (
    <View style={{ flex: 1, backgroundColor: colors.gray[200] }}>
      <Categories
        data={categories}
        onSelect={setSelectedCategory}
        selected={selectedCategory}
      />

      {!!location && (
        <MapView
          loadingEnabled
          loadingIndicatorColor={colors.green.base}
          loadingBackgroundColor={colors.gray[200]}
          style={{ flex: 1 }}
          initialRegion={{
            ...location,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
          }}
        >
          <Marker
            identifier="current"
            coordinate={location}
            image={require("@/assets/location.png")}
          />

          {places.map((place) => (
            <Marker
              key={place.id}
              identifier={place.id}
              coordinate={{
                latitude: place.latitude,
                longitude: place.longitude,
              }}
              image={require("@/assets/pin.png")}
            >
              <Callout onPress={() => router.navigate({ pathname: '/market/[id]', params: { id: place.id } })}>
                <View>
                  <Text
                    style={{
                      fontSize: 14,
                      color: colors.gray[600],
                      fontFamily: fontFamily.medium,
                    }}
                  >
                    {place.name}
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      color: colors.gray[600],
                      fontFamily: fontFamily.regular,
                    }}
                  >{place.address}</Text>
                </View>
              </Callout>
            </Marker>
          ))}
        </MapView>
      )}

      <Places data={places} />
    </View>
  )
}