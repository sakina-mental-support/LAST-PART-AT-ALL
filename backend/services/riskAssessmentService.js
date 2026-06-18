const Mood = require("../models/Mood");
const User = require("../models/User");
const Survey = require("../models/Survey");
const JournalEntry = require("../models/JournalEntry");
const { sendHighRiskAlertEmail } = require("./emailService");

/**
 * Risk Assessment Service
 * Integrates mood history, survey data, journal analysis, and behavioral patterns
 * to produce a comprehensive mental health risk profile for a user.
 */

// ── Risk Thresholds ──
const RISK_THRESHOLDS = {
  HIGH: { min: 70, label: "High Risk", color: "rose" },
  MEDIUM: { min: 40, label: "Medium Risk", color: "amber" },
  LOW: { min: 0, label: "Low Risk", color: "emerald" },
};

// ── Distress keywords for journal/note analysis ──
const DISTRESS_KEYWORDS = [
  "hopeless", "worthless", "suicide", "suicidal", "kill myself", "self-harm",
  "can't go on", "no point", "end it", "give up", "dying", "hurt myself",
  "panic", "can't breathe", "breaking down", "falling apart", "can't cope",
  "overwhelmed", "terrified", "numb", "empty", "alone", "isolated",
  "crying", "depressed", "anxious", "scared", "afraid", "nightmare",
  "insomnia", "can't sleep", "exhausted", "drained", "burnout",
];

const POSITIVE_KEYWORDS = [
  "happy", "grateful", "blessed", "hopeful", "better", "improving",
  "calm", "relaxed", "peaceful", "joyful", "motivated", "energized",
  "strong", "confident", "loved", "supported", "safe", "healing",
];

/**
 * Analyze text content for distress and positive signals
 */
const analyzeTextContent = (text) => {
  if (!text) return { distressScore: 0, positiveScore: 0, flaggedTerms: [] };
  
  const lowerText = text.toLowerCase();
  const flaggedTerms = [];
  let distressCount = 0;
  let positiveCount = 0;

  DISTRESS_KEYWORDS.forEach((keyword) => {
    if (lowerText.includes(keyword)) {
      distressCount++;
      flaggedTerms.push(keyword);
    }
  });

  POSITIVE_KEYWORDS.forEach((keyword) => {
    if (lowerText.includes(keyword)) {
      positiveCount++;
    }
  });

  return {
    distressScore: Math.min(100, distressCount * 15),
    positiveScore: Math.min(100, positiveCount * 12),
    flaggedTerms,
  };
};

/**
 * Calculate mood-based risk factors from mood history
 */
