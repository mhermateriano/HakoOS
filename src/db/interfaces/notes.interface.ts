import { getDatabase } from "../database";

export type Note = {
  id: string;
  title: string;
  body: string;
  tag: "Idea" | "Meeting" | "Personal" | "Reference";
  pinned: boolean;
  updated: string;
};