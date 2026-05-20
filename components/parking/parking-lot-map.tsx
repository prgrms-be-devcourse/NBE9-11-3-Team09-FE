"use client";

import Script from "next/script";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    kakao: any;
  }
}

type ParkingLot = {
  id: number;
  name: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
};

type ParkingLotMapProps = {
  parkingLots: ParkingLot[];
};

export function ParkingLotMap({ parkingLots }: ParkingLotMapProps) {
  const router = useRouter();
  const mapRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!loaded || !mapRef.current || !window.kakao) return;

    window.kakao.maps.load(() => {
      const first = parkingLots.find(
        (lot) => lot.latitude != null && lot.longitude != null
      );

      if (!first) return;

      const center = new window.kakao.maps.LatLng(
        first.latitude,
        first.longitude
      );

      const map = new window.kakao.maps.Map(mapRef.current, {
        center,
        level: 4,
      });

      parkingLots.forEach((lot) => {
        if (lot.latitude == null || lot.longitude == null) return;

        const position = new window.kakao.maps.LatLng(
          lot.latitude,
          lot.longitude
        );

        const marker = new window.kakao.maps.Marker({
          map,
          position,
          title: lot.name,
        });

        window.kakao.maps.event.addListener(marker, "click", () => {
          router.push(`/parking-lots/${lot.id}`);
        });
      });
    });
  }, [loaded, parkingLots, router]);

  return (
    <>
      <Script
        src={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&autoload=false`}
        strategy="afterInteractive"
        onLoad={() => setLoaded(true)}
      />

      <div className="h-[400px] w-full" ref={mapRef} />
    </>
  );
}