export interface TeamMember {
  name: string;
  role: string;
  photoUrl?: string;
  bio?: string;
}

export interface AboutConfig {
  title: string;
  story: string;
  imageUrl?: string;
  team: TeamMember[];
  showContact: boolean;
}

export const defaultAboutConfig: AboutConfig = {
  title: "About Emery Collection",
  story: "",
  imageUrl: "",
  team: [],
  showContact: true,
};

export const ABOUT_KEY = "about_config";
