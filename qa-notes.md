# QA Notes

## Dashboard Page
- Renders correctly with sidebar, stats, charts, activity feed
- Sidebar is slightly too narrow — nav labels are truncated (e.g., "Performan..." instead of "Performance")
- Department pie chart is not visible — only the legend shows
- Stats cards look good with icons and change badges
- Employee Growth area chart renders correctly
- Attrition Rate line chart renders correctly
- Recent Activity feed with avatars looks good
- Need to fix sidebar default width or check collapsed state

## Issues to Fix
1. Sidebar nav labels are being cut off — the sidebar might be defaulting to collapsed
2. Department pie chart not rendering in the visible area — might need layout adjustment
