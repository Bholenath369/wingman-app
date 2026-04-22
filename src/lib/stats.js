/**
 * Stats & Gamification System
 * Manages XP, streaks, badges, and achievements
 */

const STORAGE_KEY = 'wingman_stats';
const STREAK_KEY = 'wingman_streak';
const CHALLENGE_KEY = 'wingman_challenge';

// Badge definitions
export const BADGES = {
  first_analysis: { id: 'first_analysis', name: 'First Look', emoji: '👀', desc: 'Analyzed your first conversation' },
  confidence_10: { id: 'confidence_10', name: 'Confident', emoji: '💪', desc: 'Mastered 10 rewrites' },
  analyzer_25: { id: 'analyzer_25', name: 'Detective', emoji: '🔍', desc: 'Analyzed 25 conversations' },
  week_streak_7: { id: 'week_streak_7', name: 'Week Warrior', emoji: '🔥', desc: '7-day practice streak' },
  persona_master: { id: 'persona_master', name: 'Persona Master', emoji: '🎭', desc: 'Practiced with all 4 personas' },
  perfect_score: { id: 'perfect_score', name: 'Perfect Game', emoji: '🎯', desc: 'Aced a daily challenge' },
  social_butterfly: { id: 'social_butterfly', name: 'Butterfly', emoji: '🦋', desc: 'Shared 5 results' },
  xp_monster: { id: 'xp_monster', name: 'XP Monster', emoji: '⚡', desc: 'Earned 1000 XP' },
};

// Daily Challenge definitions
export const DAILY_CHALLENGES = [
  {
    id: 'cold_challenge',
    title: 'Cold Girl Master',
    desc: 'Get 3 successful replies from Sofia (Cold Girl)',
    emoji: '🥶',
    reward: 250,
    type: 'persona',
    persona: 'cold',
    target: 3,
  },
  {
    id: 'smooth_talker',
    title: 'Smooth Talker',
    desc: 'Rewrite 5 messages successfully',
    emoji: '💬',
    reward: 200,
    type: 'coach',
    target: 5,
  },
  {
    id: 'analyzer_pro',
    title: 'Analyzer Pro',
    desc: 'Analyze 3 different conversations',
    emoji: '🔍',
    reward: 200,
    type: 'analyze',
    target: 3,
  },
  {
    id: 'personality_detective',
    title: 'Personality Detective',
    desc: 'Complete personality analysis on 2 convos',
    emoji: '🧠',
    reward: 200,
    type: 'personality',
    target: 2,
  },
  {
    id: 'high_value_chat',
    title: 'High Value Chat',
    desc: 'Get 2 replies from Alex (High Value persona)',
    emoji: '👑',
    reward: 250,
    type: 'persona',
    persona: 'highvalue',
    target: 2,
  },
];

// Initialize or get stats
function getStats() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('Error reading stats:', e);
  }

  // Default stats
  return {
    xp: 0,
    level: 1,
    badges: [],
    analyses: 0,
    rewrites: 0,
    simulations: 0,
    shares: 0,
    lastActive: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };
}

function saveStats(stats) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch (e) {
    console.error('Error saving stats:', e);
  }
}

