/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppState, TopicStatus, TopicUserData, DailyStudyTask, PYQRecord, MockTestRecord, MistakeRecord, UserProfile, PlannerConfig } from './types';
import {
  loadAppState,
  saveAppState,
  updateTopicStatus,
  logRevisionCompleted,
  resetAppStateToDefault,
  checkAndUnlockBadges
} from './utils/storage';
import { generateSmartStudyRecommendation, convertRecommendationsToDailyTasks } from './utils/smartRecommendations';
import { detectWeakTopics } from './utils/weakTopics';
import { ALL_TOPICS, getTopicById } from './data/syllabus';

// Components
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { Sidebar } from './components/Sidebar';
import { TopicModal } from './components/TopicModal';
import { StudyRecommendationModal } from './components/StudyRecommendationModal';
import { OnboardingModal } from './components/OnboardingModal';
import { BadgeModal } from './components/BadgeModal';

// Views
import { DashboardView } from './views/DashboardView';
import { SubjectsView } from './views/SubjectsView';
import { StudyPlanView } from './views/StudyPlanView';
import { CalendarView } from './views/CalendarView';
import { RevisionView } from './views/RevisionView';
import { PYQTrackerView } from './views/PYQTrackerView';
import { MockTestView } from './views/MockTestView';
import { MistakeBookView } from './views/MistakeBookView';
import { AnalyticsView } from './views/AnalyticsView';
import { NotesView } from './views/NotesView';
import { SettingsView } from './views/SettingsView';

