// UserSubscription ইন্টারফেস
interface UserSubscription {
  _id: string;
  user: string; // ইউজারের _id
  planType: string;
  isActive: boolean;
  mockTestLimit: number;
  aiScoringLimit: number;
  sectionalMockTestLimit: number;
  cyoMockTestLimit: number;
  templates: number;
  studyPlan: string;
  performanceProgressDetailed: string;
  startedAt: string;
  __v: number;
}

// User ইন্টারফেস
interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  userSupscription: UserSubscription; // সম্পর্কিত সাবস্ক্রিপশন ডেটা
  profile: string; // ইউজারের প্রোফাইল ইমেজ URL
}

// RootUser ইন্টারফেস (যেখানে আপনি user.user অ্যাক্সেস করবেন)
export interface RootUser {
  user: User;
}
