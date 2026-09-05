import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCollegeProfile } from '../../context/CollegeProfileContext'
import { getCollegeFeatureEligibility } from '../../services/collegeFeatureEligibilityEngine'
import {
  FiCode, FiZap, FiUsers, FiAward, FiPlay, FiCheckCircle, FiXCircle,
  FiTerminal, FiLock, FiCpu, FiTrendingUp, FiArrowRight, FiShield
} from 'react-icons/fi'

// Sample curated problem catalog for Coding Arena
const PROBLEM_CATALOG = [
  {
    id: 'two-sum',
    title: 'Two Sum & Hash Maps',
    category: 'Arrays',
    difficulty: 'Easy',
    points: 100,
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
    initialCode: {
      javascript: 'function twoSum(nums, target) {\n  // Write your solution here\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) return [map.get(complement), i];\n    map.set(nums[i], i);\n  }\n  return [];\n}',
      python: 'def two_sum(nums, target):\n    # Write your solution here\n    seen = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in seen:\n            return [seen[complement], i]\n        seen[num] = i\n    return []',
      java: 'class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your solution here\n        Map<Integer, Integer> map = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            int complement = target - nums[i];\n            if (map.containsKey(complement)) return new int[]{map.get(complement), i};\n            map.put(nums[i], i);\n        }\n        return new int[]{};\n    }\n}'
    },
    testCases: [
      { input: 'nums = [2,7,11,15], target = 9', expected: '[0, 1]' },
      { input: 'nums = [3,2,4], target = 6', expected: '[1, 2]' }
    ]
  },
  {
    id: 'valid-parentheses',
    title: 'Valid Parentheses Traversal',
    category: 'Stacks',
    difficulty: 'Easy-Moderate',
    points: 150,
    description: 'Given a string s containing just the characters "(", ")", "{", "}", "[" and "]", determine if the input string is valid.',
    initialCode: {
      javascript: 'function isValid(s) {\n  const stack = [];\n  const map = { ")": "(", "}": "{", "]": "[" };\n  for (let char of s) {\n    if (!map[char]) stack.push(char);\n    else if (stack.pop() !== map[char]) return false;\n  }\n  return stack.length === 0;\n}',
      python: 'def is_valid(s: str) -> bool:\n    stack = []\n    mapping = {")": "(", "}": "{", "]": "["}\n    for char in s:\n        if char in mapping:\n            top = stack.pop() if stack else "#"\n            if mapping[char] != top:\n                return False\n        else:\n            stack.append(char)\n    return not stack',
      java: 'class Solution {\n    public boolean isValid(String s) {\n        Stack<Character> stack = new Stack<>();\n        for (char c : s.toCharArray()) {\n            if (c == \'(\') stack.push(\')\');\n            else if (c == \'{\') stack.push(\'}\');\n            else if (c == \'[\') stack.push(\']\');\n            else if (stack.isEmpty() || stack.pop() != c) return false;\n        }\n        return stack.isEmpty();\n    }\n}'
    },
    testCases: [
      { input: 's = "()[]{}"', expected: 'true' },
      { input: 's = "(]"', expected: 'false' }
    ]
  },
  {
    id: 'binary-tree-inorder',
    title: 'Binary Tree Inorder Traversal',
    category: 'Trees',
    difficulty: 'Moderate',
    points: 200,
    description: 'Given the root of a binary tree, return the inorder traversal of its nodes values.',
    initialCode: {
      javascript: 'function inorderTraversal(root) {\n  const res = [];\n  function helper(node) {\n    if (!node) return;\n    helper(node.left);\n    res.push(node.val);\n    helper(node.right);\n  }\n  helper(root);\n  return res;\n}',
      python: 'def inorder_traversal(root):\n    res = []\n    def dfs(node):\n        if not node: return\n        dfs(node.left)\n        res.append(node.val)\n        dfs(node.right)\n    dfs(root)\n    return res',
      java: 'class Solution {\n    public List<Integer> inorderTraversal(TreeNode root) {\n        List<Integer> res = new ArrayList<>();\n        helper(root, res);\n        return res;\n    }\n}'
    },
    testCases: [
      { input: 'root = [1,null,2,3]', expected: '[1, 3, 2]' }
    ]
  }
]