const calculateMoodRisk = async (userId) => {
  const now = new Date();

  // Last 7 days
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);

  // Last 30 days
  const monthAgo = new Date(now);
  monthAgo.setDate(monthAgo.getDate() - 30);

  const weeklyMoods = await Mood.find({
    user: userId,
    createdAt: { $gte: weekAgo },
  }).sort({ createdAt: -1 });

  const monthlyMoods = await Mood.find({
    user: userId,
    createdAt: { $gte: monthAgo },
  }).sort({ createdAt: -1 });

  if (monthlyMoods.length === 0) {
    return {
      weeklyAverage: null,
      monthlyAverage: null,
      trend: "insufficient_data",
      volatility: 0,
      consecutiveLowDays: 0,
      riskScore: 20, // Baseline unknown risk
      moodEntryCount: 0,
      recentMoods: [],
    };
  }

  // Weekly average
  const weeklyAvg =
    weeklyMoods.length > 0
      ? weeklyMoods.reduce((sum, m) => sum + m.moodLevel, 0) / weeklyMoods.length
      : null;

  // Monthly average
  const monthlyAvg =
    monthlyMoods.reduce((sum, m) => sum + m.moodLevel, 0) / monthlyMoods.length;

  // Mood volatility (standard deviation of last 7 days)
  let volatility = 0;
  if (weeklyMoods.length >= 2 && weeklyAvg !== null) {
    const squaredDiffs = weeklyMoods.map((m) => Math.pow(m.moodLevel - weeklyAvg, 2));
    volatility = Math.sqrt(squaredDiffs.reduce((sum, d) => sum + d, 0) / weeklyMoods.length);
  }

  // Consecutive low days (mood <= 3 out of 10)
  let consecutiveLowDays = 0;
  for (const mood of weeklyMoods) {
    if (mood.moodLevel <= 3) consecutiveLowDays++;
    else break;
  }

  // Trend analysis (comparing first half vs second half of month)
  const midpoint = Math.floor(monthlyMoods.length / 2);
  const recentHalf = monthlyMoods.slice(0, midpoint);
  const olderHalf = monthlyMoods.slice(midpoint);

  let trend = "stable";
  if (recentHalf.length > 0 && olderHalf.length > 0) {
    const recentAvg = recentHalf.reduce((s, m) => s + m.moodLevel, 0) / recentHalf.length;
    const olderAvg = olderHalf.reduce((s, m) => s + m.moodLevel, 0) / olderHalf.length;
    const diff = recentAvg - olderAvg;
    if (diff > 1) trend = "improving";
    else if (diff < -1) trend = "declining";
  }

  // Compute mood risk score (0-100, higher = more risk)
  let moodRiskScore = 0;

  // Low weekly average contributes heavily
  if (weeklyAvg !== null) {
    moodRiskScore += Math.max(0, (5 - weeklyAvg) * 12); // max +60
  }

  // Consecutive low days
  moodRiskScore += consecutiveLowDays * 8; // max +56

  // High volatility adds risk
  moodRiskScore += Math.min(20, volatility * 5);

  // Declining trend adds risk
  if (trend === "declining") moodRiskScore += 15;
  if (trend === "improving") moodRiskScore -= 10;

  // Analyze notes for distress keywords
  let noteDistress = 0;
  weeklyMoods.forEach((m) => {
    if (m.note) {
      const analysis = analyzeTextContent(m.note);
      noteDistress += analysis.distressScore;
    }
  });
  moodRiskScore += Math.min(25, noteDistress / Math.max(1, weeklyMoods.length));

  return {
    weeklyAverage: weeklyAvg ? Number(weeklyAvg.toFixed(2)) : null,
    monthlyAverage: Number(monthlyAvg.toFixed(2)),
    trend,
    volatility: Number(volatility.toFixed(2)),
    consecutiveLowDays,
    riskScore: Math.min(100, Math.max(0, Math.round(moodRiskScore))),
    moodEntryCount: monthlyMoods.length,
    recentMoods: weeklyMoods.slice(0, 7).map((m) => ({
      level: m.moodLevel,
      note: m.note || null,
      date: m.createdAt,
    })),
  };
};

/**
 * Calculate survey-based risk factors
 */
const calculateSurveyRisk = async (userId) => {
  const survey = await Survey.findOne({ user: userId });

  if (!survey) {
    return { hasSurvey: false, riskScore: 10, factors: [] };
  }

  let surveyRiskScore = 0;
  const factors = [];

  // Poor sleep quality (1-10 scale)
  if (survey.sleepQuality && survey.sleepQuality <= 3) {
    surveyRiskScore += 25;
    factors.push({ name: "Poor Sleep Quality", severity: "high", value: survey.sleepQuality });
  } else if (survey.sleepQuality && survey.sleepQuality <= 5) {
    surveyRiskScore += 12;
    factors.push({ name: "Moderate Sleep Issues", severity: "medium", value: survey.sleepQuality });
  }

  // Low social level (1-10 scale)
  if (survey.socialLevel && survey.socialLevel <= 3) {
    surveyRiskScore += 20;
    factors.push({ name: "Social Isolation", severity: "high", value: survey.socialLevel });
  } else if (survey.socialLevel && survey.socialLevel <= 5) {
    surveyRiskScore += 10;
    factors.push({ name: "Limited Social Connection", severity: "medium", value: survey.socialLevel });
  }

  // Many stress triggers
  if (survey.stressTriggers && survey.stressTriggers.length >= 4) {
    surveyRiskScore += 15;
    factors.push({ name: "Multiple Stress Triggers", severity: "medium", value: survey.stressTriggers.length });
  }

  // Few coping methods
  if (survey.copingMethods && survey.copingMethods.length <= 1) {
    surveyRiskScore += 15;
    factors.push({ name: "Limited Coping Strategies", severity: "medium", value: survey.copingMethods.length });
  }

  return {
    hasSurvey: true,
    riskScore: Math.min(100, surveyRiskScore),
    factors,
    sleepQuality: survey.sleepQuality || null,
    socialLevel: survey.socialLevel || null,
    stressTriggers: survey.stressTriggers || [],
    copingMethods: survey.copingMethods || [],
  };
};

