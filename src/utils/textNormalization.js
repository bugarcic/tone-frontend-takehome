/**
 * Normalize text for comparison
 * - Converts to lowercase
 * - Converts hyphens to spaces (so "hi-hats" becomes "hi hats")
 * - Removes other punctuation
 * - Trims whitespace
 * - Splits into words
 */
export function normalizeText(text) {
  if (!text) return [];
  
  return text
    .toLowerCase()
    .replace(/-/g, ' ')        // Convert hyphens to spaces
    .replace(/[^\w\s']/g, '')  // Remove other punctuation, keep apostrophes
    .trim()
    .split(/\s+/)
    .filter(word => word.length > 0);
}

/**
 * Check if a compound word matches split words
 * e.g., "highhats" matches ["high", "hats"]
 */
function matchesCompound(targetWord, spokenWords, startIdx) {
  // Try combining 2-3 consecutive spoken words
  for (let len = 2; len <= 3 && startIdx + len <= spokenWords.length; len++) {
    const combined = spokenWords.slice(startIdx, startIdx + len).join('');
    if (combined === targetWord) {
      return len; // Return how many words were consumed
    }
  }
  return 0;
}

/**
 * Check if split target words match a compound spoken word
 * e.g., ["high", "hats"] matches "highhats"
 */
function matchesSplit(targetWords, startIdx, spokenWord) {
  // Try combining 2-3 consecutive target words
  for (let len = 2; len <= 3 && startIdx + len <= targetWords.length; len++) {
    const combined = targetWords.slice(startIdx, startIdx + len).join('');
    if (combined === spokenWord) {
      return len; // Return how many target words were matched
    }
  }
  return 0;
}

/**
 * Find the next sync point between target and spoken arrays
 * Returns { targetSkip, spokenSkip } or null if no sync found
 */
function findSyncPoint(targetWords, spokenWords, targetIdx, spokenIdx, maxLookAhead = 5) {
  // Look for a matching word within the next few words of both arrays
  for (let tOffset = 0; tOffset <= maxLookAhead && targetIdx + tOffset < targetWords.length; tOffset++) {
    for (let sOffset = 0; sOffset <= maxLookAhead && spokenIdx + sOffset < spokenWords.length; sOffset++) {
      // Skip the (0,0) case - that's the current position which already didn't match
      if (tOffset === 0 && sOffset === 0) continue;
      
      if (targetWords[targetIdx + tOffset] === spokenWords[spokenIdx + sOffset]) {
        return { targetSkip: tOffset, spokenSkip: sOffset };
      }
    }
  }
  return null;
}

/**
 * Compare two arrays of words using smart alignment
 * Handles word splits like "highhats" vs "high hats"
 * Also handles speech recognition errors by finding sync points
 * @param {string[]} targetWords - The original tongue twister words
 * @param {string[]} spokenWords - The transcribed spoken words
 * @returns {{
 *   results: Array<{word: string, status: 'correct' | 'incorrect' | 'pending', spoken?: string}>,
 *   stats: { totalSpoken: number, extraWords: number, correctMatches: number }
 * }}
 */
export function compareWords(targetWords, spokenWords) {
  if (spokenWords.length === 0) {
    // Nothing spoken yet - all pending
    return {
      results: targetWords.map(word => ({ word, status: 'pending' })),
      stats: { totalSpoken: 0, extraWords: 0, correctMatches: 0 }
    };
  }

  const results = [];
  let targetIdx = 0;
  let spokenIdx = 0;
  let correctMatches = 0;
  
  while (targetIdx < targetWords.length) {
    const targetWord = targetWords[targetIdx];
    
    // Check if we've run out of spoken words
    if (spokenIdx >= spokenWords.length) {
      results.push({ word: targetWord, status: 'pending' });
      targetIdx++;
      continue;
    }
    
    const spokenWord = spokenWords[spokenIdx];
    
    // Case 1: Exact match
    if (targetWord === spokenWord) {
      results.push({ word: targetWord, status: 'correct' });
      correctMatches++;
      targetIdx++;
      spokenIdx++;
      continue;
    }
    
    // Case 2: Target word is compound, spoken is split (e.g., "highhats" vs "high hats")
    const compoundMatch = matchesCompound(targetWord, spokenWords, spokenIdx);
    if (compoundMatch > 0) {
      results.push({ word: targetWord, status: 'correct' });
      correctMatches++;
      targetIdx++;
      spokenIdx += compoundMatch;
      continue;
    }
    
    // Case 3: Target is split, spoken is compound (e.g., "high hats" vs "highhats")
    const splitMatch = matchesSplit(targetWords, targetIdx, spokenWord);
    if (splitMatch > 0) {
      // Mark all the split target words as correct
      for (let i = 0; i < splitMatch; i++) {
        results.push({ word: targetWords[targetIdx + i], status: 'correct' });
        correctMatches++;
      }
      targetIdx += splitMatch;
      spokenIdx++;
      continue;
    }
    
    // Case 4: Find next sync point
    // This handles cases where speech recognition adds/changes words
    const syncPoint = findSyncPoint(targetWords, spokenWords, targetIdx, spokenIdx);
    
    if (syncPoint) {
      // Mark skipped target words as incorrect
      for (let i = 0; i < syncPoint.targetSkip; i++) {
        const skippedTarget = targetWords[targetIdx + i];
        results.push({ 
          word: skippedTarget, 
          status: 'incorrect',
          spoken: spokenWords[spokenIdx + i] || '(missing)'
        });
      }
      
      // Skip over extra spoken words (these are tracked in stats)
      targetIdx += syncPoint.targetSkip;
      spokenIdx += syncPoint.spokenSkip;
      
      // Now we're at a match point - the next iteration will handle the match
      continue;
    }
    
    // Case 5: No sync point found - mark as incorrect and advance both
    results.push({ word: targetWord, status: 'incorrect', spoken: spokenWord });
    targetIdx++;
    spokenIdx++;
  }
  
  // Calculate extra words: spoken words beyond what was needed for target
  // If user said more words than target has, those are extra
  const extraWords = Math.max(0, spokenWords.length - targetWords.length);
  
  // Also count "wasted" words - words that were skipped during sync
  // This is approximated by: spokenIdx - correctMatches - (targetWords.length - correctMatches)
  // = spokenIdx - targetWords.length (when all targets processed)
  const wastedWords = Math.max(0, spokenIdx - targetWords.length);
  
  return {
    results,
    stats: {
      totalSpoken: spokenWords.length,
      extraWords: extraWords + wastedWords,
      correctMatches
    }
  };
}

/**
 * Calculate score as percentage of correct words
 */
export function calculateScore(results) {
  if (results.length === 0) return 0;
  
  const correctCount = results.filter(r => r.status === 'correct').length;
  return Math.round((correctCount / results.length) * 100);
}
