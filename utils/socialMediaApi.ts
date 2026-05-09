// Static social media follower counts - no database or API calls
interface SocialMediaStats {
  instagram?: number;
  tiktok?: number;
  twitter?: number;
  whatsapp?: number;
}

// Instagram follower count - static value
export async function getInstagramFollowers(username: string): Promise<number> {
  // Static value as requested: 21.3K = 21300
  return 21300;
}

// TikTok follower count - static value
export async function getTikTokFollowers(username: string): Promise<number> {
  // Static value as requested: 42.3K = 42300
  return 42300;
}

// Twitter/X follower count - static value
export async function getTwitterFollowers(username: string): Promise<number> {
  // Static value as requested: 57.2K = 57200
  return 57200;
}

// WhatsApp channel subscriber count - static value
export async function getWhatsAppSubscribers(): Promise<number> {
  // Static value: 9.1K = 9100
  return 9100;
}

// Main function to get all social media stats - returns static values
export async function getAllSocialMediaStats(): Promise<SocialMediaStats> {
  // Return static values directly - no API calls
  return {
    instagram: 21300,  // 21.3K
    tiktok: 42300,     // 42.3K
    twitter: 57200,    // 57.2K
    whatsapp: 9100     // 9.1K
  };
}

// Format follower count for display
export function formatFollowerCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M+`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K+`;
  } else {
    return count.toString();
  }
}

// Get social media stats - returns static values (no cache needed)
export async function getCachedSocialMediaStats(): Promise<SocialMediaStats> {
  // Return static values directly - no cache needed
  return getAllSocialMediaStats();
}
