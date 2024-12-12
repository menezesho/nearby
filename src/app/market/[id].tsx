import { useEffect, useState } from "react";
import { Alert, Modal, View } from "react-native";
import { Redirect, router, useLocalSearchParams } from "expo-router";

import { api } from "@/services/api";

import { Loading } from "@/components/loading";
import { Cover } from "@/components/market/cover";
import { Details, DetailProps } from "@/components/market/details";
import { Coupon } from "@/components/market/coupon";
import { Button } from "@/components/button";

type RouteProps = {
  id: string;
}

type DataProps = DetailProps & {
  cover: string
}

export default function Market() {
  const params = useLocalSearchParams<RouteProps>();

  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<DataProps>();
  const [coupon, setCoupon] = useState<string | null>(null);
  const [isCameraModalVisible, setIsCameraModalVisible] = useState(false);

  async function fetchPlace() {
    try {
      const { data } = await api.get(`/markets/${params.id}`);
      setData(data);
      setIsLoading(false);
    } catch (error) {
      console.error(error);
      Alert.alert("Local", "Não foi possível carregar o local!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    }
  }

  function handleOpenCamera() {
    try {
      setIsCameraModalVisible(true);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    fetchPlace();
  }, []);

  if (isLoading) return <Loading />

  if (!data) return <Redirect href="/home" />

  return (
    <View style={{ flex: 1 }}>
      <Cover uri={data?.cover} />
      <Details data={data} />
      {coupon && <Coupon code={coupon} />}

      <View style={{ padding: 32 }}>
        <Button onPress={handleOpenCamera}>
          <Button.Title>Ler QR Code</Button.Title>
        </Button>
      </View>

      <Modal
        style={{ flex: 1 }}
        visible={isCameraModalVisible}
      >
        <View style={{ flex: 1, justifyContent: "center" }}>
          <Button onPress={() => setIsCameraModalVisible(false)}>
            <Button.Title>Voltar</Button.Title>
          </Button>
        </View>
      </Modal>
    </View>
  )
}