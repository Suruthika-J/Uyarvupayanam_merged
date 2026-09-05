import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft } from 'react-icons/fi';
import confetti from 'canvas-confetti';

import { useStudentAuth } from '../../context/StudentAuthContext';
import class5CommunicationService from '../../../services/class5CommunicationService';
import { SLoader, SAlert } from '../../components/ui';

import WelcomeBanner from './communication/WelcomeBanner';
import LearningVideo from './communication/LearningVideo';
import JourneyStepper from './communication/JourneyStepper';
import EmotionDetective from './communication/EmotionDetective';
import OneMinuteTalk from './communication/OneMinuteTalk';
import ConversationBuilder from './communication/ConversationBuilder';
import RealLifeSimulator from './communication/RealLifeSimulator';
import DailyMission from './communication/DailyMission';
import CommunicationTips from './communication/CommunicationTips';
import Reflection from './communication/Reflection';
import SkillProgressSidebar from './communication/SkillProgressSidebar';

import {
  EMOTION_QUESTIONS as STATIC_EMOTION_QUESTIONS,
  MICROPHONE_TOPICS as STATIC_MICROPHONE_TOPICS,
  CONVERSATION_SETS as STATIC_CONVERSATION_SETS,
  SIMULATOR_SCENARIOS as STATIC_SIMULATOR_SCENARIOS,
  FLIP_TIPS as STATIC_FLIP_TIPS,
} from './communication/data';

const STEPS = [
  { id: 'video', label: 'Watch Video', emoji: '🎥', desc: 'Learn the basics' },
  { id: 'emotion_detective', label: 'Emotion Detective', emoji: '🕵️‍♂️', desc: 'Read feelings' },
  { id: 'one_minute_talk', label: 'One Minute Talk', emoji: '🎤', desc: 'Speak confidently' },
  { id: 'conversation_builder', label: 'Conversation Builder', emoji: '💬', desc: 'Structure sentences' },
  { id: 'school_simulator', label: 'School Simulator', emoji: '🏫', desc: 'Practice real life' },
  { id: 'reflection', label: 'Communication Hero', emoji: '🏆', desc: 'Reflect & Celebrate' },
];

function fireConfetti() {
  confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
  setTimeout(() => {
    confetti({ particleCount: 80, angle: 60, spread: 55, origin: { x: 0 } });
    confetti({ particleCount: 80, angle: 120, spread: 55, origin: { x: 1 } });
  }, 250);
}

