import medien from "../data/software-medien.json" with { type: "json" };

export type SoftwareScreenshot = {
  src: string;
  breite: number;
  hoehe: number;
  titel: string;
  alt: string;
  quelle: string;
  original: string;
  hinweis?: string;
};

export type SoftwareVideo = {
  typ: "youtube" | "vimeo" | "datei" | "iframe";
  titel: string;
  anbieter: string;
  einbettung: string;
  extern: string;
  quelle: string;
  sprache?: string;
  hinweis?: string;
};

export type SoftwareMedien = { bilder: SoftwareScreenshot[]; video?: SoftwareVideo };
export const softwareMedien = new Map<string, SoftwareMedien>(Object.entries(medien.profile as Record<string, SoftwareMedien>));
