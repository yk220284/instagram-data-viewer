export type PostState = 'processed' | 'unprocessed';
type JsonLabel = { [key: string]: any };
type AttributeMapPair = { from: string; to: string };

class Creater<T> {
  constructor(
    private source: JsonLabel,
    private targetAttributes: string[],
    private attributesRenamingMap: AttributeMapPair[]
  ) {}

  build(): T {
    return this.targetAttributes.reduce(
      (acc: { [index: string]: any }, attributeName) => {
        const pair = this.attributesRenamingMap.find(
          (pair) => pair.from === attributeName
        );
        if (pair === undefined) {
          acc[attributeName] = this.source[attributeName];
        } else {
          acc[pair.to] = this.source[pair.from];
        }
        return acc;
      },
      {}
    ) as T;
  }
}

export interface PostProfile {
  username: string;
  full_name: string;
  followersCnt: number;
  followingCnt: number;
  postsCnt: number;
  is_business_account: boolean;
  is_verified: boolean;
  business_category_name: string | null;
  overall_category_name: string | null;
}

export class PostProfileCreater extends Creater<PostProfile> {
  static TARGET_ATTRIBUTES = [
    'username',
    'full_name',
    'followers', // followersCnt
    'following', // followingCnt
    'is_business_account',
    'is_verified',
    'posts', // postsCnt
    'business_category_name',
    'overall_category_name',
  ];
  static ATTRIBUTES_RNAMEING_MAP: AttributeMapPair[] = [
    { from: 'followers', to: 'followersCnt' },
    { from: 'following', to: 'followingCnt' },
    { from: 'posts', to: 'postsCnt' },
  ];

  constructor(source: JsonLabel) {
    super(
      source,
      PostProfileCreater.TARGET_ATTRIBUTES,
      PostProfileCreater.ATTRIBUTES_RNAMEING_MAP
    );
  }
}

export interface Post {
  shortcode: string;
  upload_date: string;
  caption: string;
  hashtags: string[];
  tagged_users: string[];
  // Img extraction
  extracted_text: string;
  fake_names: string[];
  // Profile extraction
  postProfile: PostProfile;
}

export class PostCreater extends Creater<Post> {
  static TARGET_ATTRIBUTES = [
    'shortcode',
    'upload_date',
    'caption',
    'hashtags',
    'tagged_users',
    'extracted_text',
    'fake_names',
    'profile', // postProfile
  ];
  static ATTRIBUTES_RNAMEING_MAP: AttributeMapPair[] = [
    { from: 'profile', to: 'postProfile' },
  ];

  constructor(source: JsonLabel) {
    super(
      source,
      PostCreater.TARGET_ATTRIBUTES,
      PostCreater.ATTRIBUTES_RNAMEING_MAP
    );
  }

  override build(): Post {
    let postWithoutProfile = super.build();
    return Object.assign(postWithoutProfile, {
      postProfile: new PostProfileCreater(
        postWithoutProfile.postProfile
      ).build(),
    });
  }
}
