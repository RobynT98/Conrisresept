export type Ingredient = {
  qty: number | null;
  unit: string;
  item: string;
  note?: string;
  optional?: boolean;
};

export type Step = {
  text: string;
  timer?: number; // sekunder, 0/undefined = ingen timer
};

export type Recipe = {
  id: string;
  title: string;
  chapter: string;
  themes: string[];
  servings: number;
  time: { prep: number; cook: number; total: number; unit: "min" };
  difficulty: "lätt" | "medel" | "svår";
  image?: string; // data URL
  ingredients: Ingredient[];
  steps: Step[];
  notes?: string;
  tags?: string[];
  favorite?: boolean;
  createdAt: number;
  updatedAt: number;
};
export interface Note {
  id: string;
  text: string;
  pinned: boolean;
  createdAt: number;
  updatedAt: number;
}