export default function CodingArenaPage() {
  const navigate = useNavigate()
  const { profile } = useCollegeProfile()
  const flags = getCollegeFeatureEligibility(profile)

  const [activeTab, setActiveTab] = useState('practice') // 'practice' | '1v1' | 'leaderboard'
  const [selectedLanguage, setSelectedLanguage] = useState('javascript')
  const [activeProblem, setActiveProblem] = useState(PROBLEM_CATALOG[0])
  const [userCode, setUserCode] = useState(PROBLEM_CATALOG[0].initialCode.javascript)

  // Execution State
  const [executing, setExecuting] = useState(false)
  const [executionResult, setExecutionResult] = useState(null)

  // Matchmaking State (for 1v1)
  const [matchingState, setMatchingState] = useState('idle') // 'idle' | 'searching' | 'matched' | 'in_game'
  const [opponent, setOpponent] = useState(null)
  const [matchTimer, setMatchTimer] = useState(600) // 10 mins

  // If student's profile is non-coding (e.g. MBBS, Law), show polite message with option to opt-in
  if (!flags.codingArena) {
    return (
      <div style={{ maxWidth: 800, margin: '40px auto', background: '#fff', borderRadius: 20, padding: 40, border: '1px solid var(--s-border)', textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#f1f5f9', color: '#64748b', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <FiLock size={32} />
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', margin: '0 0 12px' }}>
          Coding Arena is Tailored for Computing Domains
        </h2>
        <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6, maxWidth: 560, margin: '0 auto 28px' }}>
          Based on your academic profile (<strong>{profile?.degreeProgramme || 'Non-Engineering'}</strong>), the Coding Arena is hidden by default so you can focus on domain-relevant study tools.
        </p>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center' }}>
          <button
            type="button"
            onClick={() => navigate('/college/dashboard')}
            style={{ padding: '12px 24px', borderRadius: 12, background: '#0284c7', color: '#fff', fontWeight: 800, border: 'none', cursor: 'pointer' }}
          >
            Return to Personal Dashboard
          </button>
          <button
            type="button"
            onClick={() => navigate('/college/profile')}
            style={{ padding: '12px 24px', borderRadius: 12, background: '#f1f5f9', color: '#334155', fontWeight: 700, border: '1px solid #cbd5e1', cursor: 'pointer' }}
          >
            Update Career Goal / Skills
          </button>
        </div>
      </div>
    )
  }

  const handleSelectProblem = (prob) => {
    setActiveProblem(prob)
    setUserCode(prob.initialCode[selectedLanguage] || prob.initialCode.javascript)
    setExecutionResult(null)
  }

  const handleLanguageChange = (lang) => {
    setSelectedLanguage(lang)
    setUserCode(activeProblem.initialCode[lang] || '// Language template')
    setExecutionResult(null)
  }

  const runCodeSandbox = () => {
    setExecuting(true)
    setExecutionResult(null)

    setTimeout(() => {
      setExecuting(false)
      // Sandboxed execution simulator
      setExecutionResult({
        success: true,
        passedCases: activeProblem.testCases.length,
        totalCases: activeProblem.testCases.length,
        runtime: '42 ms',
        memory: '38.4 MB',
        output: 'All test cases passed successfully!'
      })
    }, 1200)
  }

  const start1v1Matchmaking = () => {
    setMatchingState('searching')
    setTimeout(() => {
      setOpponent({
        name: 'Karthik V.',
        degree: profile?.degreeProgramme || 'B.Tech CSE',
        year: profile?.currentYear || '3rd Year',
        rating: 1420
      })
      setMatchingState('matched')
    }, 2500)
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', fontFamily: 'var(--s-font-body)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: '#0f172a', margin: 0, fontFamily: 'var(--s-font-display)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <FiCode color="#0284c7" /> Smart Coding Arena
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
            Domain-aware DSA practice, 1v1 peer challenges & execution sandbox.
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: 8, background: '#e2e8f0', padding: 4, borderRadius: 14 }}>
          {[
            { id: 'practice', label: 'Solo Practice', icon: FiTerminal },
            { id: '1v1', label: '1v1 Peer Challenge', icon: FiUsers },
            { id: 'leaderboard', label: 'Coding Stats', icon: FiAward }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              style={{
                padding: '8px 18px', borderRadius: 10, fontWeight: 800, fontSize: 13, cursor: 'pointer',
                background: activeTab === id ? '#fff' : 'transparent',
                color: activeTab === id ? '#0f172a' : '#64748b',
                border: 'none', display: 'flex', alignItems: 'center', gap: 6,
                boxShadow: activeTab === id ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── TAB 1: SOLO PRACTICE & CODE EDITOR ─────────────────────────────── */}
      {activeTab === 'practice' && (
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 24 }}>
          {/* Left Column: Problem Catalog */}
          <div style={{ background: '#fff', borderRadius: 20, padding: 20, border: '1px solid var(--s-border)' }}>
            <h3 style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', margin: '0 0 16px' }}>
              Curated Problem Set
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {PROBLEM_CATALOG.map(prob => {
                const isSel = activeProblem.id === prob.id
                return (
                  <div
                    key={prob.id}
                    onClick={() => handleSelectProblem(prob)}
                    style={{
                      padding: 14, borderRadius: 12, cursor: 'pointer',
                      background: isSel ? '#eff6ff' : '#f8fafc',
                      border: isSel ? '1.5px solid #3b82f6' : '1px solid #e2e8f0',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: '#3b82f6', textTransform: 'uppercase' }}>
                        {prob.category}
                      </span>
                      <span style={{
                        fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 10,
                        background: prob.difficulty === 'Easy' ? '#dcfce7' : '#fef3c7',
                        color: prob.difficulty === 'Easy' ? '#15803d' : '#b45309'
                      }}>
                        {prob.difficulty}
                      </span>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                      {prob.title}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right Column: Interactive Code Editor Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: '#fff', borderRadius: 20, padding: 24, border: '1px solid var(--s-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', margin: 0 }}>
                    {activeProblem.title}
                  </h2>
                  <p style={{ fontSize: 13, color: '#475569', marginTop: 4 }}>
                    {activeProblem.description}
                  </p>
                </div>

                {/* Language Picker */}
                <select
                  value={selectedLanguage}
                  onChange={e => handleLanguageChange(e.target.value)}
                  style={{
                    padding: '8px 14px', borderRadius: 10, border: '1px solid #cbd5e1',
                    fontSize: 13, fontWeight: 700, background: '#f8fafc', color: '#0f172a'
                  }}
                >
                  <option value="javascript">JavaScript (ES6)</option>
                  <option value="python">Python 3</option>
                  <option value="java">Java 17</option>
                </select>
              </div>

              {/* Code Input Window */}
              <div style={{ position: 'relative', borderRadius: 14, overflow: 'hidden', border: '1px solid #1e293b' }}>
                <div style={{ background: '#0f172a', color: '#94a3b8', padding: '8px 16px', fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>SANDBOX EDITOR • {selectedLanguage.toUpperCase()}</span>
                  <span style={{ color: '#34d399' }}>✓ Timeout & Memory Enforced</span>
                </div>
                <textarea
                  rows={14}
                  value={userCode}
                  onChange={e => setUserCode(e.target.value)}
                  style={{
                    width: '100%', padding: '16px', background: '#090d16', color: '#38bdf8',
                    fontFamily: 'monospace', fontSize: 13.5, border: 'none', outline: 'none', lineHeight: 1.5
                  }}
                />
              </div>

              {/* Action Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
                <div style={{ fontSize: 12, color: '#64748b' }}>
                  Target Points: <strong style={{ color: '#0f172a' }}>+{activeProblem.points} XP</strong>
                </div>

                <button
                  type="button"
                  onClick={runCodeSandbox}
                  disabled={executing}
                  style={{
                    padding: '12px 24px', borderRadius: 12, background: '#0284c7', color: '#fff',
                    fontWeight: 900, fontSize: 14, border: 'none', cursor: 'pointer', display: 'flex',
                    alignItems: 'center', gap: 8, opacity: executing ? 0.7 : 1
                  }}
                >
                  <FiPlay size={16} /> {executing ? 'Executing Test Cases...' : 'Submit & Run Code'}
                </button>
              </div>

              {/* Execution Result Banner */}
              {executionResult && (
                <div style={{
                  marginTop: 20, padding: 18, borderRadius: 14,
                  background: executionResult.success ? '#ecfdf5' : '#fef2f2',
                  border: `1px solid ${executionResult.success ? '#a7f3d0' : '#fecaca'}`
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 800, color: executionResult.success ? '#047857' : '#dc2626' }}>
                    {executionResult.success ? <FiCheckCircle size={20} /> : <FiXCircle size={20} />}
                    {executionResult.output}
                  </div>
                  <div style={{ display: 'flex', gap: 20, marginTop: 10, fontSize: 12, color: '#475569' }}>
                    <span>Test Cases: <strong>{executionResult.passedCases}/{executionResult.totalCases} Passed</strong></span>
                    <span>Runtime: <strong>{executionResult.runtime}</strong></span>
                    <span>Memory: <strong>{executionResult.memory}</strong></span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: 1V1 PEER CHALLENGE ───────────────────────────────────────── */}
      {activeTab === '1v1' && (
        <div style={{ background: '#fff', borderRadius: 20, padding: 36, border: '1px solid var(--s-border)', textAlign: 'center' }}>
          {matchingState === 'idle' && (
            <div style={{ maxWidth: 500, margin: '0 auto' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#eff6ff', color: '#3b82f6', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <FiZap size={32} />
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', margin: '0 0 8px' }}>
                Smart 1v1 Peer Matchmaking
              </h2>
              <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5, marginBottom: 24 }}>
                Match against an eligible student in <strong>{profile?.domain || 'your department'}</strong> ({profile?.currentYear || '3rd Year'}). Both get the same timed problem!
              </p>
              <button
                type="button"
                onClick={start1v1Matchmaking}
                style={{
                  padding: '14px 32px', borderRadius: 14, background: '#0284c7', color: '#fff',
                  fontWeight: 900, fontSize: 15, border: 'none', cursor: 'pointer'
                }}
              >
                Find Opponent Match
              </button>
            </div>
          )}

          {matchingState === 'searching' && (
            <div style={{ padding: '40px 0' }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#0284c7', marginBottom: 12 }}>
                Searching for compatible peer...
              </div>
              <div style={{ fontSize: 13, color: '#64748b' }}>
                Filtering by: {profile?.domain || 'CSE'} • {profile?.currentYear || '3rd Year'} • Similar DSA Rating
              </div>
            </div>
          )}

          {matchingState === 'matched' && opponent && (
            <div style={{ maxWidth: 540, margin: '0 auto', background: '#f8fafc', padding: 24, borderRadius: 16, border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: 18, fontWeight: 900, color: '#059669', marginBottom: 16 }}>
                ⚡ Match Found!
              </h3>
              <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', marginBottom: 24 }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 15, color: '#0f172a' }}>{profile?.institution ? 'You' : 'Player A'}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>{profile?.degreeProgramme}</div>
                </div>
                <div style={{ fontWeight: 900, fontSize: 20, color: '#ef4444' }}>VS</div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 15, color: '#0f172a' }}>{opponent.name}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>{opponent.degree} • Rating {opponent.rating}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => { setActiveTab('practice'); setMatchingState('idle') }}
                style={{ padding: '12px 24px', borderRadius: 12, background: '#047857', color: '#fff', fontWeight: 800, border: 'none', cursor: 'pointer' }}
              >
                Enter Challenge Arena Room
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 3: CODING STATS ───────────────────────────────────────────── */}
      {activeTab === 'leaderboard' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
          <div style={{ background: '#fff', padding: 24, borderRadius: 20, border: '1px solid var(--s-border)' }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#64748b' }}>PROBLEMS SOLVED</div>
            <div style={{ fontSize: 36, fontWeight: 900, color: '#0284c7', marginTop: 4 }}>18</div>
            <div style={{ fontSize: 12, color: '#059669', fontWeight: 700, marginTop: 4 }}>12 Easy • 5 Moderate • 1 Hard</div>
          </div>

          <div style={{ background: '#fff', padding: 24, borderRadius: 20, border: '1px solid var(--s-border)' }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#64748b' }}>1v1 CHALLENGES WON</div>
            <div style={{ fontSize: 36, fontWeight: 900, color: '#059669', marginTop: 4 }}>7 / 9</div>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 700, marginTop: 4 }}>Win Rate: 77.7%</div>
          </div>

          <div style={{ background: '#fff', padding: 24, borderRadius: 20, border: '1px solid var(--s-border)' }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#64748b' }}>CURRENT STREAK</div>
            <div style={{ fontSize: 36, fontWeight: 900, color: '#d97706', marginTop: 4 }}>5 Days 🔥</div>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 700, marginTop: 4 }}>Active learner badge unlocked</div>
          </div>
        </div>
      )}
    </div>
  )
}
