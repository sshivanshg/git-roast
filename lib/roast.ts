// The roast engine. Pulls a user's public GitHub activity and turns it into
// a set of unhinged-but-affectionate burns. No auth required, but an optional
// GITHUB_TOKEN env var lifts the rate limits (core 60->5000/hr, search 10->30/min).
//
// Primary data source is the commit SEARCH api, which (unlike the events feed)
// still returns full commit messages AND author-local timestamps — so the
// "you commit at 2am" jokes are accurate to the dev's own git timezone.
//
// Joke variants are chosen with a seeded RNG derived from the username, so the
// same user always gets the same roast (and the web card matches the OG image),
// while different users pull different lines from the pool.

export type RoastLine = {
  emoji: string;
  text: string;
};

export type Roast = {
  username: string;
  name: string | null;
  avatar: string | null;
  bio: string | null;
  followers: number;
  publicRepos: number;
  // derived
  title: string; // the "dev spirit" verdict
  score: number; // 0-100 chaos score
  lines: RoastLine[];
  // raw-ish stats kept for the OG card / debugging
  totalCommits: number; // total indexed commits (headline number)
  sampleSize: number; // how many commits we actually analyzed
  topRepo: string | null;
  topLanguage: string | null;
};

export class RoastError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

const GH = "https://api.github.com";

function headers() {
  const h: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "git-wrapped"
  };
  if (process.env.GITHUB_TOKEN) {
    h.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return h;
}

async function gh(path: string) {
  const res = await fetch(`${GH}${path}`, {
    headers: headers(),
    next: { revalidate: 600 }
  });
  if (res.status === 404) throw new RoastError("not_found", 404);
  if (res.status === 403 || res.status === 429) {
    const remaining = res.headers.get("x-ratelimit-remaining");
    if (remaining === "0") throw new RoastError("rate_limited", 429);
    throw new RoastError("forbidden", res.status);
  }
  if (!res.ok) throw new RoastError(`github_error_${res.status}`, res.status);
  return res.json();
}

type GHUser = {
  login: string;
  name: string | null;
  avatar_url: string | null;
  bio: string | null;
  followers: number;
  public_repos: number;
};

type GHRepo = {
  name: string;
  language: string | null;
  stargazers_count: number;
  fork: boolean;
};

type GHCommitItem = {
  commit: { message: string; author: { date: string } | null };
  repository?: { name: string };
};

type GHCommitSearch = { total_count: number; items: GHCommitItem[] };

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const LAZY_MESSAGES = new Set([
  "fix", "fixed", "fixes", "fix bug", "bug fix", "wip", "update", "updates",
  "updated", "minor", "minor changes", "changes", "change", "stuff", "things",
  "test", "tests", "testing", "tmp", "temp", "asdf", "x", ".", "..", "...",
  "ok", "okay", "done", "final", "oops", "typo", "cleanup", "clean up", "misc",
  "init", "first", "commit", "first commit", "initial commit", "fixes", "lol",
  "nvm", "again", "more", "small fix", "quick fix", "hotfix", "revert"
]);

function pct(n: number, total: number) {
  if (!total) return 0;
  return Math.round((n / total) * 100);
}

// ---- deterministic seeded picker (same username => same jokes) ----
function seedFrom(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0 || 1;
}

function makePicker(seed: number) {
  let s = seed;
  return <T,>(arr: T[]): T => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    s >>>= 0;
    return arr[s % arr.length];
  };
}

// Extract the author's wall-clock hour + weekday from a git timestamp like
// "2026-05-28T15:29:38.000+05:30" — the offset is baked in, so it's their local time.
function parseLocal(dateStr: string | undefined | null) {
  if (!dateStr) return null;
  const m = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):/);
  if (!m) return null;
  const [, y, mo, d, h] = m;
  const weekday = new Date(Date.UTC(+y, +mo - 1, +d)).getUTCDay();
  return { hour: +h, weekday };
}