/**
 * Calculate journal-based risk factors
 */
const calculateJournalRisk = async (userId) => {
  const recentEntries = await JournalEntry.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(10);

  if (recentEntries.length === 0) {
    return { hasJournal: false, riskScore: 0, flaggedTerms: [], entryCount: 0 };
  }

  let totalDistress = 0;
  let totalPositive = 0;
  const allFlaggedTerms = new Set();

  recentEntries.forEach((entry) => {
    const analysis = analyzeTextContent(entry.text);
    totalDistress += analysis.distressScore;
    totalPositive += analysis.positiveScore;
    analysis.flaggedTerms.forEach((term) => allFlaggedTerms.add(term));
  });

  const avgDistress = totalDistress / recentEntries.length;
  const avgPositive = totalPositive / recentEntries.length;

  // Net risk from journal: distress minus protective positive signals
  const netRisk = Math.max(0, avgDistress - avgPositive * 0.5);

  return {
    hasJournal: true,
    riskScore: Math.min(100, Math.round(netRisk)),
    flaggedTerms: [...allFlaggedTerms],
    entryCount: recentEntries.length,
    averageDistress: Math.round(avgDistress),
    averagePositive: Math.round(avgPositive),
  };
};

/**
 * Generate risk-appropriate recommendations
 */
const generateRecommendations = (overallRisk, moodRisk, surveyRisk) => {
  const recommendations = [];

  if (overallRisk >= 70) {
    recommendations.push({
      priority: "critical",
      icon: "emergency",
      title: "Seek Professional Support",
      description: "Your assessment indicates elevated distress. Consider reaching out to a mental health professional or crisis helpline.",
    });
    recommendations.push({
      priority: "high",
      icon: "self_improvement",
      title: "Daily Grounding Exercises",
      description: "Practice the 4-7-8 breathing technique or body scan meditation at least twice daily.",
    });
  }

  if (moodRisk.consecutiveLowDays >= 3) {
    recommendations.push({
      priority: "high",
      icon: "mood",
      title: "Break the Low Mood Cycle",
      description: "Try scheduling one small positive activity each day — even a 10-minute walk.",
    });
  }

  if (surveyRisk.factors?.some((f) => f.name.includes("Sleep"))) {
    recommendations.push({
      priority: "medium",
      icon: "bedtime",
      title: "Improve Sleep Hygiene",
      description: "Maintain a consistent sleep schedule. Avoid screens 1 hour before bed.",
    });
  }

  if (surveyRisk.factors?.some((f) => f.name.includes("Social"))) {
    recommendations.push({
      priority: "medium",
      icon: "group",
      title: "Strengthen Social Connections",
      description: "Reach out to one trusted person this week. Even a short message counts.",
    });
  }

  if (moodRisk.trend === "declining") {
    recommendations.push({
      priority: "medium",
      icon: "trending_down",
      title: "Address the Downward Trend",
      description: "Your mood has been declining. Journaling and therapy sessions can help reverse this pattern.",
    });
  }

  if (overallRisk < 40) {
    recommendations.push({
      priority: "low",
      icon: "spa",
      title: "Maintain Your Well-Being",
      description: "You're doing well! Continue your current practices and stay consistent with mood tracking.",
    });
  }

  // Always include tracking recommendation
  if (moodRisk.moodEntryCount < 5) {
    recommendations.push({
      priority: "medium",
      icon: "edit_note",
      title: "Track More Consistently",
      description: "Log your mood daily for more accurate insights. Consistency is key to understanding patterns.",
    });
  }

  return recommendations.slice(0, 5); // Max 5 recommendations
};

