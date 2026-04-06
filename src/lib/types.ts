export type SocialAttachment = {
  id: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
  dataUrl: string;
  isImage: boolean;
  isPdf: boolean;
};

export type SocialComment = {
  id: string;
  author: string;
  text: string;
  createdAt: string;
  score: number;
  voteByMe: -1 | 0 | 1;
  attachments: SocialAttachment[];
  replies: SocialComment[];
};

export type SocialPost = {
  id: string;
  author: string;
  content: string;
  createdAt: string;
  score: number;
  voteByMe: -1 | 0 | 1;
  attachments: SocialAttachment[];
  comments: SocialComment[];
};

export type ReputationEntry = {
  author: string;
  points: number;
};

export type SocialBoardData = {
  posts: SocialPost[];
  reputationBoard: ReputationEntry[];
  myReputation: number;
};
