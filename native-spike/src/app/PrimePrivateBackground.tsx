import React from 'react';
import Background from '../experiences/pi/current/profile/PrimeBackground';
export function PrimePrivateBackground({ badge = false }: { badge?: boolean }) { return <Background variant="private" badge={badge} />; }
