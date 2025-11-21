'use client';

import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { AdSpace } from '@/types';

// Dynamically import the entire map component to avoid SSR issues
const MapComponent = dynamic(
  () => import('./MapComponent'),
  { 
    ssr: false,
    loading: () => (
      <div className="h-[calc(100vh-200px)] bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">Loading map...</p>
      </div>
    )
  }
);

interface MapViewProps {
  adSpaces: AdSpace[];
  onMarkerClick?: (adSpace: AdSpace) => void;
  selectedId?: string;
  selectedAdSpace?: AdSpace | null;
}

export default function MapView({ adSpaces, onMarkerClick, selectedId, selectedAdSpace }: MapViewProps) {
  return (
    <MapComponent
      adSpaces={adSpaces}
      onMarkerClick={onMarkerClick}
      selectedId={selectedId}
      selectedAdSpace={selectedAdSpace}
    />
  );
}
