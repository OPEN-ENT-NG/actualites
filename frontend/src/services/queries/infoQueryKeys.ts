/*********************************************************************************
 * Info Query Keys always follow this format :
 * ['threads', threadId|undefined, 'infos', infoId|undefined, ...other_parameters]
 */

import { InfoExtendedStatus, InfoId, InfoStatus } from '~/models/info';
import { ThreadId } from '~/models/thread';

export type InfoQueryKeysParams = {
  threadId: ThreadId | 'all';
  status?: InfoStatus;
  state?: InfoExtendedStatus;
};
export const infoQueryKeys = {
  // ['infos']
  all: () => ['infos'],

  // ["infos","stats",{"viewHidden":true}]
  stats: (viewHidden?: boolean) => [
    ...infoQueryKeys.all(),
    'stats',
    { viewHidden: !!viewHidden },
  ],

  // List
  // ['infos', 'thread', 'all', 'expired']
  // ['infos', 'thread', 134, 'published']
  byThread: (options: InfoQueryKeysParams) => {
    const queryKey: any = [...infoQueryKeys.all(), 'thread', options.threadId];

    // set filter by state or status
    if (options.state) queryKey.push(options.state);
    else if (options.status) queryKey.push(options.status);
    return queryKey;
  },

  // Details
  // ['infos', 'details', 234]
  info: ({ infoId }: { infoId?: InfoId }) => [
    ...infoQueryKeys.all(),
    'details',
    infoId,
  ],

  // ['infos', 'details', 234, 'share', 'json']
  share: (options: { threadId?: ThreadId; infoId: InfoId }) => [
    ...infoQueryKeys.info(options),
    'share',
    'json',
  ],

  // ['infos', 'details', 234, 'revisions']
  revisions: (options: { infoId: InfoId }) => [
    ...infoQueryKeys.info(options),
    'revisions',
  ],

  // ['infos', 'details', 234, 'originalFormat']
  originalFormat: (options: { threadId?: ThreadId; infoId?: InfoId }) => [
    ...infoQueryKeys.info(options),
    'originalFormat',
  ],

  viewsDetails: (options: { infoId: InfoId }) => [
    ...infoQueryKeys.info(options),
    'viewsDetails',
  ],
};
