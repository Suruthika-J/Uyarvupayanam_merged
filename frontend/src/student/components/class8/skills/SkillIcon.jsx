import React from 'react'
import {
  FiMessageCircle, FiMic, FiBookOpen, FiMessageSquare, FiGrid, FiZap, FiMap, FiLock,
  FiCpu, FiMonitor, FiShield, FiTerminal, FiPenTool, FiEdit3, FiFeather, FiTool,
  FiUsers, FiHeart, FiShuffle, FiGitMerge, FiLifeBuoy, FiClock, FiDollarSign, FiActivity,
  FiTrash2, FiDroplet, FiSearch, FiBold, FiLink2, FiTarget, FiCompass,
} from 'react-icons/fi'

// Map the catalog's icon names (react-icons/fi) to components. Unknown names
// fall back to a generic target so the UI never breaks on a typo.
const REGISTRY = {
  FiMessageCircle, FiMic, FiBookOpen, FiMessageSquare, FiGrid, FiZap, FiMap, FiLock,
  FiCpu, FiMonitor, FiShield, FiTerminal, FiPenTool, FiEdit3, FiFeather, FiTool,
  FiUsers, FiHeart, FiShuffle, FiGitMerge, FiLifeBuoy, FiClock, FiDollarSign, FiActivity,
  FiTrash2, FiDroplet, FiSearch, FiBold, FiLink2, FiTarget, FiCompass,
}

export default function SkillIcon({ name, size = 22, color, style }) {
  const Icon = REGISTRY[name] || FiTarget
  return <Icon size={size} color={color} style={style} aria-hidden="true" />
}

export const MECHANIC_LABELS = {
  choice: 'Decide & respond',
  pattern: 'Spot the pattern',
  order: 'Arrange in order',
  sort: 'Sort into boxes',
  match: 'Match the pairs',
  decode: 'Break the code',
  speak: 'Speak it out',
  create: 'Create & explain',
}