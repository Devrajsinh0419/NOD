#!/bin/bash
# Midnight Brass Theme - Batch Color Replacement Script
# This applies the Midnight Brass color palette to all dashboard and UI components

REPLACEMENTS='s/bg-\[#141414\]/bg-[#1A1714]/g;s/bg-\[#181818\]/bg-[#221F1A]/g;s/border-white\/6/border-[#C9A96E]\/8/g;s/border-white\/5/border-[#C9A96E]\/6/g;s/border-white\/3/border-[#C9A96E]\/4/g;s/hover:border-white\/12/hover:border-[#C9A96E]\/18/g;s/hover:border-white\/10/hover:border-[#C9A96E]\/15/g;s/border-white\/10/border-[#C9A96E]\/12/g;s/focus:border-white\/25/focus:border-[#C9A96E]\/30/g;s/focus:border-white\/20/focus:border-[#C9A96E]\/25/g;s/bg-white\/5/bg-[#C9A96E]\/5/g;s/bg-white\/3/bg-[#C9A96E]\/3/g;s/bg-white\/4/bg-[#C9A96E]\/4/g;s/hover:bg-white\/5/hover:bg-[#C9A96E]\/8/g;s/hover:bg-white\/3/hover:bg-[#C9A96E]\/5/g;s/hover:bg-white\/10/hover:bg-[#C9A96E]\/12/g;s/bg-white text-black/bg-[#C9A96E] text-[#0D0D0D]/g;s/hover:bg-white\/95/hover:bg-[#B8944F]/g;s/hover:bg-white\/90/hover:bg-[#B8944F]/g;s/text-white\/50/text-[#8B7355]/g;s/text-white\/40/text-[#8B7355]/g;s/text-white\/30/text-[#6B5A42]/g;s/text-white\/25/text-[#6B5A42]/g;s/text-white\/20/text-[#6B5A42]/g;s/text-white\/15/text-[#5A4A35]/g;s/text-amber-400\/90/text-[#C9A96E]/g;s/text-emerald-400\/80/text-[#8AA86E]/g;s/text-red-400\/80/text-[#C45C4D]/g;s/bg-red-400\/5/bg-[#C45C4D]\/5/g;s/border-red-400\/10/border-[#C45C4D]\/10/g;s/border-t-white\/40/border-t-[#C9A96E]\/50/g;s/border-t-white\/50/border-t-[#C9A96E]\/60/g'

FILES=(
  "src/components/dashboard/SocializeFeed.tsx"
  "src/components/dashboard/ProfessionalDashboard.tsx"
  "src/components/dashboard/ChatView.tsx"
  "src/components/dashboard/WalletView.tsx"
  "src/components/dashboard/UserProfile.tsx"
  "src/components/dashboard/ProfessionalProjects.tsx"
  "src/components/dashboard/ProfessionalMarketplace.tsx"
  "src/components/dashboard/ProjectForm.tsx"
  "src/app/dashboard/client/page.tsx"
  "src/app/dashboard/client/projects/page.tsx"
  "src/components/marketplace/project-card/MarketplaceProjectCard.tsx"
  "src/components/ui/StatusBadge.tsx"
  "src/components/ui/FileUploadZone.tsx"
  "src/components/ui/TagInput.tsx"
  "src/app/public/marketplace/page.tsx"
  "src/app/public/marketplace/projects/page.tsx"
  "src/app/public/marketplace/designers/page.tsx"
  "src/app/public/marketplace/loading.tsx"
)

for f in "${FILES[@]}"; do
  if [ -f "$f" ]; then
    sed -i "$REPLACEMENTS" "$f"
    echo "✓ Updated: $f"
  else
    echo "✗ Not found: $f"
  fi
done

# Also update marketplace detail pages if they exist
for f in src/app/public/marketplace/projects/*/page.tsx src/app/public/marketplace/designers/*/page.tsx; do
  if [ -f "$f" ]; then
    sed -i "$REPLACEMENTS" "$f"
    echo "✓ Updated: $f"
  fi
done

echo ""
echo "✅ Midnight Brass theme applied to all components!"
