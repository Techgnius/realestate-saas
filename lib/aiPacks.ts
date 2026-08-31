export type AIPack = {
  id: string;
  name: string;
  credits: number;
  price: number;
  description: string;
  badge?: string;
  popular?: boolean;
};

export const AI_PACKS: AIPack[] = [
  {
    id: "starter",
    name: "Starter",
    credits: 25,
    price: 2500,
    description: "Perfect for trying AI-powered listings.",
  },

  {
    id: "growth",
    name: "Growth",
    credits: 100,
    price: 8500,
    description: "Best for active real estate agents.",
    badge: "Save 15%",
    popular: true,
  },

  {
    id: "agency",
    name: "Agency",
    credits: 250,
    price: 18000,
    description: "Built for agencies generating listings daily.",
    badge: "Save 25%",
  },
];

export function getAIPack(packId: string): AIPack | undefined {
  return AI_PACKS.find((pack) => pack.id === packId);
}