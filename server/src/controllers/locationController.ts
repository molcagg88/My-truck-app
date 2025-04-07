import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { Location } from '../entities/Location';
import { User } from '../entities/User';
import { WebSocketServer } from '../websocket/server';

/**
 * Update the location of a user
 */
export const updateLocation = async (req: Request, res: Response) => {
  try {
    const { userId, userType, location, timestamp } = req.body;

    if (!userId || !location || !location.latitude || !location.longitude) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userId, location.latitude, location.longitude',
      });
    }

    // Check if user exists
    const userRepository = getRepository(User);
    const user = await userRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Create a new location record
    const locationRepository = getRepository(Location);
    const newLocation = locationRepository.create({
      userId,
      userType: userType || 'user',
      latitude: location.latitude,
      longitude: location.longitude,
      accuracy: location.accuracy,
      heading: location.heading,
      speed: location.speed,
      locationTimestamp: timestamp ? new Date(timestamp) : new Date(),
    });

    await locationRepository.save(newLocation);

    // Broadcast location update to connected clients if WebSocket server is available
    if (WebSocketServer.instance) {
      WebSocketServer.instance.broadcast('location_update', {
        userId,
        userType,
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy,
          heading: location.heading,
          speed: location.speed,
          timestamp: timestamp || new Date().toISOString(),
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Location updated successfully',
    });
  } catch (error) {
    console.error('Error updating location:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update location',
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

/**
 * Get the current location of a user
 */
export const getUserLocation = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'Missing userId parameter',
      });
    }

    // Get the latest location for this user
    const locationRepository = getRepository(Location);
    const location = await locationRepository.findOne({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'No location found for this user',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        userId: location.userId,
        userType: location.userType,
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy,
          heading: location.heading,
          speed: location.speed,
          timestamp: location.locationTimestamp || location.createdAt,
        },
        updatedAt: location.createdAt,
      },
    });
  } catch (error) {
    console.error('Error retrieving user location:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve user location',
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

/**
 * Get nearby users of a specific type within a given radius
 */
export const getNearbyUsers = async (req: Request, res: Response) => {
  try {
    const { latitude, longitude, radius = 5, userType = 'driver' } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: latitude, longitude',
      });
    }

    const lat = parseFloat(latitude as string);
    const lng = parseFloat(longitude as string);
    const radiusKm = parseFloat(radius as string);

    if (isNaN(lat) || isNaN(lng) || isNaN(radiusKm)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid parameters: latitude, longitude, radius must be numbers',
      });
    }

    // Find all latest locations for users of the specified type within the radius
    // This uses the Haversine formula to calculate distances
    const query = `
      WITH latest_locations AS (
        SELECT DISTINCT ON (user_id) *
        FROM locations
        WHERE user_type = $1
        ORDER BY user_id, created_at DESC
      )
      SELECT 
        l.*, 
        u.name, 
        u.phone,
        (
          6371 * acos(
            cos(radians($2)) * 
            cos(radians(latitude)) * 
            cos(radians(longitude) - radians($3)) + 
            sin(radians($2)) * 
            sin(radians(latitude))
          )
        ) AS distance
      FROM latest_locations l
      JOIN users u ON l.user_id = u.id
      WHERE (
        6371 * acos(
          cos(radians($2)) * 
          cos(radians(latitude)) * 
          cos(radians(longitude) - radians($3)) + 
          sin(radians($2)) * 
          sin(radians(latitude))
        )
      ) <= $4
      ORDER BY distance
    `;

    const entityManager = getRepository(Location).manager;
    const nearbyUsers = await entityManager.query(query, [userType, lat, lng, radiusKm]);

    return res.status(200).json({
      success: true,
      data: nearbyUsers.map((user: any) => ({
        userId: user.user_id,
        name: user.name,
        phone: user.phone,
        location: {
          latitude: parseFloat(user.latitude),
          longitude: parseFloat(user.longitude),
          accuracy: user.accuracy ? parseFloat(user.accuracy) : null,
          heading: user.heading ? parseFloat(user.heading) : null,
          speed: user.speed ? parseFloat(user.speed) : null,
        },
        distance: parseFloat(user.distance),
        updatedAt: user.created_at,
      })),
    });
  } catch (error) {
    console.error('Error retrieving nearby users:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve nearby users',
      error: error instanceof Error ? error.message : String(error),
    });
  }
}; 