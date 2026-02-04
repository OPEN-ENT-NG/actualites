import { IUserInfo } from '@edifice.io/client';
import { useScreeb } from '@screeb/sdk-react';
import { useEffect, useRef } from 'react';

export default function useScreebIdentity(user: IUserInfo | undefined) {
  const { identity } = useScreeb();
  const sentUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!user) return;

    // Empêche l'appel multiple pour le même userId
    if (sentUserIdRef.current === user.userId) {
      return;
    }
    sentUserIdRef.current = user.userId;

    const sendIdentityToScreeb = async () => {
      const hashBuffer = await crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(user.userId),
      );

      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashedUserId = hashArray
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')
        .slice(0, 16); // 16 chars stables

      identity(hashedUserId, {
        profile: user.type,
      });
    };

    sendIdentityToScreeb();
  }, [user, identity]);
}
