export interface User {
  _id: string;
  username: string;
  email?: string;
}

export interface PostImage {
  url: string;
  public_id: string;
}

export interface Comment {
  _id: string;
  text: string;
  user: Pick<User, '_id' | 'username'>;
  createdAt: string;
}

export interface Post {
  _id: string;
  title: string;
  content: string;
  user: Pick<User, '_id' | 'username'>;
  image?: PostImage;
  likes: Array<Pick<User, '_id' | 'username'> | string>;
  comments: Comment[];
  createdAt: string;
}
