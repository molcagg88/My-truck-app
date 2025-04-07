import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '../_layout';
import { ADDIS_ABABA_CENTER } from '../utils/mockMapData';

// Generate a random identifier for the mock map ID
const MOCK_MAP_ID = Math.random().toString(36).substring(2);

// Interface to match react-native-maps MapView props
interface MapViewProps {
  style?: any;
  region?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  initialRegion?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  showsUserLocation?: boolean;
  followsUserLocation?: boolean;
  onRegionChange?: (region: any) => void;
  ref?: any;
  children?: React.ReactNode;
}

// Marker props interface
interface MarkerProps {
  coordinate: {
    latitude: number;
    longitude: number;
  };
  title?: string;
  description?: string;
  children?: React.ReactNode;
}

// Polyline props interface
interface PolylineProps {
  coordinates: Array<{
    latitude: number;
    longitude: number;
  }>;
  strokeWidth?: number;
  strokeColor?: string;
}

// Calculates the pixel position based on lat/lng and current view region
function coordToPixel(
  coordinate: { latitude: number; longitude: number },
  region: { latitude: number; longitude: number; latitudeDelta: number; longitudeDelta: number },
  dimensions: { width: number; height: number }
) {
  const { latitude, longitude } = coordinate;
  const { latitude: regionLat, longitude: regionLng, latitudeDelta, longitudeDelta } = region;
  const { width, height } = dimensions;

  const longitudeRatio = width / longitudeDelta;
  const latitudeRatio = height / latitudeDelta;

  const x = (longitude - (regionLng - longitudeDelta / 2)) * longitudeRatio;
  const y = (regionLat + latitudeDelta / 2 - latitude) * latitudeRatio;

  return { x, y };
}

// Road patterns for the mock map
const ROAD_PATTERNS = [
  [0.2, 0.5, 0.8, 0.3, 0.7, 0.4],  // East-West
  [0.3, 0.1, 0.6, 0.9, 0.4, 0.7],  // North-South
  [0.1, 0.3, 0.9, 0.7, 0.5, 0.6],  // Diagonal 1
  [0.8, 0.1, 0.2, 0.9, 0.6, 0.4],  // Diagonal 2
];

// Mock MapView component
export const MapView: React.FC<MapViewProps> = ({
  style,
  region: propRegion,
  initialRegion,
  showsUserLocation,
  followsUserLocation,
  onRegionChange,
  children,
  ...props
}) => {
  const { isDarkMode } = useTheme();
  const [dimensions, setDimensions] = useState({
    width: Dimensions.get('window').width,
    height: 300,
  });
  const panAnim = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const [region, setRegion] = useState(
    propRegion || initialRegion || {
      latitude: ADDIS_ABABA_CENTER.latitude,
      longitude: ADDIS_ABABA_CENTER.longitude,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    }
  );
  const mapRef = useRef(null);

  // Update the region when props change
  useEffect(() => {
    if (propRegion) {
      setRegion(propRegion);
    }
  }, [propRegion]);

  // Handle layout changes
  const onLayout = (event: any) => {
    const { width, height } = event.nativeEvent.layout;
    setDimensions({ width, height });
  };

  // Generate a tiled background pattern
  const renderMapTiles = () => {
    const tileSize = 40;
    const tilesX = Math.ceil(dimensions.width / tileSize);
    const tilesY = Math.ceil(dimensions.height / tileSize);
    const tiles = [];

    // Generate a deterministic pattern based on the region
    const seed = `${Math.floor(region.latitude * 100)}-${Math.floor(region.longitude * 100)}`;
    const seededRandom = (i: number, j: number) => {
      const val = Math.sin(i * 12.9898 + j * 78.233 + parseInt(seed, 36) % 100) * 43758.5453;
      return val - Math.floor(val);
    };

    for (let i = 0; i < tilesY; i++) {
      for (let j = 0; j < tilesX; j++) {
        const random = seededRandom(i, j);
        const color = isDarkMode 
          ? `rgba(${30 + random * 20}, ${30 + random * 20}, ${30 + random * 20}, 1)`
          : `rgba(${220 + random * 35}, ${220 + random * 35}, ${220 + random * 35}, 1)`;
        
        tiles.push(
          <View
            key={`tile-${i}-${j}`}
            style={{
              position: 'absolute',
              left: j * tileSize,
              top: i * tileSize,
              width: tileSize,
              height: tileSize,
              backgroundColor: color,
              borderWidth: isDarkMode ? 0.5 : 0.3,
              borderColor: isDarkMode ? 'rgba(50, 50, 50, 0.2)' : 'rgba(200, 200, 200, 0.5)',
            }}
          />
        );
      }
    }
    return tiles;
  };

  // Generate mock roads
  const renderRoads = () => {
    const roads = [];
    const { width, height } = dimensions;
    
    // Create some "roads" in a pattern that mimics real maps
    for (let pattern of ROAD_PATTERNS) {
      const color = isDarkMode 
        ? 'rgba(80, 80, 90, 0.8)' 
        : 'rgba(255, 255, 255, 0.9)';
      
      const roadWidth = 3 + Math.random() * 5;
      const points = [];
      
      for (let i = 0; i < pattern.length; i += 2) {
        if (i + 1 < pattern.length) {
          points.push({
            x: pattern[i] * width,
            y: pattern[i + 1] * height
          });
        }
      }
      
      // Create road segments
      for (let i = 0; i < points.length - 1; i++) {
        const startX = points[i].x;
        const startY = points[i].y;
        const endX = points[i + 1].x;
        const endY = points[i + 1].y;
        
        // Calculate angle for rotation
        const angle = Math.atan2(endY - startY, endX - startX) * 180 / Math.PI;
        const length = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
        
        roads.push(
          <View
            key={`road-${pattern[0]}-${i}`}
            style={{
              position: 'absolute',
              left: startX,
              top: startY,
              width: length,
              height: roadWidth,
              backgroundColor: color,
              transform: [
                { translateX: -roadWidth / 2 },
                { translateY: -roadWidth / 2 },
                { rotate: `${angle}deg` },
                { translateX: roadWidth / 2 },
                { translateY: roadWidth / 2 },
                { translateX: -roadWidth / 2 },
                { translateY: -roadWidth / 2 },
              ],
            }}
          />
        );
      }
    }
    
    return roads;
  };

  return (
    <View
      style={[styles.container, style]}
      onLayout={onLayout}
      ref={mapRef}
      {...props}
    >
      {/* Map background */}
      <View style={[
        styles.mapBackground,
        { backgroundColor: isDarkMode ? '#1a1a25' : '#f0f4f8' }
      ]}>
        {/* Map tiles */}
        {renderMapTiles()}
        
        {/* Roads */}
        {renderRoads()}
        
        {/* Map attribution */}
        <View style={styles.attribution}>
          <Text style={[
            styles.attributionText, 
            { color: isDarkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }
          ]}>
            Mock Maps ©{new Date().getFullYear()} | ID: {MOCK_MAP_ID}
          </Text>
        </View>
        
        {/* Children (markers, overlays, etc.) */}
        {children}
      </View>
    </View>
  );
};

