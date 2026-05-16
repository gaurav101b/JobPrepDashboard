const LC_ENDPOINT = "https://leetcode.com/graphql/";

const RECENT_AC_QUERY = `
query recentAcSubmissions($username: String!, $limit: Int!) {
  recentAcSubmissionList(username: $username, limit: $limit) {
    id
    title
    titleSlug
    timestamp
  }
}`;

const QUESTION_QUERY = `
query questionData($titleSlug: String!) {
  question(titleSlug: $titleSlug) {
    questionId
    title
    titleSlug
    difficulty
    topicTags { name slug }
  }
}`;

const USER_PROFILE_QUERY = `
query userProfile($username: String!) {
  matchedUser(username: $username) {
    username
    submitStats: submitStatsGlobal {
      acSubmissionNum { difficulty count }
    }
  }
}`;

export type LCSubmission = {
  id: string;
  title: string;
  titleSlug: string;
  timestamp: string;
};

export type LCQuestion = {
  questionId: string;
  title: string;
  titleSlug: string;
  difficulty: "Easy" | "Medium" | "Hard";
  topicTags: { name: string; slug: string }[];
};

export type LCStats = {
  username: string;
  total: number;
  easy: number;
  medium: number;
  hard: number;
};

async function gql<T>(
  query: string,
  variables: Record<string, unknown>,
  signal?: AbortSignal
): Promise<T> {
  const res = await fetch(LC_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Referer: "https://leetcode.com",
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 Chrome/124 Safari/537.36",
    },
    body: JSON.stringify({ query, variables }),
    signal,
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`LeetCode HTTP ${res.status}`);
  }
  const json = (await res.json()) as { data?: T; errors?: Array<{ message: string }> };
  if (json.errors?.length) {
    throw new Error(`LeetCode: ${json.errors.map((e) => e.message).join(", ")}`);
  }
  if (!json.data) throw new Error("LeetCode: empty response");
  return json.data;
}

export async function fetchRecentAccepted(
  username: string,
  limit = 50
): Promise<LCSubmission[]> {
  const data = await gql<{ recentAcSubmissionList: LCSubmission[] | null }>(
    RECENT_AC_QUERY,
    { username, limit }
  );
  return data.recentAcSubmissionList ?? [];
}

export async function fetchQuestionDetail(
  titleSlug: string
): Promise<LCQuestion | null> {
  const data = await gql<{ question: LCQuestion | null }>(QUESTION_QUERY, {
    titleSlug,
  });
  return data.question;
}

export async function fetchUserStats(username: string): Promise<LCStats | null> {
  const data = await gql<{
    matchedUser: {
      username: string;
      submitStats: {
        acSubmissionNum: { difficulty: string; count: number }[];
      };
    } | null;
  }>(USER_PROFILE_QUERY, { username });
  const u = data.matchedUser;
  if (!u) return null;
  const m = (k: string) =>
    u.submitStats.acSubmissionNum.find((x) => x.difficulty === k)?.count ?? 0;
  return {
    username: u.username,
    total: m("All"),
    easy: m("Easy"),
    medium: m("Medium"),
    hard: m("Hard"),
  };
}
