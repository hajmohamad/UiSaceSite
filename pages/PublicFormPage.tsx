import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPublicFormById, submitPublicForm, uploadFormAttachment } from '../services/api';
import type { PorslineForm } from '../types';

const PublicFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [form, setForm] = useState<PorslineForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Respondent info
  const [respondentName, setRespondentName] = useState('');
  const [respondentContact, setRespondentContact] = useState('');

  // Answers: questionId -> value
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [uploadingFiles, setUploadingFiles] = useState<Record<string, boolean>>({});

  // Step / Single-Question-per-page state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [stepError, setStepError] = useState<string | null>(null);

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [submittedResult, setSubmittedResult] = useState<{
    message: string;
    score?: number;
    maxScore?: number;
    type?: string;
    responseId?: number;
  } | null>(null);

  // Timer for Quiz
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (id) {
      setLoading(true);
      getPublicFormById(id)
        .then((data) => {
          if (isMounted) {
            setForm(data);
            if (data.timeLimitMin && data.timeLimitMin > 0) {
              setTimeLeft(data.timeLimitMin * 60);
            }
            setLoading(false);
          }
        })
        .catch((err) => {
          if (isMounted) {
            setError(err?.message || 'خطا در بارگذاری پرسشنامه');
            setLoading(false);
          }
        });
    }
    return () => {
      isMounted = false;
    };
  }, [id]);

  // Quiz Countdown
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || submittedResult) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          // Auto submit on time out
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, submittedResult]);

  const setAnswer = (questionId: string, value: any) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    setStepError(null);
  };

  const handleCheckboxToggle = (questionId: string, option: string) => {
    setStepError(null);
    const current: string[] = answers[questionId] || [];
    if (current.includes(option)) {
      setAnswer(
        questionId,
        current.filter((item) => item !== option)
      );
    } else {
      setAnswer(questionId, [...current, option]);
    }
  };

  const handleFileUpload = async (questionId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingFiles((prev) => ({ ...prev, [questionId]: true }));
      const res = await uploadFormAttachment(file);
      setAnswer(questionId, res.url);
    } catch (err: any) {
      alert(err?.message || 'خطا در آپلود فایل');
    } finally {
      setUploadingFiles((prev) => ({ ...prev, [questionId]: false }));
    }
  };

  const handleNext = () => {
    if (!form || !form.questions || form.questions.length === 0) return;
    const currentQ = form.questions[currentQuestionIndex];
    if (currentQ?.required) {
      const val = answers[currentQ.id];
      if (
        val === undefined ||
        val === null ||
        val === '' ||
        (Array.isArray(val) && val.length === 0)
      ) {
        setStepError('پاسخ به این سوال الزامی است. لطفاً پیش از ادامه پاسخ دهید.');
        return;
      }
    }
    setStepError(null);
    if (currentQuestionIndex < form.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      window.scrollTo({ top: 100, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    setStepError(null);
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      window.scrollTo({ top: 100, behavior: 'smooth' });
    }
  };

  const handleJumpToQuestion = (targetIndex: number) => {
    setStepError(null);
    setCurrentQuestionIndex(targetIndex);
    window.scrollTo({ top: 100, behavior: 'smooth' });
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!form || submitting || submittedResult) return;

    // Validate required questions
    for (let i = 0; i < (form.questions || []).length; i++) {
      const q = form.questions[i];
      if (q.required) {
        const val = answers[q.id];
        if (
          val === undefined ||
          val === null ||
          val === '' ||
          (Array.isArray(val) && val.length === 0)
        ) {
          setCurrentQuestionIndex(i);
          setStepError(`پاسخ به این سوال الزامی است.`);
          alert(`پاسخ به سوال شماره ${i + 1} («${q.title}») اجباری است.`);
          window.scrollTo({ top: 100, behavior: 'smooth' });
          return;
        }
      }
    }

    try {
      setSubmitting(true);
      const res = await submitPublicForm(id!, {
        respondentName: respondentName.trim(),
        respondentContact: respondentContact.trim(),
        answers,
      });
      setSubmittedResult({
        message: res.message,
        score: res.score,
        maxScore: res.maxScore,
        type: res.type,
        responseId: res.responseId,
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      alert(err?.message || 'خطا در ارسال پاسخ‌ها');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-500 font-medium">در حال بارگذاری پرسشنامه...</p>
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="max-w-md mx-auto my-16 bg-white p-8 rounded-3xl shadow-lg border border-gray-200 text-center">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-4 text-2xl">
          ⚠️
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">پرسشنامه در دسترس نیست</h2>
        <p className="text-sm text-gray-500 leading-relaxed mb-6">
          {error || 'ممکن است مهلت این پرسشنامه به پایان رسیده باشد یا آدرس اشتباه باشد.'}
        </p>
        <Link
          to="/"
          className="inline-block px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/20"
        >
          بازگشت به صفحه اصلی
        </Link>
      </div>
    );
  }

  // Thank You / Submission Success Screen
  if (submittedResult) {
    return (
      <div className="max-w-xl mx-auto my-12 bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sm:p-10 text-center animate-fade-in print:shadow-none print:border-none print:my-0">
        <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-inner print:hidden">
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h2 className="text-2xl font-black text-gray-900 mb-3">پاسخ شما با موفقیت ثبت شد</h2>
        <p className="text-sm text-gray-600 leading-relaxed max-w-md mx-auto mb-6">
          {submittedResult.message}
        </p>

        {/* Score Card (Quiz Only) */}
        {form.type === 'quiz' && typeof submittedResult.score === 'number' && (
          <div className="bg-purple-50 border border-purple-200/80 rounded-2xl p-6 my-6 max-w-sm mx-auto">
            <span className="text-xs font-semibold text-purple-700 block">نمره نهایی شما در این آزمون:</span>
            <div className="text-4xl font-black text-purple-900 font-mono mt-2">
              {submittedResult.score} <span className="text-base font-normal text-purple-600">/ {submittedResult.maxScore}</span>
            </div>
            {submittedResult.maxScore ? (
              <span className="text-xs text-purple-600 mt-2 block font-medium">
                درصد پاسخگویی: {Math.round((submittedResult.score / submittedResult.maxScore) * 100)}٪
              </span>
            ) : null}
          </div>
        )}

        {/* Submission Tracking Box */}
        <div className="bg-gray-50 border border-gray-200/70 rounded-2xl p-4 my-6 text-xs text-gray-600 space-y-2 text-right">
          <div className="flex justify-between items-center border-b border-gray-200/60 pb-2">
            <span className="text-gray-400">شناسه پیگیری پاسخ:</span>
            <span className="font-mono font-bold text-gray-800">#{submittedResult.responseId}</span>
          </div>
          {respondentName && (
            <div className="flex justify-between items-center border-b border-gray-200/60 pb-2">
              <span className="text-gray-400">نام شرکت‌کننده:</span>
              <span className="font-bold text-gray-800">{respondentName}</span>
            </div>
          )}
          <div className="flex justify-between items-center">
            <span className="text-gray-400">زمان ثبت سیستم:</span>
            <span className="font-mono text-gray-700">{new Date().toLocaleDateString('fa-IR')} - {new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-6 border-t border-gray-100 flex flex-wrap justify-center gap-3 print:hidden">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-5 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-700 font-bold text-xs hover:bg-gray-50 transition-colors shadow-xs flex items-center gap-1.5"
          >
            🖨️ چاپ / ذخیره فیش
          </button>

          {form.allowMultiple !== false && (
            <button
              type="button"
              onClick={() => {
                setAnswers({});
                setSubmittedResult(null);
                setRespondentName('');
                setRespondentContact('');
                setCurrentQuestionIndex(0);
                setStepError(null);
                if (form.timeLimitMin && form.timeLimitMin > 0) {
                  setTimeLeft(form.timeLimitMin * 60);
                }
              }}
              className="px-5 py-2.5 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 font-bold text-xs hover:bg-blue-100 transition-colors"
            >
              ثبت پاسخ جدید
            </button>
          )}

          <Link
            to="/"
            className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20"
          >
            صفحه اصلی انجمن
          </Link>
        </div>
      </div>
    );
  }

  // Calculate completion progress
  const totalQuestions = form.questions?.length || 0;
  const answeredQuestionsCount = (form.questions || []).filter((q) => {
    const val = answers[q.id];
    if (val === undefined || val === null || val === '') return false;
    if (Array.isArray(val) && val.length === 0) return false;
    return true;
  }).length;
  const progressPercent = totalQuestions > 0 ? Math.round((answeredQuestionsCount / totalQuestions) * 100) : 0;

  const currentQ = totalQuestions > 0 ? form.questions[currentQuestionIndex] : null;
  const isLastQuestion = totalQuestions > 0 && currentQuestionIndex === totalQuestions - 1;
  const currentVal = currentQ ? answers[currentQ.id] : undefined;

  return (
    <div className="max-w-2xl mx-auto py-6 sm:py-10">
      {/* Floating Timer for Quiz */}
      {timeLeft !== null && (
        <div className="sticky top-20 z-20 mb-5 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center justify-between border border-slate-700">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
            <span className="text-xs font-bold">زمان باقی‌مانده آزمون:</span>
          </div>
          <span className="text-lg font-mono font-black text-amber-400" dir="ltr">
            {formatTimer(timeLeft)}
          </span>
        </div>
      )}

      {/* Main Form Card */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-200/80 overflow-hidden">
        {/* Form Header Banner */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white p-6 sm:p-8 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <span className="inline-block bg-white/20 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full">
                {form.type === 'survey'
                  ? 'نظرسنجی و بازخورد'
                  : form.type === 'quiz'
                  ? 'آزمون و کوئیز'
                  : form.type === 'registration'
                  ? 'فرم ثبت‌نام و پذیرش'
                  : form.type === 'evaluation'
                  ? 'ارزیابی و رضایت‌سنجی'
                  : 'فرم آنلاین'}
              </span>

              {totalQuestions > 0 && (
                <span className="text-xs font-mono font-bold bg-black/25 px-2.5 py-1 rounded-full text-blue-100">
                  سوال {currentQuestionIndex + 1} از {totalQuestions}
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-white leading-tight">
              {form.title}
            </h1>
            {form.description && (
              <p className="text-xs text-blue-100 mt-2 leading-relaxed max-w-xl line-clamp-2">
                {form.description}
              </p>
            )}
          </div>
        </div>

        {/* Live Progress Bar & Quick Navigation */}
        {totalQuestions > 0 && (
          <div className="bg-slate-50 px-6 sm:px-8 py-3 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-800">پیشرفت کل:</span>
              <span className="font-mono">
                {answeredQuestionsCount} از {totalQuestions} تکمیل شد ({progressPercent}٪)
              </span>
            </div>

            {/* Question Pills Navigator */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-full">
              {(form.questions || []).map((q, idx) => {
                const isAnswered =
                  answers[q.id] !== undefined &&
                  answers[q.id] !== null &&
                  answers[q.id] !== '' &&
                  (!Array.isArray(answers[q.id]) || answers[q.id].length > 0);
                const isCurrent = idx === currentQuestionIndex;

                return (
                  <button
                    key={q.id || idx}
                    type="button"
                    onClick={() => handleJumpToQuestion(idx)}
                    title={`سوال ${idx + 1}: ${q.title}`}
                    className={`w-7 h-7 rounded-lg text-xs font-mono font-bold transition-all flex items-center justify-center flex-shrink-0 ${
                      isCurrent
                        ? 'bg-blue-600 text-white ring-2 ring-blue-400 shadow-sm'
                        : isAnswered
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-gray-200/80 text-gray-600 hover:bg-gray-300'
                    }`}
                  >
                    {isAnswered && !isCurrent ? '✓' : idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Optional Respondent Information Bar */}
        <div className="bg-slate-50/70 border-b border-gray-200/80 px-6 sm:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-600">
            <span>👤</span>
            <span>مشخصات پاسخ‌دهنده (اختیاری):</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={respondentName}
              onChange={(e) => setRespondentName(e.target.value)}
              placeholder="نام و نام خانوادگی..."
              className="bg-white border border-gray-300 rounded-xl px-3 py-1.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500 w-full sm:w-40"
            />
            <input
              type="text"
              dir="ltr"
              value={respondentContact}
              onChange={(e) => setRespondentContact(e.target.value)}
              placeholder="تماس یا ایمیل..."
              className="bg-white border border-gray-300 rounded-xl px-3 py-1.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono text-right w-full sm:w-40"
            />
          </div>
        </div>

        {/* Question Area */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {totalQuestions === 0 || !currentQ ? (
            <div className="py-16 text-center text-gray-500">
              <span className="text-3xl block mb-2">📋</span>
              <p className="text-sm font-semibold text-gray-700">هنوز سوالی برای این فرم ثبت نشده است.</p>
            </div>
          ) : (
            <div
              key={currentQ.id || currentQuestionIndex}
              className="space-y-6 animate-fade-in min-h-[280px] flex flex-col justify-between"
            >
              <div>
                {/* Question Meta Header */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-blue-50 border border-blue-200 text-blue-700 px-3 py-1 rounded-xl font-bold font-mono">
                      سوال {currentQuestionIndex + 1} از {totalQuestions}
                    </span>
                    {currentQ.required ? (
                      <span className="text-[11px] bg-rose-50 text-rose-600 border border-rose-200/80 px-2 py-0.5 rounded-lg font-bold">
                        * پاسخ اجباری
                      </span>
                    ) : (
                      <span className="text-[11px] text-gray-400">اختیاری</span>
                    )}
                  </div>

                  {form.type === 'quiz' && currentQ.points && (
                    <span className="text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200/80 px-2.5 py-1 rounded-xl font-mono">
                      {currentQ.points} نمره
                    </span>
                  )}
                </div>

                {/* Question Title */}
                <h2 className="text-lg sm:text-xl font-black text-gray-900 leading-snug">
                  {currentQ.title}
                </h2>

                {/* Question Subtitle / Description */}
                {currentQ.description && (
                  <p className="text-xs sm:text-sm text-gray-500 mt-2 leading-relaxed whitespace-pre-line">
                    {currentQ.description}
                  </p>
                )}

                {/* Validation Error Alert */}
                {stepError && (
                  <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold flex items-center gap-2">
                    <span>⚠️</span>
                    <span>{stepError}</span>
                  </div>
                )}

                {/* Question Input by Mode */}
                <div className="mt-6">
                  {/* Mode 1: Short Text */}
                  {currentQ.type === 'text' && (
                    <input
                      type="text"
                      autoFocus
                      value={currentVal || ''}
                      onChange={(e) => setAnswer(currentQ.id, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (isLastQuestion) handleSubmit();
                          else handleNext();
                        }
                      }}
                      placeholder={currentQ.placeholder || 'پاسخ خود را اینجا بنویسید...'}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )}

                  {/* Mode 2: Long Text / Textarea */}
                  {currentQ.type === 'textarea' && (
                    <textarea
                      rows={4}
                      autoFocus
                      value={currentVal || ''}
                      onChange={(e) => setAnswer(currentQ.id, e.target.value)}
                      placeholder={currentQ.placeholder || 'توضیحات و پاسخ کامل خود را بنویسید...'}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )}

                  {/* Mode 3: Radio (Single Choice) */}
                  {currentQ.type === 'radio' && (
                    <div className="space-y-2.5">
                      {(currentQ.options || []).map((opt, oIdx) => {
                        const isChecked = currentVal === opt;
                        return (
                          <label
                            key={oIdx}
                            onClick={() => setAnswer(currentQ.id, opt)}
                            className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                              isChecked
                                ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500 text-blue-900 font-semibold shadow-xs'
                                : 'bg-gray-50/70 border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-gray-300'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`q_${currentQ.id}`}
                              checked={isChecked}
                              onChange={() => setAnswer(currentQ.id, opt)}
                              className="text-blue-600 focus:ring-blue-500 h-4 w-4"
                            />
                            <span className="text-sm">{opt}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {/* Mode 4: Checkbox (Multiple Choice) */}
                  {currentQ.type === 'checkbox' && (
                    <div className="space-y-2.5">
                      {(currentQ.options || []).map((opt, oIdx) => {
                        const isChecked = Array.isArray(currentVal) && currentVal.includes(opt);
                        return (
                          <label
                            key={oIdx}
                            onClick={() => handleCheckboxToggle(currentQ.id, opt)}
                            className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                              isChecked
                                ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500 text-blue-900 font-semibold shadow-xs'
                                : 'bg-gray-50/70 border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-gray-300'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleCheckboxToggle(currentQ.id, opt)}
                              className="text-blue-600 rounded focus:ring-blue-500 h-4 w-4"
                            />
                            <span className="text-sm">{opt}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {/* Mode 5: Dropdown Select */}
                  {currentQ.type === 'select' && (
                    <select
                      value={currentVal || ''}
                      onChange={(e) => setAnswer(currentQ.id, e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">-- یک مورد را انتخاب کنید --</option>
                      {(currentQ.options || []).map((opt, oIdx) => (
                        <option key={oIdx} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  )}

                  {/* Mode 6: Star Rating (1-5) */}
                  {currentQ.type === 'rating' && (
                    <div className="flex items-center gap-3 py-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setAnswer(currentQ.id, star)}
                          className={`text-3xl sm:text-4xl transition-transform hover:scale-125 focus:outline-none ${
                            (currentVal || 0) >= star ? 'text-amber-400' : 'text-gray-300 hover:text-amber-200'
                          }`}
                        >
                          ★
                        </button>
                      ))}
                      {currentVal && (
                        <span className="text-xs font-bold text-gray-600 mr-2">
                          ({currentVal} از ۵)
                        </span>
                      )}
                    </div>
                  )}

                  {/* Mode 7: Scale 1 to 10 */}
                  {currentQ.type === 'scale' && (
                    <div className="space-y-3">
                      <div className="flex gap-2 overflow-x-auto py-2">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                          const isSel = currentVal === num;
                          return (
                            <button
                              key={num}
                              type="button"
                              onClick={() => setAnswer(currentQ.id, num)}
                              className={`w-10 h-10 rounded-xl text-xs font-bold font-mono transition-all flex items-center justify-center flex-shrink-0 ${
                                isSel
                                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 scale-105'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {num}
                            </button>
                          );
                        })}
                      </div>
                      <div className="flex justify-between text-[11px] text-gray-400 px-1">
                        <span>۱ = بسیار ضعیف</span>
                        <span>۱۰ = فوق‌العاده عالی</span>
                      </div>
                    </div>
                  )}

                  {/* Mode 8: Boolean (Yes / No) */}
                  {currentQ.type === 'boolean' && (
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => setAnswer(currentQ.id, true)}
                        className={`flex-1 py-3.5 rounded-xl text-sm font-bold border transition-all ${
                          currentVal === true
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20'
                            : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        بله
                      </button>
                      <button
                        type="button"
                        onClick={() => setAnswer(currentQ.id, false)}
                        className={`flex-1 py-3.5 rounded-xl text-sm font-bold border transition-all ${
                          currentVal === false
                            ? 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-600/20'
                            : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        خیر
                      </button>
                    </div>
                  )}

                  {/* Mode 9: Number */}
                  {currentQ.type === 'number' && (
                    <input
                      type="number"
                      dir="ltr"
                      autoFocus
                      value={currentVal || ''}
                      onChange={(e) => setAnswer(currentQ.id, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (isLastQuestion) handleSubmit();
                          else handleNext();
                        }
                      }}
                      placeholder={currentQ.placeholder || '0'}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-right"
                    />
                  )}

                  {/* Mode 10: Email */}
                  {currentQ.type === 'email' && (
                    <input
                      type="email"
                      dir="ltr"
                      autoFocus
                      value={currentVal || ''}
                      onChange={(e) => setAnswer(currentQ.id, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (isLastQuestion) handleSubmit();
                          else handleNext();
                        }
                      }}
                      placeholder={currentQ.placeholder || 'name@example.com'}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-right"
                    />
                  )}

                  {/* Mode 11: Phone */}
                  {currentQ.type === 'phone' && (
                    <input
                      type="tel"
                      dir="ltr"
                      autoFocus
                      value={currentVal || ''}
                      onChange={(e) => setAnswer(currentQ.id, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (isLastQuestion) handleSubmit();
                          else handleNext();
                        }
                      }}
                      placeholder={currentQ.placeholder || '09123456789'}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-right"
                    />
                  )}

                  {/* Mode 12: Date */}
                  {currentQ.type === 'date' && (
                    <input
                      type="date"
                      dir="ltr"
                      value={currentVal || ''}
                      onChange={(e) => setAnswer(currentQ.id, e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )}

                  {/* Mode 13: File Upload */}
                  {currentQ.type === 'file' && (
                    <div className="space-y-2">
                      <label className="cursor-pointer border-2 border-dashed border-gray-300 hover:border-blue-500 rounded-2xl p-6 text-center block bg-gray-50/60 transition-colors">
                        <span className="text-2xl block mb-2">📎</span>
                        <span className="text-xs font-bold text-gray-700 block">
                          {uploadingFiles[currentQ.id]
                            ? 'در حال آپلود فایل...'
                            : currentVal
                            ? 'فایل بارگذاری شد (جهت تغییر دوباره انتخاب کنید)'
                            : 'جهت انتخاب و آپلود فایل اینجا کلیک کنید'}
                        </span>
                        <input
                          type="file"
                          disabled={uploadingFiles[currentQ.id]}
                          onChange={(e) => handleFileUpload(currentQ.id, e)}
                          className="hidden"
                        />
                      </label>
                      {currentVal && (
                        <p className="text-xs text-emerald-600 font-mono truncate" dir="ltr">
                          ✓ {currentVal}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Control Bar */}
              <div className="pt-6 border-t border-gray-100 flex items-center justify-between gap-3">
                <button
                  type="button"
                  disabled={currentQuestionIndex === 0}
                  onClick={handlePrev}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-30 disabled:pointer-events-none text-gray-700 text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <span>←</span>
                  <span>سوال قبلی</span>
                </button>

                <span className="text-xs text-gray-400 font-mono sm:hidden">
                  {currentQuestionIndex + 1} از {totalQuestions}
                </span>

                {isLastQuestion ? (
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleSubmit()}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-emerald-600/30 flex items-center gap-2"
                  >
                    {submitting && (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    )}
                    <span>ثبت و ارسال نهایی</span>
                    <span>✓</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-blue-600/20 flex items-center gap-1.5"
                  >
                    <span>سوال بعدی</span>
                    <span>→</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default PublicFormPage;