// Streak management
function getStreak() {
  try {
    const data = localStorage.getItem(STREAK_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('Error reading streak:', e);
  }

  return { count: 0, lastDate: null };
}

function saveStreak(streak) {
  try {
    localStorage.setItem(STREAK_KEY, JSON.stringify(streak));
  } catch (e) {
    console.error('Error saving streak:', e);
  }
}

function updateStreak() {
  const streak = getStreak();
  const today = new Date().toISOString().split('T')[0];
  const lastDate = streak.lastDate ? new Date(streak.lastDate).toISOString().split('T')[0] : null;

  if (lastDate === today) {
    // Already active today
    return streak.count;
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (lastDate === yesterdayStr) {
    // Continue streak
    streak.count += 1;
  } else {
    // Reset streak
    streak.count = 1;
  }

  streak.lastDate = new Date().toISOString();
  saveStreak(streak);
  return streak.count;
}

// Daily Challenge
function getTodayChallenge() {
  try {
    const data = localStorage.getItem(CHALLENGE_KEY);
    if (data) {
      const challenge = JSON.parse(data);
      const today = new Date().toISOString().split('T')[0];
      if (challenge.date === today) {
        return challenge;
      }
    }
  } catch (e) {
    console.error('Error reading challenge:', e);
  }

  // Generate new daily challenge
  const today = new Date().toISOString().split('T')[0];
  const challenge = {
    date: today,
    challengeId: DAILY_CHALLENGES[Math.floor(Math.random() * DAILY_CHALLENGES.length)].id,
    progress: 0,
    completed: false,
    reward: 0,
  };

  try {
    localStorage.setItem(CHALLENGE_KEY, JSON.stringify(challenge));
  } catch (e) {
    console.error('Error saving challenge:', e);
  }

  return challenge;
}

export function getChallengeDetails() {
  const challenge = getTodayChallenge();
  const details = DAILY_CHALLENGES.find(c => c.id === challenge.challengeId);
  return { ...challenge, ...details };
}

export function incrementChallenge(amount = 1) {
  const challenge = getTodayChallenge();
  const details = DAILY_CHALLENGES.find(c => c.id === challenge.challengeId);
  
  challenge.progress = Math.min(challenge.progress + amount, details.target);
  
  if (challenge.progress >= details.target && !challenge.completed) {
    challenge.completed = true;
    challenge.reward = details.reward;
    addXP(details.reward);
    unlockBadge('perfect_score');
  }

  try {
    localStorage.setItem(CHALLENGE_KEY, JSON.stringify(challenge));
  } catch (e) {
    console.error('Error saving challenge:', e);
  }

  return challenge;
}

// XP and Levels
export function addXP(amount) {
  const stats = getStats();
  stats.xp += amount;

  // Calculate level (100 XP per level)
  const newLevel = Math.floor(stats.xp / 100) + 1;
  const leveledUp = newLevel > stats.level;

  if (leveledUp) {
    stats.level = newLevel;
  }

  stats.lastActive = new Date().toISOString();
  updateStreak();
  saveStats(stats);

  return { leveledUp, newLevel, totalXP: stats.xp };
}

// Badge system
export function unlockBadge(badgeId) {
  const stats = getStats();
  if (!stats.badges.includes(badgeId)) {
    stats.badges.push(badgeId);
    saveStats(stats);
    return true;
  }
  return false;
}

export function checkAndUnlockBadges() {
  const stats = getStats();
  const newBadges = [];

  // First analysis
  if (stats.analyses >= 1 && !stats.badges.includes('first_analysis')) {
    newBadges.push('first_analysis');
  }

  // 10 rewrites
  if (stats.rewrites >= 10 && !stats.badges.includes('confidence_10')) {
    newBadges.push('confidence_10');
  }

  // 25 analyses
  if (stats.analyses >= 25 && !stats.badges.includes('analyzer_25')) {
    newBadges.push('analyzer_25');
  }

  // Week streak
  const streak = getStreak();
  if (streak.count >= 7 && !stats.badges.includes('week_streak_7')) {
    newBadges.push('week_streak_7');
  }

  // XP Monster
  if (stats.xp >= 1000 && !stats.badges.includes('xp_monster')) {
    newBadges.push('xp_monster');
  }

  // Social Butterfly
  if (stats.shares >= 5 && !stats.badges.includes('social_butterfly')) {
    newBadges.push('social_butterfly');
  }

  newBadges.forEach(badge => unlockBadge(badge));
  return newBadges;
}

// Activity tracking
export function trackAction(actionType) {
  const stats = getStats();
  
  switch (actionType) {
    case 'analyze':
      stats.analyses += 1;
      addXP(50);
      checkAndUnlockBadges();
      break;
    case 'rewrite':
      stats.rewrites += 1;
      addXP(30);
      checkAndUnlockBadges();
      break;
    case 'simulate':
      stats.simulations += 1;
      addXP(20);
      break;
    case 'share':
      stats.shares += 1;
      addXP(40);
      checkAndUnlockBadges();
      break;
  }

  stats.lastActive = new Date().toISOString();
  saveStats(stats);
  return stats;
}

// Get all stats
export function getFullStats() {
  const stats = getStats();
  const streak = getStreak();
  const challenge = getChallengeDetails();

  return {
    ...stats,
    streak: streak.count,
    challenge,
    xpToNextLevel: 100 - (stats.xp % 100),
    xpThisLevel: stats.xp % 100,
    xpPerLevel: 100,
  };
}

export function resetAllStats() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STREAK_KEY);
    localStorage.removeItem(CHALLENGE_KEY);
  } catch (e) {
    console.error('Error resetting stats:', e);
  }
}
