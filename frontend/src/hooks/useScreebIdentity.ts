import { IUserInfo } from '@edifice.io/client';
import { useScreeb } from '@screeb/sdk-react';
import { useEffect, useRef } from 'react';
import { useConfig } from '~/services/queries/config';

export function useScreebIdentity(user: IUserInfo | undefined) {
  const { identity } = useScreeb();
  const { data: config } = useConfig();
  const sentUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    // If there's no user or no Screeb App ID in the config, we can't send identity to Screeb
    if (!user || !config?.screebAppID) return;

    // Skip call if the userId has already been sent to Screeb
    if (sentUserIdRef.current === user.userId) {
      return;
    }
    sentUserIdRef.current = user.userId;

    const sendIdentityToScreeb = async () => {
      try {
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
      } catch (error) {
        console.error('Failed to send identity to Screeb', error);
      }
    };

    sendIdentityToScreeb();
  }, [user, identity, config?.screebAppID]);
}
