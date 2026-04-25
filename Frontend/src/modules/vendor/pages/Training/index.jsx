import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCheckCircle, FiPlayCircle, FiList, FiAlertCircle } from 'react-icons/fi';
import Logo from '../../../../components/common/Logo';
import { themeColors } from '../../../../theme';
import { toast } from 'react-hot-toast';
import { getActiveTraining } from '../../services/trainingService';
import { register } from '../../services/authService';
import LogoLoader from '../../../../components/common/LogoLoader';
import { useLocation } from 'react-router-dom';

const VendorTraining = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [trainingData, setTrainingData] = useState(null);
  const [step, setStep] = useState('video'); // 'video' | 'mcq' | 'result'
  const [isVideoWatched, setIsVideoWatched] = useState(false);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(45);
  const brandColor = themeColors.brand?.teal || '#347989';

  useEffect(() => {
    const fetchTraining = async () => {
      try {
        setLoading(true);
        const res = await getActiveTraining();
        if (res.success) {
          setTrainingData(res.data);
          if (res.data.videoDuration) {
            setTimeLeft(res.data.videoDuration);
          }
        }
      } catch (error) {
        console.error('Fetch training error:', error);
        toast.error('Failed to load training materials. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchTraining();
  }, []);

  useEffect(() => {
    let timer;
    if (step === 'video' && !isVideoWatched && trainingData) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsVideoWatched(true);
            toast.success('Training completed! You can now start the test.');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, isVideoWatched, trainingData]);

  if (loading) return <LogoLoader />;

  if (!trainingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-md">
          <FiAlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Training Assigned</h3>
          <p className="text-gray-500 mb-6">Please contact support or try logging in again if you've already completed training.</p>
          <button onClick={() => navigate('/vendor/login')} className="w-full py-3 rounded-xl text-white font-bold" style={{ backgroundColor: brandColor }}>Back to Login</button>
        </div>
      </div>
    );
  }

  const handleProceedToTest = () => setStep('mcq');

  const handleOptionSelect = (qId, optionIndex) => {
    setAnswers({ ...answers, [qId]: optionIndex });
  };

  const handleSubmitTest = () => {
    if (Object.keys(answers).length < trainingData.questions.length) {
      toast.error('Please answer all questions before submitting.');
      return;
    }
    let calculatedScore = 0;
    trainingData.questions.forEach((q, index) => {
      if (answers[index] === q.correctOptionIndex) calculatedScore += 1;
    });
    setScore(calculatedScore);
    setStep('result');
  };

  const handleFinish = async () => {
    if (score >= (trainingData.minimumScore || 3)) {
      // Logic for registration AFTER training
      const pendingData = location.state?.registerData || JSON.parse(sessionStorage.getItem('pendingVendorRegistration') || 'null');
      
      if (pendingData) {
        try {
          setLoading(true);
          const res = await register({ ...pendingData, trainingScore: score });
          if (res.success) {
            toast.success('Registration Complete! Please wait for admin approval.');
            sessionStorage.removeItem('pendingVendorRegistration');
            navigate('/vendor/login');
          } else {
            toast.error(res.message || 'Registration failed at final step.');
          }
        } catch (error) {
          toast.error('Something went wrong during registration.');
        } finally {
          setLoading(false);
        }
      } else {
        // Fallback for cases without registration context
        toast.success('Training Completed Successfully!');
        navigate('/vendor/login');
      }
    } else {
      toast.error('You need to score better. Retrying test...');
      setStep('video');
      setIsVideoWatched(false);
      setTimeLeft(trainingData.videoDuration || 45);
      setAnswers({});
      setScore(0);
    }
  };

  // Helper to extract YouTube video ID and make embed URL
  const getEmbedUrl = (url) => {
    if (url.includes('youtube.com/embed/')) return url;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    const videoId = (match && match[2].length === 11) ? match[2] : null;
    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=0&disablekb=1&modestbranding=1&rel=0` : url;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl text-center mb-8">
        <Logo className="h-16 w-auto mx-auto" />
        <h2 className="mt-4 text-3xl font-extrabold text-gray-900 tracking-tight">{trainingData.title || 'Partner Training'}</h2>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-3xl">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-gray-100">
          
          <div className="flex items-center justify-center mb-8 border-b pb-6 text-sm font-medium">
             <div className={`flex items-center ${step === 'video' ? 'text-[#347989]' : 'text-gray-400'}`}>
                <FiPlayCircle className="mr-2" /> 1. Video Training
             </div>
             <div className="w-12 h-px bg-gray-300 mx-4"></div>
             <div className={`flex items-center ${step === 'mcq' || step === 'result' ? 'text-[#347989]' : 'text-gray-400'}`}>
                <FiList className="mr-2" /> 2. Knowledge Test
             </div>
          </div>

          {step === 'video' && (
            <div className="space-y-6 animate-fade-in text-center">
              <div className="bg-slate-900 rounded-xl aspect-video flex items-center justify-center relative overflow-hidden border-2 border-slate-800 shadow-2xl">
                <iframe 
                  className="w-full h-full"
                  src={getEmbedUrl(trainingData.videoUrl)} 
                  title="Training Video" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                ></iframe>
                <div className="absolute inset-0 z-10 bg-transparent"></div>
              </div>
              
              <div className="bg-orange-50 text-orange-800 p-4 rounded-xl flex items-center justify-center gap-3 border border-orange-100 font-bold text-lg">
                 <FiAlertCircle className="animate-pulse" />
                 <span>{isVideoWatched ? "Training Complete!" : `Unlocking Test in: ${timeLeft}s`}</span>
              </div>

              <button
                onClick={handleProceedToTest}
                disabled={!isVideoWatched}
                className="w-full py-4 px-4 rounded-xl text-white font-bold transition-all disabled:opacity-30 disabled:grayscale shadow-lg hover:shadow-xl transform active:scale-[0.98] text-lg"
                style={{ backgroundColor: brandColor }}
              >
                {isVideoWatched ? 'Start Knowledge Test' : `Please Watch Full Video`}
              </button>
            </div>
          )}

          {step === 'mcq' && (
            <div className="space-y-8 animate-fade-in">
              {trainingData.questions.map((q, index) => (
                <div key={index} className="bg-gray-50 p-5 rounded-xl border border-gray-100 shadow-sm">
                  <h4 className="font-bold text-gray-900 mb-4">{index + 1}. {q.question}</h4>
                  <div className="space-y-2">
                    {q.options.map((opt, optIdx) => (
                      <label key={optIdx} className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${answers[index] === optIdx ? 'border-[#347989] bg-[#347989]/5 shadow-sm' : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
                        <input type="radio" name={`q-${index}`} className="mr-3 text-[#347989]" checked={answers[index] === optIdx} onChange={() => handleOptionSelect(index, optIdx)}/>
                        <span className="text-gray-700">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
              <button onClick={handleSubmitTest} className="w-full py-4 rounded-xl text-white font-bold shadow-lg" style={{ backgroundColor: brandColor }}>Submit Answers</button>
            </div>
          )}

          {step === 'result' && (
            <div className="text-center py-8 animate-fade-in space-y-6">
              <div className="mx-auto w-24 h-24 rounded-full flex items-center justify-center" style={{ backgroundColor: score >= (trainingData.minimumScore || 3) ? '#d1fae5' : '#fee2e2', color: score >= (trainingData.minimumScore || 3) ? '#059669' : '#dc2626' }}>
                {score >= (trainingData.minimumScore || 3) ? <FiCheckCircle size={48} /> : <FiAlertCircle size={48} />}
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{score >= (trainingData.minimumScore || 3) ? 'Test Passed!' : 'Test Failed'}</h3>
              <p className="text-gray-500">Score: {score} / {trainingData.questions.length}</p>
              <button onClick={handleFinish} className="w-full py-4 rounded-xl text-white font-bold shadow-lg" style={{ backgroundColor: brandColor }}>{score >= (trainingData.minimumScore || 3) ? 'Go to Login' : 'Retry'}</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorTraining;
