import { InfoId } from './info';

export type CommentId = number;

export interface Comment {
  _id: CommentId;
  comment: string;
  owner: string;
  created: string;
  modified: string;
  username: string;
  info_id: InfoId;
}
