import { useEffect, useState, useRef } from "react";
import { Alert, Modal, ScrollView, StatusBar, View } from "react-native";
import { Redirect, router, useLocalSearchParams } from "expo-router";
import { useCameraPermissions, CameraView } from "expo-camera";

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
  const [isGettingCoupon, setIsGettingCoupon] = useState(false);
  const [isCameraModalVisible, setIsCameraModalVisible] = useState(false);

  const [_, requestPermission] = useCameraPermissions();

  const qrLock = useRef(false);
  console.log(params.id);

  async function fetchMarket() {
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

  async function handleOpenCamera() {
    try {
      const { granted } = await requestPermission();

      if (!granted) {
        return Alert.alert("Câmera", "É preciso habilitar o uso da câmera!")
      }

      setIsCameraModalVisible(true);
      qrLock.current = false;
    } catch (error) {
      console.error(error);
      Alert.alert("Câmera", "Não foi possível utilizar a câmera!");
    }
  }

  async function handleUseCoupon(id: string) {
    setIsCameraModalVisible(false);
    Alert.alert("Cupom", "Não é possível reutilizar um cupom resgatado! Deseja resgatar este cupom?", [
      { text: "Não", style: "cancel" },
      { text: "Sim", onPress: async () => await getCoupon(id) },
    ]);
  }

  async function getCoupon(id: string) {
    try {
      setIsGettingCoupon(true);

      console.log(id);
      const { data } = await api.patch(`/coupons/${id}`);
      setCoupon(data.coupon);

      Alert.alert("Cupom", `Cupom resgatado: ${data.coupon}`);
    } catch (error) {
      console.error(error);
      Alert.alert("Cupom", "Não foi possível utilizar o cupom!");
    }
    finally {
      setIsGettingCoupon(false);
    }
  }

  useEffect(() => {
    fetchMarket();
  }, [params.id, coupon]);

  if (isLoading) return <Loading />

  if (!data) return <Redirect href="/home" />

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" hidden={isCameraModalVisible} />

      <ScrollView showsVerticalScrollIndicator={false}>
        <Cover uri={data?.cover} />

        <Details data={data} />

        {coupon && <Coupon code={coupon} />}

        <View style={{ padding: 32 }}>
          <Button onPress={handleOpenCamera}>
            <Button.Title>Ler QR Code</Button.Title>
          </Button>
        </View>
      </ScrollView>

      <Modal
        style={{ flex: 1 }}
        visible={isCameraModalVisible}
      >
        <CameraView
          style={{ flex: 1 }}
          facing="back"
          onBarcodeScanned={({ data }) => {
            if (data && !qrLock.current) {
              qrLock.current = true;
              setTimeout(() => handleUseCoupon(data), 500);
            }
          }}
        />

        <View style={{
          position: "absolute",
          bottom: 32,
          left: 32,
          right: 32,
        }}>
          <Button
            onPress={() => setIsCameraModalVisible(false)}
            isLoading={isGettingCoupon}
          >
            <Button.Title>Voltar</Button.Title>
          </Button>
        </View>
      </Modal>
    </View>
  )
}