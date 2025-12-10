import React, { useState } from 'react';

const AssessmentMockup = () => {
  const [viewMode, setViewMode] = useState('standard'); // 'standard' | 'focus' | 'compact'
  const [expandedQuestions, setExpandedQuestions] = useState({0: true, 1: true, 2: true, 3: true});
  const [activeCategory, setActiveCategory] = useState('cash');
  
  const categories = [
    { id: 'cash', name: 'Cash Handling & Safe Security', questions: 8, completed: 8 },
    { id: 'cctv', name: 'Video Surveillance (CCTV)', questions: 6, completed: 6 },
    { id: 'eas', name: 'Electronic Article Surveillance', questions: 5, completed: 5 },
    { id: 'training', name: 'Employee Procedures & Training', questions: 7, completed: 7 },
    { id: 'neighborhood', name: 'Neighborhood & External Factors', questions: 4, completed: 4 },
  ];

  const questions = [
    {
      id: 1,
      subgroup: 'Register Operations',
      question: 'What is the maximum amount of cash typically in registers during peak hours?',
      response: '$200-$500 per register',
      notes: 'They have no proper protocol for measuring this',
      photos: 1,
      hasIssue: true,
    },
    {
      id: 2,
      subgroup: 'Register Operations',
      question: 'Do you enforce register cash limits with mandatory drops?',
      response: 'Yes',
      notes: '',
      photos: 2,
      hasIssue: false,
    },
    {
      id: 3,
      subgroup: 'Safe Security',
      question: 'What type of safe do you have?',
      response: 'Combination safe',
      notes: 'A terrible safe made of butter',
      photos: 2,
      hasIssue: true,
    },
    {
      id: 4,
      subgroup: 'Safe Security',
      question: 'How many people have access to the safe combination?',
      response: '3-5 people',
      notes: '',
      photos: 0,
      hasIssue: false,
    },
  ];

  const toggleQuestion = (index) => {
    setExpandedQuestions(prev => ({...prev, [index]: !prev[index]}));
  };

  const totalQuestions = categories.reduce((sum, c) => sum + c.questions, 0);
  const totalCompleted = categories.reduce((sum, c) => sum + c.completed, 0);

  // Group questions by subgroup
  const groupedQuestions = questions.reduce((acc, q, idx) => {
    if (!acc[q.subgroup]) acc[q.subgroup] = [];
    acc[q.subgroup].push({...q, originalIndex: idx});
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-lg font-semibold text-slate-800">Retail Store Assessment</h1>
              <p className="text-sm text-slate-500">Downtown Location • Started Dec 9, 2024</p>
            </div>
            <div className="flex items-center gap-3">
              {/* View Mode Toggle */}
              <div className="flex bg-slate-100 rounded-lg p-1 text-sm">
                <button 
                  onClick={() => setViewMode('standard')}
                  className={`px-3 py-1.5 rounded-md transition-all ${viewMode === 'standard' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Standard
                </button>
                <button 
                  onClick={() => setViewMode('compact')}
                  className={`px-3 py-1.5 rounded-md transition-all ${viewMode === 'compact' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Compact
                </button>
                <button 
                  onClick={() => setViewMode('focus')}
                  className={`px-3 py-1.5 rounded-md transition-all ${viewMode === 'focus' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Focus
                </button>
              </div>
              <button className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors">
                Export Report
              </button>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-500"
                style={{width: `${(totalCompleted/totalQuestions)*100}%`}}
              />
            </div>
            <span className="text-sm font-medium text-slate-600 whitespace-nowrap">
              {totalCompleted} of {totalQuestions} completed
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6">
        <div className="flex gap-6">
          {/* Sidebar - Category Navigation */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-xl border border-slate-200 p-4 sticky top-32">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Categories</h3>
              <nav className="space-y-1">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg transition-all flex items-center justify-between group ${
                      activeCategory === cat.id 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : 'hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <span className="text-sm font-medium truncate pr-2">{cat.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                      cat.completed === cat.questions 
                        ? 'bg-emerald-100 text-emerald-600' 
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {cat.completed}/{cat.questions}
                    </span>
                  </button>
                ))}
              </nav>
              
              {/* Quick Stats */}
              <div className="mt-6 pt-4 border-t border-slate-100">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Quick Stats</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Issues Found</span>
                    <span className="font-medium text-amber-600">12</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Photos Taken</span>
                    <span className="font-medium text-slate-700">34</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Notes Added</span>
                    <span className="font-medium text-slate-700">18</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            {/* Category Header */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-800">Cash Handling & Safe Security</h2>
                  <p className="text-sm text-slate-500 mt-1">Evaluate cash management procedures and safe security measures</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="text-sm text-slate-500 hover:text-slate-700 px-3 py-1.5 hover:bg-slate-50 rounded-lg transition-colors">
                    Collapse All
                  </button>
                  <button className="text-sm text-emerald-600 hover:text-emerald-700 font-medium px-3 py-1.5 hover:bg-emerald-50 rounded-lg transition-colors">
                    Skip Section
                  </button>
                </div>
              </div>
              
              {/* Section Progress */}
              <div className="mt-4 flex items-center gap-3">
                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{width: '100%'}} />
                </div>
                <span className="text-xs text-slate-500">8 of 8</span>
              </div>
            </div>

            {/* Questions grouped by subgroup */}
            {Object.entries(groupedQuestions).map(([subgroup, subQuestions], groupIndex) => (
              <div key={subgroup} className="mb-6">
                {/* Subgroup Header */}
                <div className="flex items-center gap-3 mb-3 px-1">
                  <div className="h-px flex-1 bg-slate-200" />
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{subgroup}</span>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>

                {/* Questions in this subgroup */}
                <div className="space-y-3">
                  {subQuestions.map((q, qIndex) => {
                    const isExpanded = viewMode === 'standard' || expandedQuestions[q.originalIndex];
                    const isCompact = viewMode === 'compact';
                    
                    return (
                      <div 
                        key={q.id}
                        className={`bg-white rounded-xl border transition-all ${
                          q.hasIssue ? 'border-amber-200 bg-amber-50/30' : 'border-slate-200'
                        } ${isCompact && !expandedQuestions[q.originalIndex] ? 'hover:border-slate-300' : ''}`}
                      >
                        {/* Question Header - Always Visible */}
                        <div 
                          className={`p-4 ${isCompact ? 'cursor-pointer' : ''}`}
                          onClick={() => isCompact && toggleQuestion(q.originalIndex)}
                        >
                          <div className="flex items-start gap-3">
                            {/* Question Number */}
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-medium ${
                              q.hasIssue 
                                ? 'bg-amber-100 text-amber-700' 
                                : 'bg-emerald-100 text-emerald-700'
                            }`}>
                              {q.id}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-4">
                                <h3 className="text-sm font-medium text-slate-800 leading-snug">
                                  {q.question}
                                </h3>
                                
                                {/* Status indicators */}
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  {q.photos > 0 && (
                                    <span className="flex items-center gap-1 text-xs text-slate-400">
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                      </svg>
                                      {q.photos}
                                    </span>
                                  )}
                                  {q.notes && (
                                    <span className="flex items-center gap-1 text-xs text-amber-500">
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                      </svg>
                                    </span>
                                  )}
                                  <svg className={`w-5 h-5 ${q.hasIssue ? 'text-amber-500' : 'text-emerald-500'}`} fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              </div>
                              
                              {/* Compact View - Show response inline */}
                              {isCompact && !expandedQuestions[q.originalIndex] && (
                                <p className="text-sm text-slate-600 mt-1">
                                  <span className="font-medium">{q.response}</span>
                                  {q.notes && <span className="text-slate-400 ml-2">• "{q.notes.substring(0, 40)}..."</span>}
                                </p>
                              )}
                            </div>
                            
                            {/* Expand/Collapse for compact mode */}
                            {isCompact && (
                              <button className="text-slate-400 hover:text-slate-600 p-1">
                                <svg className={`w-5 h-5 transition-transform ${expandedQuestions[q.originalIndex] ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Expanded Content */}
                        {(viewMode === 'standard' || (isCompact && expandedQuestions[q.originalIndex])) && (
                          <div className="px-4 pb-4 pt-0">
                            <div className="pl-10 space-y-4">
                              {/* Response Field */}
                              <div>
                                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Response</label>
                                <div className="mt-1.5 relative">
                                  <select className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 appearance-none cursor-pointer hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                                    <option>{q.response}</option>
                                  </select>
                                  <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </div>
                              </div>

                              {/* Notes Field - Compact when empty */}
                              <div>
                                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Observations & Notes</label>
                                {q.notes ? (
                                  <textarea 
                                    className="mt-1.5 w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                    rows={2}
                                    defaultValue={q.notes}
                                  />
                                ) : (
                                  <button className="mt-1.5 w-full px-3 py-2.5 border border-dashed border-slate-200 rounded-lg text-sm text-slate-400 hover:border-slate-300 hover:text-slate-500 transition-colors text-left">
                                    + Add observation or note...
                                  </button>
                                )}
                              </div>

                              {/* Photo Evidence - Compact */}
                              <div>
                                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Photo Evidence</label>
                                <div className="mt-1.5 flex items-center gap-2">
                                  {q.photos > 0 ? (
                                    <>
                                      {[...Array(q.photos)].map((_, i) => (
                                        <div key={i} className="w-16 h-16 bg-slate-200 rounded-lg overflow-hidden">
                                          <div className="w-full h-full bg-gradient-to-br from-slate-300 to-slate-400" />
                                        </div>
                                      ))}
                                      <button className="w-16 h-16 border border-dashed border-slate-300 rounded-lg flex items-center justify-center text-slate-400 hover:border-slate-400 hover:text-slate-500 transition-colors">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                                        </svg>
                                      </button>
                                    </>
                                  ) : (
                                    <button className="flex items-center gap-2 px-3 py-2 border border-dashed border-slate-200 rounded-lg text-sm text-slate-400 hover:border-slate-300 hover:text-slate-500 transition-colors">
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                      </svg>
                                      Add photo evidence
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Navigation Footer */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200">
              <button className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous Section
              </button>
              <button className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition-colors">
                Next Section
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Focus Mode Overlay */}
      {viewMode === 'focus' && (
        <div className="fixed inset-0 bg-slate-900/80 z-30 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl">
            {/* Focus Mode Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-500">Question 1 of 8</span>
                <span className="text-slate-300">•</span>
                <span className="text-sm font-medium text-emerald-600">Cash Handling & Safe Security</span>
              </div>
              <button 
                onClick={() => setViewMode('standard')}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Focus Mode Content */}
            <div className="p-6">
              <h2 className="text-xl font-semibold text-slate-800 mb-6">
                What is the maximum amount of cash typically in registers during peak hours?
              </h2>
              
              <div className="space-y-5">
                <div>
                  <label className="text-sm font-medium text-slate-600">Response</label>
                  <select className="mt-2 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 appearance-none cursor-pointer">
                    <option>$200-$500 per register</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-slate-600">Observations & Notes</label>
                  <textarea 
                    className="mt-2 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 resize-none"
                    rows={3}
                    placeholder="Document specific observations, conditions, or concerns..."
                    defaultValue="They have no proper protocol for measuring this"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-slate-600">Photo Evidence</label>
                  <div className="mt-2 flex gap-3">
                    <div className="w-20 h-20 bg-slate-200 rounded-xl" />
                    <button className="w-20 h-20 border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center text-slate-400 hover:border-emerald-400 hover:text-emerald-500 transition-colors">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Focus Mode Footer */}
            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
              <button className="flex items-center gap-2 px-4 py-2 text-slate-500 hover:text-slate-700 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>
              <div className="flex gap-1">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                ))}
              </div>
              <button className="flex items-center gap-2 px-5 py-2 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition-colors">
                Next
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssessmentMockup;