export default function App() {
  const [state, setState] = useState<AppState>(() => loadAppState());
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);

  // Modal states
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null);
  const [showSmartModal, setShowSmartModal] = useState<boolean>(false);
  const [showBadgesModal, setShowBadgesModal] = useState<boolean>(false);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => !state.profile.onboardingCompleted);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Save state on changes
  useEffect(() => {
    saveAppState(state);
  }, [state]);

  // Handle active topic for modal
  const activeTopic = activeTopicId ? getTopicById(activeTopicId) : undefined;
  const activeTopicUserData: TopicUserData = activeTopicId
    ? state.topicData[activeTopicId] || {
        topicId: activeTopicId,
        status: 'not_started',
        studyHours: 0,
        notes: '',
        pyqsAttempted: 0,
        pyqsCorrect: 0,
        revisionCount: 0,
        revisionHistory: []
      }
    : ({} as TopicUserData);

  // Status updates
  const handleUpdateTopicStatus = (topicId: string, status: TopicStatus) => {
    setState((prev) => {
      const updated = updateTopicStatus(prev, topicId, status);
      return updated;
    });
  };

  const handleSaveTopicDetails = (details: Partial<TopicUserData>) => {
    if (!activeTopicId) return;
    setState((prev) => {
      const current = prev.topicData[activeTopicId] || {
        topicId: activeTopicId,
        status: 'not_started',
        studyHours: 0,
        notes: '',
        pyqsAttempted: 0,
        pyqsCorrect: 0,
        revisionCount: 0,
        revisionHistory: []
      };

      const updatedTopic: TopicUserData = {
        ...current,
        ...details
      };

      const nextState: AppState = {
        ...prev,
        topicData: {
          ...prev.topicData,
          [activeTopicId]: updatedTopic
        }
      };

      return checkAndUnlockBadges(nextState);
    });
  };

  // Revision log
  const handleLogRevision = (topicId: string, notes?: string) => {
    setState((prev) => logRevisionCompleted(prev, topicId, notes));
  };

  // Task operations
  const handleToggleTask = (dateStr: string, taskId: string) => {
    setState((prev) => {
      const tasks = prev.dailyTasks[dateStr] || [];
      const updatedTasks = tasks.map((t) =>
        t.id === taskId ? { ...t, completed: !t.completed } : t
      );

      // Also update daily log completed count & streak
      const todayStr = new Date().toISOString().split('T')[0];
      const newStreak = { ...prev.studyStreak };

      if (dateStr === todayStr && updatedTasks.some((t) => t.completed)) {
        if (newStreak.lastActiveDate !== todayStr) {
          newStreak.current = (newStreak.current || 0) + 1;
          newStreak.longest = Math.max(newStreak.longest || 0, newStreak.current);
          newStreak.lastActiveDate = todayStr;
        }
      }

      return {
        ...prev,
        dailyTasks: {
          ...prev.dailyTasks,
          [dateStr]: updatedTasks
        },
        studyStreak: newStreak
      };
    });
  };

  const handleAddTask = (dateStr: string, task: Omit<DailyStudyTask, 'id' | 'completed'>) => {
    const newTask: DailyStudyTask = {
      ...task,
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      completed: false
    };

    setState((prev) => {
      const tasks = prev.dailyTasks[dateStr] || [];
      return {
        ...prev,
        dailyTasks: {
          ...prev.dailyTasks,
          [dateStr]: [...tasks, newTask]
        }
      };
    });
  };

  const handleDeleteTask = (dateStr: string, taskId: string) => {
    setState((prev) => {
      const tasks = prev.dailyTasks[dateStr] || [];
      return {
        ...prev,
        dailyTasks: {
          ...prev.dailyTasks,
          [dateStr]: tasks.filter((t) => t.id !== taskId)
        }
      };
    });
  };

  const handleLogStudyMinutes = (dateStr: string, minutes: number) => {
    setState((prev) => {
      const existing = prev.dailyLogs[dateStr] || {
        date: dateStr,
        studyMinutes: 0,
        completedTopics: [],
        completedRevisions: [],
        pyqsAttempted: 0,
        pyqsCorrect: 0
      };

      const updatedLog = {
        ...existing,
        studyMinutes: existing.studyMinutes + minutes
      };

      return {
        ...prev,
        dailyLogs: {
          ...prev.dailyLogs,
          [dateStr]: updatedLog
        }
      };
    });
  };

  // PYQs
  const handleAddPYQ = (record: Omit<PYQRecord, 'id' | 'accuracy'>) => {
    const acc = record.attempted > 0 ? Math.round((record.correct / record.attempted) * 100) : 0;
    const newRecord: PYQRecord = {
      ...record,
      id: `pyq-${Date.now()}`,
      accuracy: acc
    };

    setState((prev) => {
      const updated = {
        ...prev,
        pyqs: [newRecord, ...prev.pyqs]
      };
      return checkAndUnlockBadges(updated);
    });
  };

  const handleDeletePYQ = (id: string) => {
    setState((prev) => ({
      ...prev,
      pyqs: prev.pyqs.filter((p) => p.id !== id)
    }));
  };

  // Mocks
  const handleAddMockTest = (mock: Omit<MockTestRecord, 'id'>) => {
    const newMock: MockTestRecord = {
      ...mock,
      id: `mock-${Date.now()}`
    };

    setState((prev) => {
      const updated = {
        ...prev,
        mockTests: [newMock, ...prev.mockTests]
      };
      return checkAndUnlockBadges(updated);
    });
  };

  const handleDeleteMockTest = (id: string) => {
    setState((prev) => ({
      ...prev,
      mockTests: prev.mockTests.filter((m) => m.id !== id)
    }));
  };

  // Mistakes
  const handleAddMistake = (mistake: Omit<MistakeRecord, 'id' | 'reviewed'>) => {
    const newMistake: MistakeRecord = {
      ...mistake,
      id: `mistake-${Date.now()}`,
      reviewed: false
    };

    setState((prev) => ({
      ...prev,
      mistakes: [newMistake, ...prev.mistakes]
    }));
  };

  const handleToggleMistakeReviewed = (id: string) => {
    setState((prev) => ({
      ...prev,
      mistakes: prev.mistakes.map((m) =>
        m.id === id ? { ...m, reviewed: !m.reviewed, reviewedAt: new Date().toISOString() } : m
      )
    }));
  };

  const handleDeleteMistake = (id: string) => {
    setState((prev) => ({
      ...prev,
      mistakes: prev.mistakes.filter((m) => m.id !== id)
    }));
  };

  // Profile & Config
  const handleUpdateProfile = (profile: UserProfile) => {
    setState((prev) => ({ ...prev, profile }));
  };

  const handleUpdatePlannerConfig = (config: PlannerConfig) => {
    setState((prev) => ({ ...prev, plannerConfig: config }));
  };

  const handleResetData = () => {
    const initial = resetAppStateToDefault();
    setState(initial);
  };

  const handleImportData = (imported: AppState) => {
    setState(imported);
  };

  // Smart Recommendation
  const smartRecommendation = generateSmartStudyRecommendation(state);

  const handleApplySmartRecommendation = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const generatedTasks = convertRecommendationsToDailyTasks(smartRecommendation.items, todayStr);

    setState((prev) => {
      const existing = prev.dailyTasks[todayStr] || [];
      return {
        ...prev,
        dailyTasks: {
          ...prev.dailyTasks,
          [todayStr]: [...existing, ...generatedTasks]
        }
      };
    });

    setShowSmartModal(false);
    setActiveView('study_plan');
  };

  // Counts for Badges & Navigation Badges
  const todayStr = new Date().toISOString().split('T')[0];
  const revisionDueCount = Object.values(state.topicData).filter(
    (t) => t.status === 'completed' && t.nextRevisionDue && t.nextRevisionDue <= todayStr
  ).length;

  const weakTopics = detectWeakTopics(state);
  const unreviewedMistakes = state.mistakes.filter((m) => !m.reviewed).length;

  return (
    <div className="min-h-screen bg-[#0b1329] text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Navbar */}
      <Navbar
        activeView={activeView}
        onNavigate={(view) => {
          setActiveView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        currentStreak={state.studyStreak.current}
        onOpenSmartRecommendation={() => setShowSmartModal(true)}
        onOpenMobileMenu={() => setMobileMenuOpen(true)}
      />

      {/* Main Body with Sidebar Layout */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        {/* Desktop Sidebar & Mobile Drawer */}
        <Sidebar
          activeView={activeView}
          onNavigate={(view) => {
            setActiveView(view);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          revisionDueCount={revisionDueCount}
          weakTopicsCount={weakTopics.length}
          mistakesUnreviewedCount={unreviewedMistakes}
          isOpenMobile={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
        />

        {/* Content Viewport */}
        <main className="flex-1 min-w-0 lg:pl-64 px-4 sm:px-6 lg:px-8 pt-6 pb-20 lg:pb-12">
          {activeView === 'dashboard' && (
            <DashboardView
              state={state}
              onNavigate={(v) => {
                setActiveView(v);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onOpenSubject={(subId) => {
                setSelectedSubjectId(subId);
                setActiveView('subjects');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onOpenTopic={(tId) => setActiveTopicId(tId)}
              onToggleTask={handleToggleTask}
              onLogRevision={handleLogRevision}
              onOpenSmartRecommendation={() => setShowSmartModal(true)}
              onOpenBadges={() => setShowBadgesModal(true)}
            />
          )}

          {activeView === 'subjects' && (
            <SubjectsView
              state={state}
              selectedSubjectId={selectedSubjectId}
              onSelectSubjectId={(id) => setSelectedSubjectId(id)}
              onOpenTopic={(tId) => setActiveTopicId(tId)}
              onUpdateTopicStatus={handleUpdateTopicStatus}
            />
          )}

          {activeView === 'study_plan' && (
            <StudyPlanView
              state={state}
              onUpdateConfig={handleUpdatePlannerConfig}
              onToggleTask={handleToggleTask}
              onAddTask={handleAddTask}
              onDeleteTask={handleDeleteTask}
              onOpenSmartRecommendation={() => setShowSmartModal(true)}
              onLogStudyMinutes={handleLogStudyMinutes}
            />
          )}

          {activeView === 'calendar' && (
            <CalendarView
              state={state}
              onOpenTopic={(tId) => setActiveTopicId(tId)}
            />
          )}

          {activeView === 'revision' && (
            <RevisionView
              state={state}
              onLogRevision={handleLogRevision}
              onOpenTopic={(tId) => setActiveTopicId(tId)}
            />
          )}

          {activeView === 'pyqs' && (
            <PYQTrackerView
              state={state}
              onAddPYQ={handleAddPYQ}
              onDeletePYQ={handleDeletePYQ}
            />
          )}

          {activeView === 'mock_tests' && (
            <MockTestView
              state={state}
              onAddMockTest={handleAddMockTest}
              onDeleteMockTest={handleDeleteMockTest}
            />
          )}

          {activeView === 'mistakes' && (
            <MistakeBookView
              state={state}
              onAddMistake={handleAddMistake}
              onToggleReviewed={handleToggleMistakeReviewed}
              onDeleteMistake={handleDeleteMistake}
              onOpenTopic={(tId) => setActiveTopicId(tId)}
            />
          )}

          {activeView === 'analytics' && (
            <AnalyticsView
              state={state}
              onOpenSubject={(subId) => {
                setSelectedSubjectId(subId);
                setActiveView('subjects');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onOpenTopic={(tId) => setActiveTopicId(tId)}
            />
          )}

          {activeView === 'notes' && (
            <NotesView
              state={state}
              onOpenTopic={(tId) => setActiveTopicId(tId)}
            />
          )}

          {activeView === 'settings' && (
            <SettingsView
              state={state}
              onUpdateProfile={handleUpdateProfile}
              onResetData={handleResetData}
              onImportData={handleImportData}
              onOpenOnboarding={() => setShowOnboarding(true)}
            />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation (Ergonomic thumb zone) */}
      <BottomNav
        activeView={activeView}
        onNavigate={(view) => {
          setActiveView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenMoreMenu={() => setMobileMenuOpen(true)}
        revisionDueCount={revisionDueCount}
      />

      {/* Modals & Dialogs */}
      {/* 1. Topic Detail Modal */}
      {activeTopic && (
        <TopicModal
          topic={activeTopic}
          userData={activeTopicUserData}
          onClose={() => setActiveTopicId(null)}
          onUpdateStatus={(newStatus) => handleUpdateTopicStatus(activeTopic.id, newStatus)}
          onSaveTopicDetails={handleSaveTopicDetails}
        />
      )}

      {/* 2. Smart What Should I Study Today Modal */}
      {showSmartModal && (
        <StudyRecommendationModal
          recommendation={smartRecommendation}
          onClose={() => setShowSmartModal(false)}
          onApplyToTodayTasks={handleApplySmartRecommendation}
        />
      )}

      {/* 3. Badges Modal */}
      {showBadgesModal && (
        <BadgeModal
          unlockedBadgeIds={state.unlockedBadges}
          onClose={() => setShowBadgesModal(false)}
        />
      )}

      {/* 4. Onboarding Wizard */}
      {showOnboarding && (
        <OnboardingModal
          initialProfile={state.profile}
          onComplete={(profile) => {
            handleUpdateProfile(profile);
            setShowOnboarding(false);
          }}
          onClose={() => setShowOnboarding(false)}
        />
      )}
    </div>
  );
}
