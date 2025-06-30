export interface Certificate {
  id: string;
  title: string;
  organization: string;
  issueDate: string;
  imageUrl?: string;
  certificateUrl?: string;
}

export interface WorkExperience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  currentlyWorking: boolean;
  logo?: string;
}

export interface SocialProfile {
  platform: string;
  url: string;
}

export interface BusinessCard {
  role: string;
  company: string;
  portfolio?: string;
  socialProfiles: SocialProfile[];
}

export interface UserSkill {
  id: string;
  name: string;
  category:
    | "editor"
    | "developer"
    | "designer"
    | "business"
    | "videography"
    | string;
}

export type UserType = "freelancer" | "founder" | "student";

export interface BasicInfo {
  fullName: string;
  age: string;
  gender: string;
  email: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
}

export interface ProfileImage {
  id: string;
  url: string;
  type: "face" | "skill" | "professional";
}

export interface UserProfile {
  id: string;
  certificates: Certificate[];
  workExperience: WorkExperience[];
  businessCard: BusinessCard;
  skills: UserSkill[];
  bio: string;
  basicInfo: BasicInfo;
  userType: UserType;
  profileImages: ProfileImage[];
  currentStep: number;
  completedSteps: number[];
}
