import { Post, PostState } from './post';

export interface Profile {
  shortcode: string;
  username: string;
  full_name: string;
  url: string;
  isIrrelevant: boolean;
  post: Post;
  postState: PostState;
}
