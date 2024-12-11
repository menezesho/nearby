import { View, Text, Alert } from "react-native";

import { api } from "@/services/api";
import { useEffect, useState } from "react";
import { Categories, CategoryProps } from "@/components/categories";
import type { PlaceProps } from "@/components/places/components/place";
import { Places } from "@/components/places";
import { colors } from "@/styles/colors";

export default function Home() {
  const [categories, setCategories] = useState<CategoryProps[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CategoryProps | null>(null);
  const [places, setPlaces] = useState<PlaceProps[]>([]);

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

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchPlaces();
  }, [selectedCategory]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.gray[200] }}>
      <Categories
        data={categories}
        onSelect={setSelectedCategory}
        selected={selectedCategory}
      />

      <Places data={places} />
    </View>
  )
}