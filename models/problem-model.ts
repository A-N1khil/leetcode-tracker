export interface Problem {
  id: number;
  title: string;
  titleSlug: string;
  url: string;
  difficulty: string;
  topics: string[];
}

export enum SolveStatus {
  ATTEMPTED = "Attempted",
  WRONG_ANSWER = "Wrong Answer",
  COMPILE_ERROR = "Compile Error",
  RUNTIME_ERROR = "Runtime Error",
  ACCEPTED = "Accepted",
}
