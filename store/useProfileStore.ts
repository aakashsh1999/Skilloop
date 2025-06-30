import AsyncStorage from "@react-native-async-storage/async-storage";
import { v4 as uuidv4 } from "uuid";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  Certificate,
  ProfileImage,
  SocialProfile,
  UserProfile,
  UserSkill,
  WorkExperience,
} from "../types/profile";

interface ProfileState {
  profile: UserProfile;
  setCurrentStep: (step: number) => void;
  completeStep: (step: number) => void;
  addCertificate: (certificate: Omit<Certificate, "id">) => void;
  removeCertificate: (id: string) => void;
  addWorkExperience: (experience: Omit<WorkExperience, "id">) => void;
  removeWorkExperience: (id: string) => void;
  updateBusinessCard: (
    businessCard: Partial<UserProfile["businessCard"]>
  ) => void;
  addSocialProfile: (profile: SocialProfile) => void;
  removeSocialProfile: (platform: string) => void;
  addSkill: (skill: Omit<UserSkill, "id">) => void;
  removeSkill: (id: string) => void;
  updateBio: (bio: string) => void;
  updateBasicInfo: (info: Partial<UserProfile["basicInfo"]>) => void;
  setUserType: (type: UserProfile["userType"]) => void;
  addProfileImage: (image: Omit<ProfileImage, "id">) => void;
  removeProfileImage: (id: string) => void;
  resetProfile: () => void;
}

const initialProfile: UserProfile = {
  id: "",
  certificates: [],
  workExperience: [],
  businessCard: {
    role: "",
    company: "",
    portfolio: "",
    socialProfiles: [],
  },
  skills: [],
  bio: "",
  basicInfo: {
    fullName: "",
    age: "",
    gender: "",
    location: "",
    latitude: null,
    longitude: null,
    email: "",
  },
  userType: "freelancer",
  profileImages: [],
  currentStep: 1,
  completedSteps: [],
};

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      profile: initialProfile,

      setCurrentStep: (step) =>
        set((state) => ({
          profile: { ...state.profile, currentStep: step },
        })),

      completeStep: (step) =>
        set((state) => ({
          profile: {
            ...state.profile,
            completedSteps: [
              ...new Set([...state.profile.completedSteps, step]),
            ],
          },
        })),

      addCertificate: (certificate) =>
        set((state) => ({
          profile: {
            ...state.profile,
            certificates: [
              ...state.profile.certificates,
              { ...certificate, id: uuidv4() },
            ],
          },
        })),

      removeCertificate: (id) =>
        set((state) => ({
          profile: {
            ...state.profile,
            certificates: state.profile.certificates.filter(
              (cert) => cert.id !== id
            ),
          },
        })),

      addWorkExperience: (experience) =>
        set((state) => ({
          profile: {
            ...state.profile,
            workExperience: [
              ...state.profile.workExperience,
              { ...experience, id: uuidv4() },
            ],
          },
        })),

      removeWorkExperience: (id) =>
        set((state) => ({
          profile: {
            ...state.profile,
            workExperience: state.profile.workExperience.filter(
              (exp) => exp.id !== id
            ),
          },
        })),

      updateBusinessCard: (businessCard) =>
        set((state) => ({
          profile: {
            ...state.profile,
            businessCard: {
              ...state.profile.businessCard,
              ...businessCard,
            },
          },
        })),

      addSocialProfile: (profile) =>
        set((state) => ({
          profile: {
            ...state.profile,
            businessCard: {
              ...state.profile.businessCard,
              socialProfiles: [
                ...state.profile.businessCard.socialProfiles.filter(
                  (p) => p.platform !== profile.platform
                ),
                profile,
              ],
            },
          },
        })),

      removeSocialProfile: (platform) =>
        set((state) => ({
          profile: {
            ...state.profile,
            businessCard: {
              ...state.profile.businessCard,
              socialProfiles: state.profile.businessCard.socialProfiles.filter(
                (p) => p.platform !== platform
              ),
            },
          },
        })),

      addSkill: (skill) =>
        set((state) => ({
          profile: {
            ...state.profile,
            skills: [...state.profile.skills, { ...skill, id: uuidv4() }],
          },
        })),

      removeSkill: (id) =>
        set((state) => ({
          profile: {
            ...state.profile,
            skills: state.profile.skills.filter((s) => s.id !== id),
          },
        })),

      updateBio: (bio) =>
        set((state) => ({
          profile: { ...state.profile, bio },
        })),

      updateBasicInfo: (info) =>
        set((state) => ({
          profile: {
            ...state.profile,
            basicInfo: {
              ...state.profile.basicInfo,
              ...info,
            },
          },
        })),

      setUserType: (type) =>
        set((state) => ({
          profile: { ...state.profile, userType: type },
        })),

      addProfileImage: (image) =>
        set((state) => ({
          profile: {
            ...state.profile,
            profileImages: [
              ...state.profile.profileImages.filter(
                (img) => img.type !== image.type
              ),
              { ...image, id: uuidv4() },
            ],
          },
        })),

      removeProfileImage: (id) =>
        set((state) => ({
          profile: {
            ...state.profile,
            profileImages: state.profile.profileImages.filter(
              (img) => img.id !== id
            ),
          },
        })),

      resetProfile: () => set({ profile: initialProfile }),
    }),
    {
      name: "profile-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
