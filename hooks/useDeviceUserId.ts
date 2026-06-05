import { useEffect, useState } from 'react';
import { getOrCreateDeviceUserId } from '../utils/deviceUser';

export function useDeviceUserId(): string | null {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    getOrCreateDeviceUserId().then(setUserId);
  }, []);

  return userId;
}
