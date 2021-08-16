import { Post, PostState } from './post';

export interface Profile {
  shortcode: string;
  username: string;
  full_name: string;
  postsCnt: number;
  followerCnt: number;
  followingCnt: number;
  platform: string;
  url: string;
  submitTime: number;
  isIrrelevant: boolean;
  post: Post;
  postState: PostState;
  scamType: string;
}
export function profileComparator(p1: Profile, p2: Profile) {
  if (p1.isIrrelevant > p2.isIrrelevant) {
    return 1;
  } else if (p1.isIrrelevant < p2.isIrrelevant) {
    return -1;
  } else {
    return p1.submitTime > p2.submitTime ? -1 : 1;
  }
}
