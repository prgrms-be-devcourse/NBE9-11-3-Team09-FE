"use client";

import Script from "next/script";
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
  const mapRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!loaded || !mapRef.current || !window.kakao) return;

    window.kakao.maps.load(() => {
      const validLots = parkingLots.filter(
        (lot) => lot.latitude != null && lot.longitude != null
      );

      if (validLots.length === 0) return;

      const first = validLots[0];

      const center = new window.kakao.maps.LatLng(
        first.latitude,
        first.longitude
      );

      const map = new window.kakao.maps.Map(mapRef.current, {
        center,
        level: 5,
      });

      const bounds = new window.kakao.maps.LatLngBounds();

      validLots.forEach((lot) => {
        const position = new window.kakao.maps.LatLng(
          lot.latitude,
          lot.longitude
        );

        bounds.extend(position);

        new window.kakao.maps.Marker({
          map,
          position,
          title: lot.name,
        });
      });

      if (validLots.length > 1) {
        map.setBounds(bounds);
      }

      setTimeout(() => {
        map.relayout();

        if (validLots.length > 1) {
          map.setBounds(bounds);
        } else {
          map.setCenter(center);
        }
      }, 100);
    });
  }, [loaded, parkingLots]);

  return (
    <>
      <Script
        src={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&autoload=false`}
        strategy="afterInteractive"
        onLoad={() => setLoaded(true)}
      />

      <div
        ref={mapRef}
        className="kakao-map h-[420px] w-full overflow-hidden rounded-[20px]"
      />
    </>
  );
}