/**
 * Main assessment function — produces a comprehensive risk profile
 */
const getRiskAssessment = async (userId) => {
  const user = await User.findById(userId).select("-password");

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  // Run all risk calculations in parallel
  const [moodRisk, surveyRisk, journalRisk] = await Promise.all([
    calculateMoodRisk(userId),
    calculateSurveyRisk(userId),
    calculateJournalRisk(userId),
  ]);

  // Weighted composite score
  // Mood data is weighted most heavily as the primary signal
  const weights = { mood: 0.50, survey: 0.25, journal: 0.25 };
  const overallRisk = Math.round(
    moodRisk.riskScore * weights.mood +
    surveyRisk.riskScore * weights.survey +
    journalRisk.riskScore * weights.journal
  );

  // Determine risk level
  let riskLevel;
  if (overallRisk >= RISK_THRESHOLDS.HIGH.min) riskLevel = RISK_THRESHOLDS.HIGH;
  else if (overallRisk >= RISK_THRESHOLDS.MEDIUM.min) riskLevel = RISK_THRESHOLDS.MEDIUM;
  else riskLevel = RISK_THRESHOLDS.LOW;

  const isHighRisk = overallRisk >= RISK_THRESHOLDS.HIGH.min;
  const wasHighRisk = user.isHighRisk;
  if (user.isHighRisk !== isHighRisk) {
    await User.findByIdAndUpdate(userId, { isHighRisk });
  }

  // 🚨 Send high-risk alert email if user just transitioned to high risk
  if (isHighRisk && !wasHighRisk && user.emergencyContact?.email) {
    // Fire-and-forget: don't block the assessment response
    sendHighRiskAlertEmail(user, overallRisk).catch((err) => {
      console.error("🚨 Failed to send high-risk alert email:", err.message);
    });
  }

  // Generate tailored recommendations
  const recommendations = generateRecommendations(overallRisk, moodRisk, surveyRisk);

  return {
    user: {
      id: user._id,
      name: user.name,
      isHighRisk,
    },
    overallRisk,
    riskLevel: riskLevel.label,
    riskColor: riskLevel.color,
    assessedAt: new Date().toISOString(),
    breakdown: {
      mood: {
        score: moodRisk.riskScore,
        weight: `${weights.mood * 100}%`,
        weeklyAverage: moodRisk.weeklyAverage,
        monthlyAverage: moodRisk.monthlyAverage,
        trend: moodRisk.trend,
        volatility: moodRisk.volatility,
        consecutiveLowDays: moodRisk.consecutiveLowDays,
        entryCount: moodRisk.moodEntryCount,
        recentMoods: moodRisk.recentMoods,
      },
      survey: {
        score: surveyRisk.riskScore,
        weight: `${weights.survey * 100}%`,
        hasSurvey: surveyRisk.hasSurvey,
        factors: surveyRisk.factors || [],
        sleepQuality: surveyRisk.sleepQuality,
        socialLevel: surveyRisk.socialLevel,
      },
      journal: {
        score: journalRisk.riskScore,
        weight: `${weights.journal * 100}%`,
        hasJournal: journalRisk.hasJournal,
        entryCount: journalRisk.entryCount,
        flaggedTerms: journalRisk.flaggedTerms || [],
      },
    },
    recommendations,
  };
};

module.exports = {
  getRiskAssessment,
};