// Mock Marker component
export const Marker: React.FC<MarkerProps> = ({ coordinate, title, description, children }) => {
  const { isDarkMode } = useTheme();
  
  return (
    <View style={styles.markerContainer}>
      {children || (
        <View style={[
          styles.defaultMarker,
          { backgroundColor: isDarkMode ? '#3b82f6' : '#ef4444' }
        ]}>
          <View style={[
            styles.markerPointer,
            { borderTopColor: isDarkMode ? '#3b82f6' : '#ef4444' }
          ]} />
        </View>
      )}
      
      {title && (
        <View style={[
          styles.markerTitle,
          { backgroundColor: isDarkMode ? 'rgba(30,30,30,0.8)' : 'rgba(255,255,255,0.9)' }
        ]}>
          <Text style={{ 
            color: isDarkMode ? 'white' : 'black',
            fontSize: 10
          }}>
            {title}
          </Text>
        </View>
      )}
    </View>
  );
};

// Mock Polyline component
export const Polyline: React.FC<PolylineProps> = ({ 
  coordinates, 
  strokeWidth = 3, 
  strokeColor = '#1a73e8'
}) => {
  return (
    <View style={styles.polylineContainer}>
      {coordinates.map((coord, index) => {
        if (index === coordinates.length - 1) return null;
        
        const nextCoord = coordinates[index + 1];
        const startX = coord.latitude;
        const startY = coord.longitude;
        const endX = nextCoord.latitude;
        const endY = nextCoord.longitude;
        
        // For simplicity, we're just showing a straight line
        return (
          <View
            key={`polyline-${index}`}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              right: 0,
              height: strokeWidth,
              backgroundColor: strokeColor,
            }}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  mapBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  markerContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  defaultMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerPointer: {
    position: 'absolute',
    bottom: -8,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderStyle: 'solid',
    backgroundColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#ef4444',
  },
  markerTitle: {
    position: 'absolute',
    top: -25,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  polylineContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  attribution: {
    position: 'absolute',
    bottom: 3,
    right: 3,
    backgroundColor: 'rgba(255,255,255,0.7)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 2,
  },
  attributionText: {
    fontSize: 8,
    opacity: 0.7,
  },
}); 