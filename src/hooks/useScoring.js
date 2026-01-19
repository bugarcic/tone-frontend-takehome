import { useMemo } from 'react';
import { normalizeText, compareWords, calculateScore } from '../utils/textNormalization';

/**
 * Calculate speed score based on words per minute
 * Target: ~150 WPM is considered good for tongue twisters
 */
function calculateSpeedScore(wordCount, durationSeconds) {
  if (!durationSeconds || durationSeconds <= 0 || wordCount <= 0) return 0;
  
  const wpm = (wordCount / durationSeconds) * 60;
  
  // Ideal range: 100-200 WPM for tongue twisters
  // Score drops off if too slow or too fast
  if (wpm >= 100 && wpm <= 200) {
    return 100;
  } else if (wpm < 100) {
    // Too slow: linear dropoff
    return Math.max(0, Math.round((wpm / 100) * 100));
  } else {
    // Too fast (might indicate skipping): gradual dropoff
    return Math.max(0, Math.round(100 - ((wpm - 200) / 100) * 50));
  }
}

/**
 * Calculate fluency based on:
 * 1. Longest streak of correct words
 * 2. Penalty for extra/repeated words (stuttering)
 */
function calculateFluencyScore(results, extraWords, targetWordCount) {
  if (results.length === 0) return 0;
  
  // Count consecutive correct words (longest streak)
  let maxStreak = 0;
  let currentStreak = 0;
  
  for (const result of results) {
    if (result.status === 'correct') {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else if (result.status === 'incorrect') {
      currentStreak = 0;
    }
  }
  
  // Base fluency from streak
  const streakScore = Math.round((maxStreak / results.length) * 100);
  
  // Penalty for extra words (stuttering/repetition)
  // Each extra word reduces fluency by 10%, max 70% penalty
  const extraPenalty = Math.min(70, extraWords * 10);
  
  return Math.max(0, streakScore - extraPenalty);
}

/**
 * Calculate completion score (how much of the twister was attempted)
 */
function calculateCompletionScore(results) {
  if (results.length === 0) return 0;
  
  const attempted = results.filter(r => r.status !== 'pending').length;
  return Math.round((attempted / results.length) * 100);
}

/**
 * Calculate consistency (ratio of correct to incorrect among attempted)
 */
function calculateConsistencyScore(results) {
  const attempted = results.filter(r => r.status !== 'pending');
  if (attempted.length === 0) return 0;
  
  const correct = attempted.filter(r => r.status === 'correct').length;
  return Math.round((correct / attempted.length) * 100);
}

/**
 * Calculate rhythm score (based on consistent pacing)
 * Penalized by extra words (indicates hesitation/stuttering)
 */
function calculateRhythmScore(accuracy, speed, completion, extraWords) {
  // Don't calculate rhythm if nothing has been attempted
  if (accuracy === 0 && speed === 0 && completion === 0) {
    return 0;
  }
  
  // Rhythm is good when all three metrics are balanced
  const avg = (accuracy + speed + completion) / 3;
  const variance = Math.abs(accuracy - avg) + Math.abs(speed - avg) + Math.abs(completion - avg);
  const maxVariance = 200; // Maximum possible variance
  
  let rhythmScore = Math.max(0, Math.round(100 - (variance / maxVariance) * 100));
  
  // Penalty for extra words (stuttering disrupts rhythm)
  // Each extra word reduces rhythm by 8%, max 60% penalty
  const extraPenalty = Math.min(60, extraWords * 8);
  
  return Math.max(0, rhythmScore - extraPenalty);
}

export function useScoring(targetText, spokenText, duration) {
  const comparisonResult = useMemo(() => {
    const targetWords = normalizeText(targetText);
    const spokenWords = normalizeText(spokenText);
    
    return compareWords(targetWords, spokenWords);
  }, [targetText, spokenText]);

  const { results, stats } = comparisonResult;

  const scores = useMemo(() => {
    const targetWords = normalizeText(targetText);
    const spokenWords = normalizeText(spokenText);
    
    // Basic accuracy
    const accuracy = calculateScore(results);
    
    // Speed score
    const speed = calculateSpeedScore(spokenWords.length, duration);
    
    // Completion
    const completion = calculateCompletionScore(results);
    
    // Fluency (penalized by extra words)
    const fluency = calculateFluencyScore(results, stats.extraWords, targetWords.length);
    
    // Consistency
    const consistency = calculateConsistencyScore(results);
    
    // Rhythm (penalized by extra words)
    const rhythm = calculateRhythmScore(accuracy, speed, completion, stats.extraWords);
    
    return {
      accuracy,
      speed,
      completion,
      fluency,
      consistency,
      rhythm,
    };
  }, [targetText, spokenText, results, stats, duration]);

  const overallScore = useMemo(() => {
    const values = Object.values(scores).filter(v => v > 0);
    if (values.length === 0) return null;
    return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  }, [scores]);

  const isComplete = useMemo(() => {
    return results.length > 0 && results.every(r => r.status !== 'pending');
  }, [results]);

  return { 
    results, 
    scores, 
    overallScore, 
    isComplete,
    stats // Expose stats for potential UI display
  };
}