// language-specific burns — the funniest category. falls back to generic.
function languageBurn(lang: string): string {
  const L = lang.toLowerCase();
  const map: Record<string, string> = {
    javascript:
      "Mostly JavaScript — so half your bugs are literally `undefined`, just like your weekend plans.",
    typescript:
      "Mostly TypeScript. You added types to feel in control of one (1) thing in your life. It didn't work.",
    python:
      "Mostly Python. You're one stray space away from total collapse, emotionally and at runtime.",
    java:
      "Mostly Java. AbstractRoastFactoryProviderManagerImpl confirms: you have never said a thing in under 40 lines.",
    "c++":
      "Mostly C++. You manage memory by hand because therapy is expensive and segfaults are free.",
    c: "Mostly C. You raw-dog pointers for fun. The kernel called, it wants its trauma back.",
    rust:
      "Mostly Rust. You haven't gone five minutes without mentioning it. The borrow checker is your only stable relationship.",
    go: "Mostly Go. `if err != nil` is not a language feature, it's your entire personality.",
    php: "Mostly PHP. We're not mad. We're impressed you're still alive in there.",
    ruby: "Mostly Ruby. It's 2026 and you're still riding that horse into the sunset. Respect, sort of.",
    html: "Mostly HTML. And you absolutely list it as a 'programming language' on your résumé, don't you.",
    css: "Mostly CSS. You've centered a div maybe twice and you talk about it like Vietnam.",
    shell: "Mostly shell scripts. You are one confident `rm -rf` away from a brand new life.",
    "c#": "Mostly C#. Microsoft owns a piece of your soul now and the EULA was 80 pages.",
    swift: "Mostly Swift. You'd commit more but Xcode is still indexing. It's been four days.",
    kotlin: "Mostly Kotlin. Java with self-esteem. Good for you, genuinely.",
    dart: "Mostly Dart. Flutter convinced you this was a personality. It is now.",
    scala: "Mostly Scala. You wrote a one-liner so clever nobody (including you) can read it.",
    haskell: "Mostly Haskell. You don't write software, you write a passive-aggressive math proof.",
    lua: "Mostly Lua. Indexing from 1 like a menace to society.",
    vim: "Mostly Vim script. You can't quit. Literally. We've all heard.",
    perl: "Mostly Perl. Sir, this is 2026. Blink twice if you need extraction."
  };
  return map[L] || `Mostly ${lang}. We won't judge. (We are judging. Heavily.)`;
}

