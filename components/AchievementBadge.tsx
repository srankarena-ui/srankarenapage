import { getTier, getTierColor } from "../lib/achievements";

export default function AchievementBadge({ achievement, userValue }: { achievement: any, userValue: number }) {
  const currentTier = getTier(userValue, achievement.tiers);
  const tierStyle = getTierColor(currentTier);
  
  // Find the next tier threshold
  const tierValues = Object.values(achievement.tiers) as number[];
  const nextTierValue = tierValues.find(v => v > userValue) || achievement.tiers.s_rank;
  const progress = Math.min((userValue / nextTierValue) * 100, 100);

  return (
    <div className={`relative p-6 rounded-[2rem] border-2 transition-all duration-500 ${tierStyle}`}>
      <div className="flex items-center gap-5">
        {/* Tier Icon / Rank Letter */}
        <div className={`w-14 h-14 rounded-full flex items-center justify-center font-black italic text-xl border-2 shadow-inner ${currentTier === 'locked' ? 'border-gray-800 text-gray-700' : 'border-current'}`}>
          {currentTier === 'locked' ? '?' : currentTier.charAt(0).toUpperCase()}
        </div>

        <div className="flex-1">
          <div className="flex justify-between items-end mb-1">
            <h4 className="font-black uppercase italic tracking-tighter text-white">{achievement.title}</h4>
            <span className="text-[9px] font-bold opacity-60 uppercase tracking-widest">{userValue} / {nextTierValue}</span>
          </div>
          <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest leading-none mb-3">
            {achievement.description}
          </p>
          
          {/* Progression Bar */}
          <div className="h-1 w-full bg-gray-900 rounded-full overflow-hidden">
            <div 
              className="h-full bg-current transition-all duration-1000" 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* S-Rank Achievement Badge */}
      {currentTier === 's_rank' && (
        <div className="absolute -top-2 -right-2 bg-[#A855F7] text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-tighter shadow-lg shadow-purple-900/40">
          Mastered
        </div>
      )}
    </div>
  );
}