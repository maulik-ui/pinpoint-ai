/**
 * Domain Scoring System
 * Calculates overall domain score (0-10) based on Domain Rank Overview and Backlinks data
 */

import type {
  DomainRankOverviewData,
  BacklinksData,
} from './dataforseo';

export interface DomainScoreBreakdown {
  traffic_score: number; // 0-10
  visibility_score: number; // 0-10
  authority_score: number; // 0-10
  quality_score: number; // 0-10
  overall_score: number; // 0-10
  details: {
    traffic_reason: string;
    visibility_reason: string;
    authority_reason: string;
    quality_reason: string;
  };
}

/**
 * Calculate domain score based on available metrics
 */
export function calculateDomainScore(
  domainRankOverview: DomainRankOverviewData | null,
  backlinks: BacklinksData | null
): DomainScoreBreakdown {
  const scores = {
    traffic_score: 0,
    visibility_score: 0,
    authority_score: 0,
    quality_score: 0,
  };

  const reasons = {
    traffic_reason: '',
    visibility_reason: '',
    authority_reason: '',
    quality_reason: '',
  };

  // Debug logging
  console.log('[Domain Score] Calculating with:', {
    hasDomainRankOverview: !!domainRankOverview,
    hasBacklinks: !!backlinks,
    etv: domainRankOverview?.organic_etv,
    keywords: domainRankOverview?.organic_keywords,
    rank: backlinks?.rank,
    referringDomains: backlinks?.referring_domains,
  });

  // 1. Traffic Score (0-10) - Based on Estimated Traffic Value (ETV)
  if (domainRankOverview?.organic_etv) {
    const etv = domainRankOverview.organic_etv;
    // Logarithmic scale: 1M+ = 10, 500K+ = 9, 100K+ = 8, 50K+ = 7, 10K+ = 6, 5K+ = 5, 1K+ = 4, <1K = 2
    if (etv >= 1000000) {
      scores.traffic_score = 10;
      reasons.traffic_reason = `Excellent traffic (${(etv / 1000000).toFixed(1)}M ETV)`;
    } else if (etv >= 500000) {
      scores.traffic_score = 9;
      reasons.traffic_reason = `Very high traffic (${(etv / 1000).toFixed(0)}K ETV)`;
    } else if (etv >= 100000) {
      scores.traffic_score = 8;
      reasons.traffic_reason = `High traffic (${(etv / 1000).toFixed(0)}K ETV)`;
    } else if (etv >= 50000) {
      scores.traffic_score = 7;
      reasons.traffic_reason = `Good traffic (${(etv / 1000).toFixed(0)}K ETV)`;
    } else if (etv >= 10000) {
      scores.traffic_score = 6;
      reasons.traffic_reason = `Moderate traffic (${(etv / 1000).toFixed(0)}K ETV)`;
    } else if (etv >= 5000) {
      scores.traffic_score = 5;
      reasons.traffic_reason = `Low-moderate traffic (${etv.toLocaleString()} ETV)`;
    } else if (etv >= 1000) {
      scores.traffic_score = 4;
      reasons.traffic_reason = `Low traffic (${etv.toLocaleString()} ETV)`;
    } else {
      scores.traffic_score = 2;
      reasons.traffic_reason = `Very low traffic (${etv.toLocaleString()} ETV)`;
    }
  } else {
    reasons.traffic_reason = 'No traffic data available';
  }

  // 2. Visibility Score (0-10) - Based on keyword count and position distribution
  if (domainRankOverview) {
    const keywords = domainRankOverview.organic_keywords || 0;
    const pos = domainRankOverview.position_distribution;
    
    // Calculate top positions
    const top3 = (pos.pos_1 || 0) + (pos.pos_2_3 || 0);
    const top10 = top3 + (pos.pos_4_10 || 0);
    const top20 = top10 + (pos.pos_11_20 || 0);
    
    // Base score from keyword count (logarithmic scale)
    let baseScore = 0;
    if (keywords >= 50000) {
      baseScore = 10;
    } else if (keywords >= 20000) {
      baseScore = 9;
    } else if (keywords >= 10000) {
      baseScore = 8;
    } else if (keywords >= 5000) {
      baseScore = 7;
    } else if (keywords >= 2000) {
      baseScore = 6;
    } else if (keywords >= 1000) {
      baseScore = 5;
    } else if (keywords >= 500) {
      baseScore = 4;
    } else if (keywords >= 100) {
      baseScore = 3;
    } else if (keywords >= 10) {
      baseScore = 2;
    } else if (keywords > 0) {
      baseScore = 1;
    }
    
    // Bonus for top rankings
    if (keywords > 0) {
      const top3Ratio = top3 / keywords;
      const top10Ratio = top10 / keywords;
      
      if (top3Ratio >= 0.05) { // 5%+ in top 3
        baseScore = Math.min(10, baseScore + 2);
      } else if (top3Ratio >= 0.02) { // 2%+ in top 3
        baseScore = Math.min(10, baseScore + 1);
      } else if (top10Ratio >= 0.1) { // 10%+ in top 10
        baseScore = Math.min(10, baseScore + 0.5);
      }
    }
    
    scores.visibility_score = Math.min(10, baseScore);
    reasons.visibility_reason = `${keywords.toLocaleString()} keywords ranking (${top3} in top 3, ${top10} in top 10)`;
  } else {
    reasons.visibility_reason = 'No visibility data available';
  }

  // 3. Authority Score (0-10) - Based on domain rank and referring domains
  if (backlinks) {
    const rank = backlinks.rank || 0;
    const referringDomains = backlinks.referring_domains || 0;
    
    // Domain rank is 0-100, convert to 0-10 scale
    let authorityScore = (rank / 10);
    
    // Bonus for referring domains
    if (referringDomains >= 10000) {
      authorityScore = Math.min(10, authorityScore + 1);
    } else if (referringDomains >= 5000) {
      authorityScore = Math.min(10, authorityScore + 0.5);
    } else if (referringDomains >= 1000) {
      authorityScore = Math.min(10, authorityScore + 0.25);
    }
    
    scores.authority_score = Math.min(10, Math.max(0, authorityScore));
    reasons.authority_reason = `Domain rank: ${rank}/100, ${referringDomains.toLocaleString()} referring domains`;
  } else {
    reasons.authority_reason = 'No authority data available';
  }

  // 4. Quality Score (0-10) - Based on backlink count and referring domains
  if (backlinks) {
    const backlinksCount = backlinks.backlinks || 0;
    const referringDomains = backlinks.referring_domains || 0;
    
    let qualityScore = 5; // Start neutral
    
    // Score based on backlink count (indicates domain authority and trust)
    if (backlinksCount >= 500000) {
      qualityScore = 10; // Excellent
    } else if (backlinksCount >= 200000) {
      qualityScore = 9; // Very good
    } else if (backlinksCount >= 100000) {
      qualityScore = 8; // Good
    } else if (backlinksCount >= 50000) {
      qualityScore = 7; // Fair
    } else if (backlinksCount >= 10000) {
      qualityScore = 6; // Moderate
    } else if (backlinksCount >= 5000) {
      qualityScore = 5; // Average
    } else if (backlinksCount >= 1000) {
      qualityScore = 4; // Below average
    } else if (backlinksCount >= 100) {
      qualityScore = 3; // Low
    } else {
      qualityScore = 2; // Very low
    }
    
    // Bonus for high referring domains (indicates diverse link sources)
    if (referringDomains >= 20000) {
      qualityScore = Math.min(10, qualityScore + 1);
    } else if (referringDomains >= 10000) {
      qualityScore = Math.min(10, qualityScore + 0.5);
    } else if (referringDomains >= 5000) {
      qualityScore = Math.min(10, qualityScore + 0.25);
    }
    
    scores.quality_score = Math.min(10, Math.max(0, qualityScore));
    reasons.quality_reason = `${backlinksCount.toLocaleString()} backlinks, ${referringDomains.toLocaleString()} referring domains`;
  } else {
    reasons.quality_reason = 'No quality data available';
  }

  // Calculate weighted overall score
  // Weights: Traffic (30%), Visibility (25%), Authority (25%), Quality (20%)
  const weights = {
    traffic: 0.30,
    visibility: 0.25,
    authority: 0.25,
    quality: 0.20,
  };

  // Count how many scores we have
  const availableScores = [
    scores.traffic_score > 0,
    scores.visibility_score > 0,
    scores.authority_score > 0,
    scores.quality_score > 0,
  ].filter(Boolean).length;

  // Adjust weights if some scores are missing
  if (availableScores < 4) {
    const totalWeight = weights.traffic + weights.visibility + weights.authority + weights.quality;
    const scale = 1 / totalWeight;
    weights.traffic *= scale;
    weights.visibility *= scale;
    weights.authority *= scale;
    weights.quality *= scale;
  }

  const overall_score = Math.round(
    (scores.traffic_score * weights.traffic +
     scores.visibility_score * weights.visibility +
     scores.authority_score * weights.authority +
     scores.quality_score * weights.quality) * 10
  ) / 10;

  // Debug logging
  console.log('[Domain Score] Calculated scores:', {
    traffic: scores.traffic_score,
    visibility: scores.visibility_score,
    authority: scores.authority_score.toFixed(2),
    quality: scores.quality_score.toFixed(2),
    overall: overall_score,
    weights,
  });

  return {
    ...scores,
    overall_score: Math.min(10, Math.max(0, overall_score)),
    details: reasons,
  };
}

