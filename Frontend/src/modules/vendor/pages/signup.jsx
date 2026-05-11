import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { FiUser, FiMail, FiPhone, FiFileText, FiUpload, FiX, FiArrowRight, FiChevronLeft, FiCheckCircle, FiCamera } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { themeColors } from '../../../theme';
import { register, sendOTP as sendVendorOTP, verifyLogin } from '../services/authService';
import LogoLoader from '../../../components/common/LogoLoader';
import Logo from '../../../components/common/Logo';
import { compressImage } from '../../../utils/imageCompression';

import { z } from "zod";

// Zod schema for Vendor Signup
const vendorSignupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").regex(/^[a-zA-Z\s]+$/, "Name can only contain letters"),
  email: z.string().email("Please enter a valid email address"),
  phoneNumber: z.string().regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian phone number"),
  aadhar: z.string().regex(/^\d{12}$/, "Aadhar number must be exactly 12 digits"),
  pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN format (e.g. ABCDE1234F)")
});

const VendorSignup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState('details'); // 'details' or 'otp'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    aadhar: '',
    pan: '',
    service: '',
    documents: []
  });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpToken, setOtpToken] = useState('');
  const [verificationToken, setVerificationToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [documentPreview, setDocumentPreview] = useState({});
  const [uploadingDocs, setUploadingDocs] = useState({});
  const [resendTimer, setResendTimer] = useState(0);

  // Timer countdown effect
  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Refs for auto-focus
  const nameInputRef = useRef(null);
  const otpInputRefs = useRef([]);

  // Unified Flow: Pre-fill
  useEffect(() => {
    if (location.state?.phone && location.state?.verificationToken) {
      setFormData(prev => ({ ...prev, phoneNumber: location.state.phone }));
      setVerificationToken(location.state.verificationToken);
    }
  }, [location.state]);

  // Clear any existing vendor tokens on page load
  useEffect(() => {
    localStorage.removeItem('vendorAccessToken');
    localStorage.removeItem('vendorRefreshToken');
    localStorage.removeItem('vendorData');
  }, []);

  // Auto-focus logic
  useEffect(() => {
    if (step === 'details' && nameInputRef.current) {
      setTimeout(() => nameInputRef.current.focus(), 100);
    } else if (step === 'otp' && otpInputRefs.current[0]) {
      setTimeout(() => otpInputRefs.current[0].focus(), 100);
    }
  }, [step]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDocumentUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/gif', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid image or PDF');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      toast.error('File size should be less than 15MB');
      return;
    }

    setUploadingDocs(prev => ({ ...prev, [type]: true }));
    const loadingToast = toast.loading("Processing file...");

    try {
      let fileToUpload = file;
      let previewUrl = '';

      // Compress if it is an image
      if (file.type.startsWith('image/')) {
        try {
          const compressedFile = await compressImage(file, {
            maxWidth: 1280, // Reasonable max width for documents
            maxHeight: 1280,
            quality: 0.8
          });
          fileToUpload = compressedFile;
          toast.dismiss(loadingToast); // Dismiss compression loading
        } catch (compressionError) {
          console.error("Compression failed, using original file", compressionError);
          toast.error("Compression failed, using original");
          // fileToUpload remains original
        }
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        previewUrl = reader.result;
        setFormData(prev => ({
          ...prev,
          documents: [...prev.documents.filter(d => d.type !== type), { type, file: fileToUpload, url: previewUrl }]
        }));
        setDocumentPreview(prev => ({
          ...prev,
          [type]: previewUrl
        }));
        setUploadingDocs(prev => ({ ...prev, [type]: false }));
        toast.success("Image uploaded", { duration: 2000 });
      };

      reader.onerror = () => {
        console.error("FileReader failed");
        toast.error("Failed to read file");
        setUploadingDocs(prev => ({ ...prev, [type]: false }));
      };

      reader.readAsDataURL(fileToUpload);

    } catch (error) {
      console.error("Upload processing error", error);
      toast.dismiss(loadingToast);
      toast.error("Failed to process file");
      setUploadingDocs(prev => ({ ...prev, [type]: false }));
    }
  };

  const removeDocument = (type) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter(d => d.type !== type)
    }));
    setDocumentPreview(prev => {
      const newPreview = { ...prev };
      delete newPreview[type];
      return newPreview;
    });
  };

  const handleDetailsSubmit = async (e) => {
    e.preventDefault();

    // Zod Validation
    const validationResult = vendorSignupSchema.safeParse({
      name: formData.name,
      email: formData.email,
      phoneNumber: formData.phoneNumber,
      aadhar: formData.aadhar,
      pan: formData.pan
    });

    if (!validationResult.success) {
      validationResult.error.issues.forEach(err => toast.error(err.message));
      return;
    }

    // Manual Document Validation remains
    const hasAadharDoc = formData.documents.some(d => d.type === 'aadhar');
    const hasAadharBackDoc = formData.documents.some(d => d.type === 'aadharBack');
    const hasPanDoc = formData.documents.some(d => d.type === 'pan');
    if (!hasAadharDoc) { toast.error('Please upload Aadhar Front document'); return; }
    if (!hasAadharBackDoc) { toast.error('Please upload Aadhar Back document'); return; }
    if (!hasPanDoc) { toast.error('Please upload PAN document'); return; }

    setIsLoading(true);

    if (verificationToken) {
      try {
        const aadharDoc = formData.documents.find(d => d.type === 'aadhar')?.url || null;
        const aadharBackDoc = formData.documents.find(d => d.type === 'aadharBack')?.url || null;
        const panDoc = formData.documents.find(d => d.type === 'pan')?.url || null;
        const otherDocs = formData.documents.filter(d => d.type === 'other').map(d => d.url);

        const registerData = {
          name: formData.name,
          email: formData.email,
          phone: formData.phoneNumber,
          aadhar: formData.aadhar,
          pan: formData.pan,
          service: [],
          aadharDocument: aadharDoc,
          aadharBackDocument: aadharBackDoc,
          panDocument: panDoc,
          otherDocuments: otherDocs,
          verificationToken
        };

        const response = await register(registerData);

        if (response.success) {
          toast.success(
            <div className="flex flex-col">
              <span className="font-bold">Application Submitted!</span>
              <span className="text-xs">Please complete the training module.</span>
            </div>,
            { icon: <FiCheckCircle className="text-[#D68F35]" />, duration: 5000 }
          );
          navigate('/vendor/training');
        } else {
          toast.error(response.message || 'Registration failed');
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Registration failed');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    try {
      const response = await sendVendorOTP(formData.phoneNumber);
      if (response.success) {
        if (response.vendor?.adminApproval?.toLowerCase() === 'pending') {
          setIsLoading(false);
          toast.error('Your account is currently under review. Please wait for admin approval.', {
            duration: 5000,
            icon: '⏳'
          });
          return;
        }

        if (!response.token) {
          setIsLoading(false);
          toast.error(response.message || 'Failed to initialize verification.');
          return;
        }

        setOtpToken(response.token);
        setIsLoading(false);
        setStep('otp');
        setResendTimer(120); // Start timer
        toast.success('OTP sent successfully');
      } else {
        setIsLoading(false);
        toast.error(response.message || 'Failed to send OTP');
      }
    } catch (error) {
      setIsLoading(false);
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    }
  };

  const handleOtpChange = (index, value) => {
    const cleanValue = value.replace(/\D/g, '').slice(0, 1);
    const newOtp = [...otp];
    newOtp[index] = cleanValue;
    setOtp(newOtp);

    if (cleanValue && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Auto-verify as last digit enters
  useEffect(() => {
    const otpValue = otp.join('');
    if (otpValue.length === 6 && !isLoading && otpToken) {
      handleOtpSubmit();
    }
  }, [otp]);

  const handleOtpSubmit = async (e) => {
    if (e) e.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      toast.error('Please enter complete OTP');
      return;
    }
    if (!otpToken) {
      toast.error('Please request OTP first');
      return;
    }
    setIsLoading(true);
    try {
      // 1. Verify OTP using the unified verify-login endpoint
      // This will return isNewUser: true and a verificationToken for new vendors
      const response = await verifyLogin({ 
        phone: formData.phoneNumber, 
        otp: otpValue 
      });

      if (response.success && response.isNewUser) {
        setIsLoading(false);
        toast.success('OTP Verified! Please complete the training module.');
        
        // Prepare registration data to be passed to Training page
        const aadharDoc = formData.documents.find(d => d.type === 'aadhar')?.url || null;
        const aadharBackDoc = formData.documents.find(d => d.type === 'aadharBack')?.url || null;
        const panDoc = formData.documents.find(d => d.type === 'pan')?.url || null;
        const otherDocs = formData.documents.filter(d => d.type === 'other').map(d => d.url);

        const pendingRegisterData = {
          name: formData.name,
          email: formData.email,
          phone: formData.phoneNumber,
          aadhar: formData.aadhar,
          pan: formData.pan,
          service: [], // Default empty
          aadharDocument: aadharDoc,
          aadharBackDocument: aadharBackDoc,
          panDocument: panDoc,
          otherDocuments: otherDocs,
          verificationToken: response.verificationToken
        };

        // Store in sessionStorage as fallback
        sessionStorage.setItem('pendingVendorRegistration', JSON.stringify(pendingRegisterData));
        
        // Navigate to training with data
        navigate('/vendor/training', { state: { registerData: pendingRegisterData } });
      } else if (response.success && !response.isNewUser) {
        // This shouldn't happen if they came through signup flow with a new number,
        // but if they are already a vendor, they might be logged in now.
        setIsLoading(false);
        toast.success('Account already exists. Logged in successfully.');
        navigate('/vendor/dashboard');
      } else {
        setIsLoading(false);
        toast.error(response.message || 'Verification failed');
      }
    } catch (error) {
      setIsLoading(false);
      toast.error(error.response?.data?.message || 'Verification failed');
    }
  };

  const brandColor = themeColors.brand?.teal || '#347989';

  return (
  return (
    <div className="min-h-screen bg-white flex flex-col justify-center py-12 px-5 relative overflow-hidden">
      
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl text-center mb-12 relative z-10 animate-fade-in">
        <div className="w-24 h-24 bg-black rounded-[40px] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-gray-200 transform hover:rotate-6 transition-transform duration-500">
          <Logo className="h-10 w-auto invert" />
        </div>
        <h2 className="text-sm font-black text-black uppercase tracking-[0.4em] mb-3">
          {step === 'details' ? 'Network Enrollment' : 'Security Clearance'}
        </h2>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-loose">
          Partner with PlugPro and scale your operations
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-2xl relative z-10">
        <div className="bg-white py-12 px-8 shadow-2xl shadow-gray-200/50 rounded-[64px] border border-gray-50 relative overflow-hidden animate-slide-in-bottom">
          
          {step === 'details' ? (
            <form onSubmit={handleDetailsSubmit} className="space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Basic Details */}
                <div className="space-y-6">
                  <h3 className="text-xs font-black text-black uppercase tracking-[0.3em] border-b border-gray-50 pb-4">Professional Identity</h3>

                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Legal Name</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-black">
                        <FiUser className="w-4 h-4" />
                      </div>
                      <input
                        ref={nameInputRef}
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        className="block w-full pl-12 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-[11px] font-black uppercase tracking-widest focus:bg-white focus:border-black outline-none transition-all duration-300"
                        placeholder="ENTER NAME"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Interface</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-black">
                        <FiMail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="block w-full pl-12 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-[11px] font-black uppercase tracking-widest focus:bg-white focus:border-black outline-none transition-all duration-300"
                        placeholder="EMAIL@DOMAIN.COM"
                      />
                    </div>
                  </div>

                  {!verificationToken && (
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Verified Mobile</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-5 pr-3 flex items-center pointer-events-none text-black">
                          <span className="text-[10px] font-black border-r border-gray-100 pr-3">+91</span>
                        </div>
                        <input
                          type="tel"
                          required
                          value={formData.phoneNumber}
                          onChange={(e) => setFormData(p => ({ ...p, phoneNumber: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                          className="block w-full pl-16 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-[11px] font-black tracking-[0.2em] focus:bg-white focus:border-black outline-none transition-all duration-300"
                          placeholder="0000000000"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Aadhar Identification</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-black">
                        <FiFileText className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={formData.aadhar}
                        onChange={(e) => setFormData(p => ({ ...p, aadhar: e.target.value.replace(/\D/g, '').slice(0, 12) }))}
                        className="block w-full pl-12 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-[11px] font-black tracking-[0.3em] focus:bg-white focus:border-black outline-none transition-all duration-300"
                        placeholder="0000 0000 0000"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">PAN Certification</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-black">
                        <FiFileText className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={formData.pan}
                        onChange={(e) => setFormData(p => ({ ...p, pan: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10) }))}
                        className="block w-full pl-12 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-[11px] font-black tracking-[0.3em] focus:bg-white focus:border-black outline-none transition-all duration-300"
                        placeholder="ABCDE1234F"
                      />
                    </div>
                  </div>
                </div>

                {/* Documents Section */}
                <div className="space-y-6">
                  <h3 className="text-xs font-black text-black uppercase tracking-[0.3em] border-b border-gray-50 pb-4">Verification Vault</h3>

                  <div className="grid grid-cols-1 gap-4">
                    {/* Aadhar Front Upload */}
                    <div className="space-y-2">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Aadhar Certification (Front)</p>
                      {documentPreview.aadhar ? (
                        <div className="relative group overflow-hidden rounded-3xl border border-gray-100">
                          <img src={documentPreview.aadhar} className="w-full h-24 object-cover transform group-hover:scale-105 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button type="button" onClick={() => removeDocument('aadhar')} className="bg-white text-black rounded-xl p-2.5 shadow-xl">
                              <FiX size={16} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-100 rounded-3xl hover:border-black transition-all duration-300 bg-gray-50 group relative">
                          {uploadingDocs.aadhar && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10 rounded-3xl">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black"></div>
                            </div>
                          )}
                          <label className="flex items-center gap-4 cursor-pointer w-full h-full justify-center px-6">
                            <FiUpload className="w-5 h-5 text-gray-300 group-hover:text-black transition-colors" />
                            <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Select Image</span>
                            <input type="file" className="hidden" accept="image/*,application/pdf" onChange={(e) => handleDocumentUpload(e, 'aadhar')} disabled={uploadingDocs.aadhar} />
                          </label>
                        </div>
                      )}
                    </div>

                    {/* Aadhar Back Upload */}
                    <div className="space-y-2">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Aadhar Certification (Back)</p>
                      {documentPreview.aadharBack ? (
                        <div className="relative group overflow-hidden rounded-3xl border border-gray-100">
                          <img src={documentPreview.aadharBack} className="w-full h-24 object-cover transform group-hover:scale-105 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button type="button" onClick={() => removeDocument('aadharBack')} className="bg-white text-black rounded-xl p-2.5 shadow-xl">
                              <FiX size={16} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-100 rounded-3xl hover:border-black transition-all duration-300 bg-gray-50 group relative">
                          {uploadingDocs.aadharBack && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10 rounded-3xl">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black"></div>
                            </div>
                          )}
                          <label className="flex items-center gap-4 cursor-pointer w-full h-full justify-center px-6">
                            <FiUpload className="w-5 h-5 text-gray-300 group-hover:text-black transition-colors" />
                            <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Select Image</span>
                            <input type="file" className="hidden" accept="image/*,application/pdf" onChange={(e) => handleDocumentUpload(e, 'aadharBack')} disabled={uploadingDocs.aadharBack} />
                          </label>
                        </div>
                      )}
                    </div>

                    {/* PAN Upload */}
                    <div className="space-y-2">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Taxation Certification (PAN)</p>
                      {documentPreview.pan ? (
                        <div className="relative group overflow-hidden rounded-3xl border border-gray-100">
                          <img src={documentPreview.pan} className="w-full h-24 object-cover transform group-hover:scale-105 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button type="button" onClick={() => removeDocument('pan')} className="bg-white text-black rounded-xl p-2.5 shadow-xl">
                              <FiX size={16} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-100 rounded-3xl hover:border-black transition-all duration-300 bg-gray-50 group relative">
                          {uploadingDocs.pan && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10 rounded-3xl">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black"></div>
                            </div>
                          )}
                          <label className="flex items-center gap-4 cursor-pointer w-full h-full justify-center px-6">
                            <FiUpload className="w-5 h-5 text-gray-300 group-hover:text-black transition-colors" />
                            <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Select Image</span>
                            <input type="file" className="hidden" accept="image/*,application/pdf" onChange={(e) => handleDocumentUpload(e, 'pan')} disabled={uploadingDocs.pan} />
                          </label>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-6 bg-gray-50 rounded-[28px] border border-gray-100">
                    <p className="text-[9px] font-black text-gray-400 leading-loose uppercase tracking-widest">
                      PlugPro Security Protocol: Ensure all visual documents are legible and officially issued to expedite verification.
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-6 px-6 bg-black text-white text-[12px] font-black uppercase tracking-[0.3em] rounded-[32px] shadow-2xl shadow-gray-200 transition-all duration-500 hover:scale-[1.01] active:scale-95 disabled:opacity-20"
              >
                {isLoading ? (
                  'Synchronizing...'
                ) : (
                  <span className="flex items-center">
                    {verificationToken ? 'Finalize Application' : 'Proceed to Security Check'}
                    <FiArrowRight className="ml-3 group-hover:translate-x-2 transition-transform" />
                  </span>
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-10">
              <button
                onClick={() => setStep('details')}
                className="inline-flex items-center text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-black transition-colors"
              >
                <FiChevronLeft className="mr-2" /> Re-check profile
              </button>

              <div className="text-center">
                <h3 className="text-sm font-black text-black uppercase tracking-[0.3em] mb-2">Biometric Verification</h3>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Enter authentication code</p>
              </div>

              <form onSubmit={handleOtpSubmit} className="space-y-12">
                <div className="flex justify-between gap-4 px-2 sm:px-12">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (otpInputRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-full h-16 text-center text-xl font-black bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-black outline-none transition-all duration-300"
                    />
                  ))}
                </div>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={async () => {
                      if (resendTimer > 0) return;
                      try {
                        const response = await sendVendorOTP(formData.phoneNumber);
                        if (response.success) {
                          setOtpToken(response.token);
                          setResendTimer(120);
                          toast.success('Code re-transmitted');
                        }
                      } catch (e) { toast.error('Transmission failed'); }
                    }}
                    disabled={resendTimer > 0}
                    className="text-[10px] font-black uppercase tracking-widest text-black disabled:text-gray-200"
                  >
                    {resendTimer > 0
                      ? `Transmit available in ${Math.floor(resendTimer / 60)}:${String(resendTimer % 60).padStart(2, '0')}`
                      : 'Transmit Code'}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || otp.join('').length !== 6}
                  className="group relative w-full flex justify-center py-6 px-6 bg-black text-white text-[12px] font-black uppercase tracking-[0.3em] rounded-[32px] shadow-2xl shadow-gray-200 transition-all duration-500 hover:scale-[1.01] active:scale-95 disabled:opacity-20"
                >
                  <span className="relative z-10 flex items-center justify-center">
                    {isLoading ? (
                      'Authenticating...'
                    ) : (
                      'Authorize & Register'
                    )}
                  </span>
                </button>
              </form>
            </div>
          )}
        </div>

        <p className="mt-12 text-center">
          <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Already a network partner?</span>{' '}
          <Link to="/vendor/login" className="text-[10px] font-black text-black uppercase tracking-widest border-b-2 border-black ml-2 hover:bg-black hover:text-white transition-all px-1">
            Sign In
          </Link>
        </p>
      </div >
    </div >
  );
};
  );
};

export default VendorSignup;