export default function Class5CommunicationPage() {
  const navigate = useNavigate();
  const { student } = useStudentAuth();

  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState({
    speakingConfidence: 10, listening: 10, empathy: 10, observation: 10,
    confidence: 10, respect: 10, leadership: 10,
    xp: 0, level: 1, streak: 0, completedSteps: [],
  });
  const [badges, setBadges] = useState([]);
  const [dailyMission, setDailyMission] = useState(null);
  const [activeStep, setActiveStep] = useState('video');
  const [alert, setAlert] = useState({ type: '', text: '' });
  const [showLevelUp, setShowLevelUp] = useState(false);

  const [emotionQuestions, setEmotionQuestions] = useState(STATIC_EMOTION_QUESTIONS);
  const [talkTopics, setTalkTopics] = useState(STATIC_MICROPHONE_TOPICS);
  const [conversationSets, setConversationSets] = useState(STATIC_CONVERSATION_SETS);
  const [simulatorScenarios, setSimulatorScenarios] = useState(STATIC_SIMULATOR_SCENARIOS);
  const [flipTips, setFlipTips] = useState(STATIC_FLIP_TIPS);

  const triggerAlert = useCallback((type, text) => {
    setAlert({ type, text });
    setTimeout(() => setAlert({ type: '', text: '' }), 4000);
  }, []);

  const fetchProgress = useCallback(async () => {
    try {
      setLoading(true);
      const [res, emotionData, topicData, convData, simData, tipData] = await Promise.allSettled([
        class5CommunicationService.getProgress(),
        class5CommunicationService.fetchEmotionQuestions(),
        class5CommunicationService.fetchTalkTopics(),
        class5CommunicationService.fetchConversationSets(),
        class5CommunicationService.fetchSimulatorScenarios(),
        class5CommunicationService.fetchFlipTips(),
      ]);

      if (res.status === 'fulfilled' && res.value.success) {
        const p = res.value.data.progress || progress;
        setProgress(p);
        setBadges(res.value.data.badges || []);
        setDailyMission(res.value.data.dailyMission);

        const completed = p.completedSteps || [];
        if (!completed.includes('video')) setActiveStep('video');
        else if (!completed.includes('emotion_detective')) setActiveStep('emotion_detective');
        else if (!completed.includes('one_minute_talk')) setActiveStep('one_minute_talk');
        else if (!completed.includes('conversation_builder')) setActiveStep('conversation_builder');
        else if (!completed.includes('school_simulator')) setActiveStep('school_simulator');
        else setActiveStep('reflection');
      }

      if (emotionData.status === 'fulfilled' && emotionData.value.length) setEmotionQuestions(emotionData.value);
      if (topicData.status === 'fulfilled' && topicData.value.length) setTalkTopics(topicData.value);
      if (convData.status === 'fulfilled' && convData.value.length) setConversationSets(convData.value);
      if (simData.status === 'fulfilled' && Object.keys(simData.value).length) setSimulatorScenarios(simData.value);
      if (tipData.status === 'fulfilled' && tipData.value.length) setFlipTips(tipData.value);
    } catch {
      triggerAlert('error', 'Failed to load progress.');
    } finally {
      setLoading(false);
    }
  }, [triggerAlert]);

  useEffect(() => { fetchProgress(); }, [fetchProgress]);

  const handleStepComplete = useCallback(async (stepId) => {
    try {
      const oldLevel = progress.level;
      const res = await class5CommunicationService.completeStep(stepId);
      if (res.success) {
        setProgress(res.data.progress);
        setBadges(res.data.badges);
        fireConfetti();

        if (res.data.newBadge) {
          triggerAlert('success', `Congratulations! You unlocked the "${res.data.newBadge}" Badge!`);
        } else {
          triggerAlert('success', res.message);
        }

        if (res.data.progress.level > oldLevel) {
          setShowLevelUp(true);
          setTimeout(() => setShowLevelUp(false), 5000);
        }
      }
    } catch {
      triggerAlert('error', 'Failed to update progress.');
    }
  }, [progress.level, triggerAlert]);

  const handleVideoComplete = useCallback(() => {
    handleStepComplete('video');
  }, [handleStepComplete]);

  const handleEmotionComplete = useCallback(() => {
    handleStepComplete('emotion_detective');
  }, [handleStepComplete]);

  const handleOneMinuteTalkComplete = useCallback(async (data) => {
    try {
      const formData = new FormData();
      formData.append('audio', data.blob, 'talk.webm');
      formData.append('topic', data.topic);
      const res = await class5CommunicationService.uploadVoiceRecording(formData);
      if (res.success) {
        setProgress(res.data.progress);
        setBadges(res.data.badges);
        fireConfetti();
        triggerAlert('success', 'One Minute Talk saved! +20 XP');
        handleStepComplete('one_minute_talk');
      }
    } catch {
      triggerAlert('error', 'Failed to upload recording.');
    }
  }, [handleStepComplete, triggerAlert]);

  const handleConversationComplete = useCallback(() => {
    handleStepComplete('conversation_builder');
  }, [handleStepComplete]);

  const handleSimulatorComplete = useCallback(() => {
    handleStepComplete('school_simulator');
  }, [handleStepComplete]);

  const handleReflectionComplete = useCallback(() => {
    handleStepComplete('communication_hero');
  }, [handleStepComplete]);

  const handleDailyMissionGenerate = useCallback(async () => {
    try {
      const res = await class5CommunicationService.getDailyMission();
      if (res.success) setDailyMission(res.data);
    } catch {
      triggerAlert('error', 'Error getting daily mission.');
    }
  }, [triggerAlert]);

  const handleDailyMissionComplete = useCallback(async () => {
    try {
      const res = await class5CommunicationService.completeDailyMission();
      if (res.success) {
        setDailyMission(res.data.mission);
        setProgress(res.data.progress);
        setBadges(res.data.badges);
        fireConfetti();
        triggerAlert('success', 'Daily mission completed! +20 XP');
      }
    } catch {
      triggerAlert('error', 'Error completing mission.');
    }
  }, [triggerAlert]);

  if (loading) return <SLoader fullPage />;

  return (
    <div className="student-root" style={{ background: '#fefefe', minHeight: '100vh', paddingBottom: 100 }}>

      {/* Level Up Modal */}
      <AnimatePresence>
        {showLevelUp && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            style={{
              position: 'fixed', top: '25%', left: '50%', transform: 'translate(-50%, -50%)',
              background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)', color: '#fff',
              padding: '40px 60px', borderRadius: 32,
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
              zIndex: 10000, textAlign: 'center', maxWidth: 500,
            }}
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 10, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              style={{ fontSize: 80, marginBottom: 20 }}
            >
              👑
            </motion.div>
            <h2 style={{ fontSize: 36, fontWeight: 900, margin: '0 0 10px' }}>Level Up!</h2>
            <p style={{ fontSize: 20, margin: 0, color: '#fffbeb' }}>
              You reached <strong>Level {progress.level}</strong>!
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Back Button */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 24px 0' }}>
        <motion.button
          whileHover={{ x: -4 }}
          onClick={() => navigate('/student/class5')}
          style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px',
            borderRadius: 14, border: 'none', background: '#f1f5f9',
            color: '#475569', fontWeight: 800, cursor: 'pointer',
          }}
        >
          <FiArrowLeft size={16} /> Back to Class 5
        </motion.button>
      </section>

      {/* Main Grid */}
      <section style={{
        maxWidth: 1200, margin: '0 auto', padding: '20px 24px',
        display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 350px', gap: 40,
      }} className="s-grid-1col">

        {/* Left Content */}
        <div>
          {/* Section 1: Welcome Banner */}
          <WelcomeBanner />

          {/* Section 3: Journey Stepper */}
          <div style={{ marginTop: 40 }}>
            <JourneyStepper
              steps={STEPS}
              completedSteps={progress.completedSteps || []}
              activeStep={activeStep}
              onStepClick={setActiveStep}
            />
          </div>

          {/* Active Step Content */}
          <div style={{
            minHeight: 400, background: '#fff', border: '1px solid #f1f5f9',
            borderRadius: 32, padding: 40,
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)',
          }}>

            {/* Section 2: Learning Video */}
            {activeStep === 'video' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <LearningVideo
                  videoWatched={progress.completedSteps?.includes('video')}
                  onComplete={handleVideoComplete}
                  isCompleted={progress.completedSteps?.includes('video')}
                />
              </motion.div>
            )}

            {/* Section 4: Emotion Detective */}
            {activeStep === 'emotion_detective' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <EmotionDetective
                  questions={emotionQuestions}
                  onComplete={handleEmotionComplete}
                />
              </motion.div>
            )}

            {/* Section 5: One Minute Talk */}
            {activeStep === 'one_minute_talk' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <OneMinuteTalk
                  topics={talkTopics}
                  onComplete={handleOneMinuteTalkComplete}
                />
              </motion.div>
            )}

            {/* Section 6: Conversation Builder */}
            {activeStep === 'conversation_builder' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <ConversationBuilder
                  conversationSets={conversationSets}
                  onComplete={handleConversationComplete}
                />
              </motion.div>
            )}

            {/* Section 7: Real Life Simulator */}
            {activeStep === 'school_simulator' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <RealLifeSimulator
                  scenarios={simulatorScenarios}
                  onComplete={handleSimulatorComplete}
                />
              </motion.div>
            )}

            {/* Section 10: Reflection */}
            {activeStep === 'reflection' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Reflection
                  onComplete={handleReflectionComplete}
                  studentId={student?._id || student?.id}
                />
              </motion.div>
            )}
          </div>

          {/* Section 8: Daily Communication Mission */}
          <div style={{ marginTop: 40 }}>
            <DailyMission
              mission={dailyMission}
              onGenerate={handleDailyMissionGenerate}
              onComplete={handleDailyMissionComplete}
            />
          </div>

          {/* Section 9: Communication Tips */}
          <div style={{ marginTop: 60 }}>
            <h3 style={{ fontSize: 22, fontWeight: 900, marginBottom: 24 }}>
              💡 Daily Communication Tips
            </h3>
            <CommunicationTips tips={flipTips} />
          </div>
        </div>

        {/* Right Sidebar: Skill Progress */}
        <aside>
          <SkillProgressSidebar
            student={student}
            progress={progress}
            badges={badges}
          />
        </aside>
      </section>

      {/* Alert Toast */}
      {alert.text && (
        <div style={{ position: 'fixed', bottom: 40, right: 40, zIndex: 99999 }}>
          <SAlert type={alert.type}>{alert.text}</SAlert>
        </div>
      )}
    </div>
  );
}