export async function computeRoast(rawUsername: string): Promise<Roast> {
  const username = rawUsername.trim().replace(/^@/, "");
  if (!username || !/^[a-zA-Z0-9-]{1,39}$/.test(username)) {
    throw new RoastError("invalid_username", 400);
  }

  const [user, search, repos] = await Promise.all([
    gh(`/users/${username}`) as Promise<GHUser>,
    gh(
      `/search/commits?q=author:${username}&sort=author-date&order=desc&per_page=100`
    ) as Promise<GHCommitSearch>,
    gh(`/users/${username}/repos?per_page=100&sort=pushed`) as Promise<GHRepo[]>
  ]);

  const items = search.items || [];
  const totalCommits = search.total_count || 0;
  const messages: string[] = [];
  const hours: number[] = new Array(24).fill(0);
  const weekday: number[] = new Array(7).fill(0);
  const repoCount: Record<string, number> = {};
  let timed = 0;

  for (const it of items) {
    const subject = (it.commit?.message || "").split("\n")[0].trim();
    if (subject) messages.push(subject);
    const t = parseLocal(it.commit?.author?.date);
    if (t) {
      hours[t.hour]++;
      weekday[t.weekday]++;
      timed++;
    }
    const repo = it.repository?.name;
    if (repo) repoCount[repo] = (repoCount[repo] || 0) + 1;
  }

  const sampleSize = messages.length;
  const lower = messages.map((m) => m.toLowerCase());

  const lazyCount = lower.filter((m) => LAZY_MESSAGES.has(m)).length;
  const fixCount = lower.filter((m) => /\bfix(es|ed)?\b/.test(m)).length;
  const oneWord = messages.filter((m) => m.split(/\s+/).length === 1 && m.length > 0).length;
  const profanity = lower.filter((m) =>
    /(wtf|ugh+|damn|crap|fuck|shit|argh+|please work|plz work|hate this|why won|finally|kill me|send help)/.test(m)
  ).length;
  const revertCount = lower.filter((m) => m.startsWith("revert")).length;
  const mergeCount = lower.filter((m) => m.startsWith("merge ")).length;
  const nonEmpty = messages.filter((m) => m.length > 0);
  const shortest = [...nonEmpty].sort((a, b) => a.length - b.length)[0];

  const lateNight = hours[0] + hours[1] + hours[2] + hours[3] + hours[4];
  const lateNightPct = pct(lateNight, timed);
  const peakHour = timed ? hours.indexOf(Math.max(...hours)) : -1;
  const weekendPushes = weekday[0] + weekday[6];
  const weekendPct = pct(weekendPushes, timed);
  const busiestDay = timed ? weekday.indexOf(Math.max(...weekday)) : -1;

  const topRepoEntry = Object.entries(repoCount).sort((a, b) => b[1] - a[1])[0];
  const topRepo = topRepoEntry ? topRepoEntry[0] : null;
  const topRepoShare = topRepoEntry ? pct(topRepoEntry[1], sampleSize) : 0;

  const langCount: Record<string, number> = {};
  let topStars = 0;
  let starRepo: string | null = null;
  for (const r of repos || []) {
    if (r.language) langCount[r.language] = (langCount[r.language] || 0) + 1;
    if (!r.fork && r.stargazers_count > topStars) {
      topStars = r.stargazers_count;
      starRepo = r.name;
    }
  }
  const topLanguage = Object.entries(langCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  const pick = makePicker(seedFrom(user.login.toLowerCase()));

  // ---- HEADLINERS: brutal one-liners that only fire on egregious stats.
  // These lead the card so the most damning trait hits first.
  const headliners: RoastLine[] = [];

  if (fixCount >= 30) {
    headliners.push({
      emoji: "💀",
      text: pick([
        `${fixCount} "fix" commits out of ${sampleSize}. That's not a commit history, that's a confession tape. Lawyer up.`,
        `${fixCount} commits literally named "fix". At this point "fix" isn't a word, it's the sound your codebase makes while bleeding out.`,
        `${fixCount}× "fix". Your repo is held together by duct tape, cope, and the prayers of whoever's on call.`
      ])
    });
  } else if (fixCount >= 15) {
    headliners.push({
      emoji: "💀",
      text: pick([
        `${fixCount} "fix" commits. You don't write software, you write hostage notes to your future self.`,
        `${fixCount} "fix" commits. Every single one is a tiny apology nobody accepted.`
      ])
    });
  }

  if (lateNightPct >= 55 && timed > 8) {
    headliners.push({
      emoji: "🧛",
      text: pick([
        `${lateNightPct}% of your commits land after midnight. You don't have a sleep schedule, you have a haunting.`,
        `${lateNightPct}% of commits past midnight. You're not a developer, you're a raccoon that learned git.`,
        `${lateNightPct}% nocturnal. The sun has filed a missing-persons report on you.`
      ])
    });
  }

  if (weekendPct >= 65 && timed > 8) {
    headliners.push({
      emoji: "⛓️",
      text: pick([
        `${weekendPct}% of your commits are on weekends. The week has seven days and you've fed all of them to a repository. This is a hostage video with syntax highlighting.`,
        `${weekendPct}% weekend commits. Saturday called. It wants to be a day off again. You said no.`
      ])
    });
  }

  if (topRepo && topRepoShare >= 80 && sampleSize > 8) {
    headliners.push({
      emoji: "⛓️",
      text: pick([
        `${topRepoShare}% of your commits go to ONE repo: "${topRepo}". Monogamy is beautiful. This is not that. This is captivity.`,
        `${topRepoShare}% of everything is "${topRepo}". You and that repo need to start seeing other people.`
      ])
    });
  }

  if (profanity >= 6) {
    headliners.push({
      emoji: "🤬",
      text: pick([
        `${profanity} commit messages are pure rage. Your git log reads like a man slowly losing a fistfight with a vending machine.`,
        `${profanity} unhinged commits. Somewhere a therapist could retire off your reflog alone.`
      ])
    });
  }

  if (totalCommits >= 6000) {
    headliners.push({
      emoji: "🏭",
      text: pick([
        `${totalCommits.toLocaleString("en-US")} commits. You're not a person, you're a CI pipeline that gained sentience and chose violence.`,
        `${totalCommits.toLocaleString("en-US")} commits indexed. At what point do we call this a hostage situation against your own free time?`
      ])
    });
  }

  if (oneWord >= 25) {
    headliners.push({
      emoji: "✍️",
      text: pick([
        `${oneWord} one-word commits. You've shared more of yourself with a CAPTCHA than with any future maintainer.`,
        `${oneWord} one-word commits. Your git log has the emotional range of a disconnected printer.`
      ])
    });
  }

  const lines: RoastLine[] = [];

  if (fixCount > 0 && fixCount < 15) {
    lines.push({
      emoji: "💀",
      text: pick([
        `${fixCount} of your last ${sampleSize} commits are just "fix". You're not coding, you're negotiating with hostages you created.`,
        `${fixCount} "fix" commits. At this point "fix" isn't a message, it's a confession.`,
        `${fixCount} flavors of "fix". You don't squash bugs, you run a breeding program.`,
        `${fixCount} "fix" commits — the bug won. It fixed YOU.`,
        `${fixCount} "fix" commits. Whatever you shipped to prod is held together by spite and a Stack Overflow answer from 2014.`,
        `${fixCount} times you typed "fix" and hit enter like a prayer. God stopped reading around commit 3.`,
        `${fixCount} "fix" commits. You write the bugs AND the patches. That's not a job, that's Munchausen by codebase.`
      ])
    });
  }

  if (lazyCount > 0) {
    const sample = lower.find((m) => LAZY_MESSAGES.has(m)) || "update";
    lines.push({
      emoji: "🥱",
      text: pick([
        `${lazyCount} commits that just say "${sample}". git blame is going to lead future-you to a dead end and a crime scene.`,
        `${lazyCount} masterpieces like "${sample}". Shakespeare is rolling in his grave and your tech lead is rolling their eyes.`,
        `"${sample}" — ${lazyCount} times. You write commit messages like you're being held at gunpoint.`,
        `${lazyCount} commits with the message "${sample}". Bold of you to assume anyone, including you, will ever know what changed.`,
        `${lazyCount} "${sample}" commits. Reading your git log is like reading a ransom note from someone who gave up halfway through.`,
        `${lazyCount} commits like "${sample}". Your messages have the descriptive power of a dead pixel.`,
        `${lazyCount} "${sample}" commits. The poor soul who inherits this is going to find your name, then your address.`
      ])
    });
  }

  if (lateNightPct >= 12 && lateNightPct < 55 && timed > 5) {
    lines.push({
      emoji: "🌙",
      text: pick([
        `${lateNightPct}% of your commits drop between midnight and 5am. Code written at that hour is a war crime and you know it.`,
        `${lateNightPct}% of your commits are 2am specials. Sleep is free. Therapy isn't. Try at least one.`,
        `${lateNightPct}% midnight commits. Your sleep schedule has worse uptime than your servers.`,
        `${lateNightPct}% of commits after midnight. Whatever you're running from, it lives in the repo now.`,
        `${lateNightPct}% past midnight. The code you push at 3am should be read aloud to you in court.`,
        `${lateNightPct}% night commits. Your circadian rhythm filed for divorce and got full custody of your health.`
      ])
    });
  } else if (peakHour >= 0) {
    lines.push({
      emoji: "⏰",
      text: pick([
        `Peak commit hour: ${peakHour}:00, your time. Reliable, like a cron job nobody asked for.`,
        `You strike most at ${peakHour}:00 sharp. We could set a doomsday clock by you.`,
        `Prime grind hour: ${peakHour}:00. Predictable. Beautiful. Slightly concerning.`
      ])
    });
  }

  if (weekendPct >= 30 && weekendPct < 65 && timed > 6) {
    lines.push({
      emoji: "🏖️",
      text: pick([
        `${weekendPct}% of your commits are on weekends. You don't have work-life balance, you have a work-work balance.`,
        `${weekendPct}% weekend commits. Touch grass? You'd 'git push' the grass and call it a PR.`,
        `${weekendPct}% weekend commits. Your friends think you moved away. Your repo knows the truth.`,
        `${weekendPct}% on weekends. Your idea of a wild Saturday is resolving a merge conflict by candlelight.`,
        `${weekendPct}% weekend commits. You don't go outside, you "deploy" outside.`
      ])
    });
  }

  if (topRepo && topRepoShare >= 30 && topRepoShare < 80 && sampleSize > 5) {
    lines.push({
      emoji: "📦",
      text: pick([
        `${topRepoShare}% of your commits go to "${topRepo}". That's not a side project, that's a hostage situation.`,
        `"${topRepo}" ate ${topRepoShare}% of your recent commits. It's not a repo anymore, it's a personality disorder with a README.`,
        `${topRepoShare}% of everything goes to "${topRepo}". Blink twice if "${topRepo}" is holding you against your will.`,
        `${topRepoShare}% of your commits land in "${topRepo}". At this point it's your cellmate, your hostage, and your only friend.`,
        `${topRepoShare}% to "${topRepo}". Even the repo wants some space, man.`
      ])
    });
  } else if (topRepo && topRepoShare < 30) {
    lines.push({
      emoji: "📦",
      text: pick([
        `Currently fixated on "${topRepo}". Get a hobby that doesn't have a package.json.`,
        `You can't stop pushing to "${topRepo}". We're not judging. We're staging an intervention.`
      ])
    });
  }

  if (oneWord >= 4 && oneWord < 25) {
    lines.push({
      emoji: "✍️",
      text: pick([
        `${oneWord} one-word commit messages. A minimalist genius — or you've given up. (It's the second one.)`,
        `${oneWord} one-word commits. Hemingway wishes. Your reviewers wish you were anyone else.`,
        `${oneWord} single-word commits. Each one a tiny "figure it out yourself" to humanity.`,
        `${oneWord} one-word commits. You communicate with the emotional depth of a 404 page.`,
        `${oneWord} one-word commits. Your future maintainer is going to need a séance, not a changelog.`
      ])
    });
  }

  if (profanity > 0 && profanity < 6) {
    lines.push({
      emoji: "🤬",
      text: pick([
        `${profanity} commit message${profanity > 1 ? "s" : ""} leaked genuine emotional damage straight into git history. We've alerted no one. It's funnier this way.`,
        `${profanity} of your commits are a cry for help with a SHA attached. Stay strong, soldier.`,
        `${profanity} commit${profanity > 1 ? "s" : ""} where you clearly lost it. Git remembers. Git always remembers.`,
        `${profanity} commit${profanity > 1 ? "s" : ""} where you snapped on the record. HR can't see git history. Yet.`,
        `${profanity} commit${profanity > 1 ? "s" : ""} that read like the last text before someone throws their laptop into a lake.`
      ])
    });
  }

  if (revertCount > 0) {
    lines.push({
      emoji: "↩️",
      text: pick([
        `${revertCount} revert${revertCount > 1 ? "s" : ""}. Bold of you to undo your mistakes in public, where God and your coworkers can watch.`,
        `${revertCount} revert${revertCount > 1 ? "s" : ""} — the git equivalent of typing "nvm" after a three-paragraph rant.`,
        `${revertCount} revert${revertCount > 1 ? "s" : ""}. You make a decision, panic, and document the shame forever. Embarrassing. Eternal.`
      ])
    });
  }

  if (mergeCount >= 6) {
    lines.push({
      emoji: "🔀",
      text: pick([
        `${mergeCount} merge commits cluttering history like dishes you swore you'd "do later".`,
        `${mergeCount} merge commits. Ever heard of rebase? No? Then continue suffering, I suppose.`,
        `${mergeCount} merge commits. Your git graph looks like a plate of spaghetti someone dropped down a flight of stairs.`
      ])
    });
  }

  if (shortest && shortest.length <= 3) {
    lines.push({
      emoji: "🔬",
      text: pick([
        `Your shortest commit message is "${shortest}". Iconic. Useless. Iconic.`,
        `Shortest commit: "${shortest}". The git log version of a shrug and walking away.`,
        `Shortest commit: "${shortest}". A monument to not giving a single, solitary damn.`
      ])
    });
  }

  if (starRepo && topStars >= 25) {
    lines.push({
      emoji: "⭐",
      text: pick([
        `"${starRepo}" has ${topStars.toLocaleString("en-US")} stars. Okay, okay — you're kind of a big deal. Insufferable, but a big deal.`,
        `${topStars.toLocaleString("en-US")} stars on "${starRepo}". Hard to roast a legend, but here we are, doing our best.`
      ])
    });
  }

  if (busiestDay >= 0 && timed > 8) {
    lines.push({
      emoji: "📅",
      text: pick([
        `${DAYS[busiestDay]} is your grind day. Whatever happened to you on a ${DAYS[busiestDay]}, the codebase is paying for it.`,
        `Most active on ${DAYS[busiestDay]}s. Everyone else logs off; you log on. Seek balance, freak.`
      ])
    });
  }

  if (totalCommits >= 1500 && totalCommits < 6000) {
    lines.push({
      emoji: "🤖",
      text: pick([
        `${totalCommits.toLocaleString("en-US")} commits indexed. HR should check whether you're three interns in a trench coat.`,
        `${totalCommits.toLocaleString("en-US")} total commits. Are you a developer or just violently allergic to the outdoors?`
      ])
    });
  }

  if (topLanguage) {
    lines.push({ emoji: "🧪", text: languageBurn(topLanguage) });
  }

  if (headliners.length === 0 && lines.length === 0) {
    if (sampleSize === 0) {
      lines.push({
        emoji: "👻",
        text: "Almost no public commits to roast. Either you're a 10x dev who works in private, or you're funemployed. This card genuinely cannot tell.",
      });
    }
    lines.push({
      emoji: "🌱",
      text: `${user.public_repos} public repos, ${user.followers.toLocaleString("en-US")} followers, and a clean conscience. Suspicious. Nobody's this innocent.`
    });
  }

  // ---------- score + verdict ----------
  let score =
    18 +
    fixCount * 3 +
    lazyCount * 2.5 +
    lateNightPct * 0.5 +
    weekendPct * 0.25 +
    profanity * 6 +
    oneWord * 1.5 +
    revertCount * 4;
  score = Math.max(1, Math.min(100, Math.round(score)));

  let title = "Suspiciously Functional Adult";
  if (sampleSize === 0) title = "The Phantom Committer";
  else if (fixCount >= 30) title = "Walking Git Blame Crime Scene";
  else if (lateNightPct >= 55) title = "Sleep-Deprived War Criminal";
  else if (profanity >= 6) title = "Emotionally Unwell, Technically Shipping";
  else if (weekendPct >= 65) title = "Hostage of His Own Repo";
  else if (lateNightPct >= 25) title = "Nocturnal Gremlin";
  else if (profanity >= 3) title = "Rage-Commit Champion";
  else if (fixCount >= 6) title = "Professional 'fix' Typist";
  else if (lazyCount >= 10) title = "Commit Message Minimalist (Derogatory)";
  else if (revertCount >= 3) title = "Force-Push Felon";
  else if (weekendPct >= 45) title = "Touch-Grass Refusenik";
  else if (topStars >= 100) title = "Certified Open-Source Menace";
  else if (mergeCount >= 8) title = "The Merge Goblin";
  else if (score <= 24) title = "Suspiciously Well-Adjusted (Boring)";

  return {
    username: user.login,
    name: user.name,
    avatar: user.avatar_url,
    bio: user.bio,
    followers: user.followers,
    publicRepos: user.public_repos,
    title,
    score,
    // headliners lead; de-dupe defensively in case a stat fired in both tiers
    lines: [...headliners, ...lines]
      .filter((l, i, a) => a.findIndex((x) => x.text === l.text) === i)
      .slice(0, 6),
    totalCommits,
    sampleSize,
    topRepo,
    topLanguage
  };
}
