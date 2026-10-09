"use client";

import type { Problem } from "@/models/problem-model";

interface ApiProblem {
  id: string;
  title: string;
  title_slug: string;
  url: string;
  difficulty: string;
  topic_tags: string[];
}

export class LeetCodeFetchService {
  public readonly baseUrl: string;

  constructor(baseUrl: string = "https://leetcode-api-pied.vercel.app") {
    console.log("Base URl from environment:", process.env.LEETCODE_API_URL);
    this.baseUrl = baseUrl.replace(/\/$/, "");
    console.log(`LeetCodeFetchService initialized with base URL: ${this.baseUrl}`);
  }

  private buildUrl(path: string): string {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return `${this.baseUrl}${normalizedPath}`;
  }

  private async request<T>(path: string, options: RequestInit): Promise<T> {
    const response = await fetch(this.buildUrl(path), {
      ...options,
      headers: {
        Accept: "application/json",
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
    });
    if (!response.ok) {
      throw new Error(`LeetCode API request failed: ${response.status}`);
    }
    return response.json() as Promise<T>;
  }

  async getProblems(): Promise<Problem[]> {
    const problems = await this.request<ApiProblem[]>("/problems", { method: "GET" });
    if (!Array.isArray(problems)) throw new Error("Invalid LeetCode API response");

    return problems.map((problem) => {
      const id = Number(problem.id);
      if (!Number.isSafeInteger(id) || id <= 0) throw new Error("Invalid LeetCode problem ID");

      return {
        id,
        title: problem.title,
        titleSlug: problem.title_slug,
        url: problem.url,
        difficulty: problem.difficulty,
        topics: problem.topic_tags,
      };
    });
  }
}

export const leetCodeFetchService = new LeetCodeFetchService();
