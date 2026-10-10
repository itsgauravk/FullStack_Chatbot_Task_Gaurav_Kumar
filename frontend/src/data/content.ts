export interface Offering {
  id: string;
  title: string;
  description: string;
}

export const services: Offering[] = [
  {
    id: "drone-technology",
    title: "Drone Technology Showcase",
    description:
      "Discover drones and related products for aerial photography, surveying and inspection.",
  },
  {
    id: "gis-mapping",
    title: "GIS & Mapping Solutions",
    description:
      "Learn how drone data is turned into maps and location insights using GIS.",
  },
  {
    id: "ai-solutions",
    title: "AI Technologies",
    description:
      "Explore how AI helps analyse aerial imagery and automate inspection work.",
  },
];

export const courses: Offering[] = [
  {
    id: "drone-pilot-training",
    title: "Drone Pilot Training",
    description:
      "Beginner-friendly training covering flight basics, safety and regulations.",
  },
  {
    id: "gis-fundamentals",
    title: "GIS Fundamentals",
    description:
      "Introduction to mapping, spatial data and common GIS tools.",
  },
  {
    id: "drone-data-and-ai",
    title: "Drone Data & AI",
    description:
      "How to process drone imagery and apply AI for analysis.",
  },
];

export const contactInfo = {
  website: "https://dronetv.in",
};
