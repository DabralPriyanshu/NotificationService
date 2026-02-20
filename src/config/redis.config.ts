import Redis from "ioredis";
import { serverConfig } from ".";

// function to connect with Redis
function connectToRedis() {
  try {
    let connection: any;
    const redisConfig = {
      port: serverConfig.REDIS_PORT,
      host: serverConfig.REDIS_HOST,
      maxRetriesPerRequest: null,
    };
    return () => {
      if (!connection) {
        //implemented singleton design pattern
        connection = new Redis(redisConfig);
        return connection;
      }
      return connection;
    };
  } catch (error) {
    console.log("Error connecting to Redis ", error);
    throw error;
  }
}

export const getRedisConnObject = connectToRedis();
