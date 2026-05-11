import React, { useState, useEffect, useLayoutEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiSave, FiX, FiLink, FiUserPlus, FiSearch, FiChevronDown, FiCamera, FiUpload, FiMapPin } from 'react-icons/fi';
import AddressSelectionModal from '../../../user/pages/Checkout/components/AddressSelectionModal';
import { vendorTheme as themeColors } from '../../../../theme';
import Header from '../../components/layout/Header';
import BottomNav from '../../components/layout/BottomNav';
import { createWorker, updateWorker, getWorkerById, linkWorker } from '../../services/workerService';
import { publicCatalogService } from '../../../../services/catalogService';
import { toast } from 'react-hot-toast';
import { z } from "zod";

// Zod schemas
const addWorkerSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().regex(/^\d{10}$/, "Enter valid 10-digit phone number"),
  serviceCategories: z.array(z.string()).min(1, "Select at least one category"),
  aadhar: z.object({
    number: z.string().regex(/^\d{12}$/, "Aadhar must be 12 digits"),
    // document: z.any() 
  }),
  // address: z.any().optional() // Make address optional or strict as needed
});

const editWorkerSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().regex(/^\d{10}$/, "Enter valid 10-digit phone number"),
  serviceCategories: z.array(z.string()).min(1, "Select at least one category"),
});

const AddEditWorker = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [activeTab, setActiveTab] = useState('new'); // 'new' | 'link'
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    aadhar: {
      number: '',
      document: '' // Base64 string ideally
    },
    serviceCategories: [],
    address: {
      addressLine1: '',
      city: '',
      state: '',
      pincode: ''
    },
    status: 'active',
    profilePhoto: '', // URL
  });

  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [aadharFile, setAadharFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  const [linkPhone, setLinkPhone] = useState('');

  const [errors, setErrors] = useState({});

  useLayoutEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const root = document.getElementById('root');
    const bgStyle = themeColors.backgroundGradient;

    if (html) html.style.background = bgStyle;
    if (body) body.style.background = bgStyle;
    if (root) root.style.background = bgStyle;

    return () => {
      if (html) html.style.background = '';
      if (body) body.style.background = '';
      if (root) root.style.background = '';
    };
  }, []);

  useEffect(() => {
    const initData = async () => {
      try {
        const catRes = await publicCatalogService.getCategories();
        if (catRes.success) {
          console.log('Loaded Categories:', catRes.categories || []);
          setCategories(catRes.categories || []);
        }

        if (isEdit) {
          setLoading(true);
          const res = await getWorkerById(id);
          if (res.success) {
            const w = res.data;
            setFormData({
              name: w.name || '',
              phone: w.phone || '',
              email: w.email || '',
              aadhar: {
                number: w.aadhar?.number || '',
                document: w.aadhar?.document || ''
              },
              serviceCategories: w.serviceCategories || (w.serviceCategory ? [w.serviceCategory] : []),
              address: {
                addressLine1: w.address?.addressLine1 || '',
                city: w.address?.city || '',
                state: w.address?.state || '',
                pincode: w.address?.pincode || ''
              },
              status: w.status || 'active',
              profilePhoto: w.profilePhoto || ''
            });

            if (w.profilePhoto) {
              setPhotoPreview(w.profilePhoto);
            }
          }
          setLoading(false);
        }
      } catch (error) {
        console.error('Init error:', error);
        toast.error('Failed to load data');
        setLoading(false);
      }
    };
    initData();
  }, [id, isEdit]);

  // Upload file helper
  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    let baseUrl = import.meta.env.VITE_API_BASE_URL || '';
    if (!baseUrl) {
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        baseUrl = 'http://localhost:5000';
      } else {
        baseUrl = window.location.origin;
      }
    }
    baseUrl = baseUrl.replace(/\/api$/, '');
    const response = await fetch(`${baseUrl}/api/image/upload`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    if (!data.success) throw new Error(data.message || 'Upload failed');
    return data.imageUrl;
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB');
        return;
      }
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleAadharChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB');
        return;
      }
      setAadharFile(file);
    }
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  const toggleCategory = (val) => {
    setFormData(prev => {
      const serviceCategories = prev.serviceCategories.includes(val)
        ? prev.serviceCategories.filter(c => c !== val)
        : [...prev.serviceCategories, val];

      return {
        ...prev,
        serviceCategories
      };
    });
  };

  const handleAddressSave = (houseNumber, location) => {
    let city = '';
    let state = '';
    let pincode = '';
    let addressLine2 = '';

    if (location.components) {
      location.components.forEach(comp => {
        if (comp.types.includes('locality')) city = comp.long_name;
        if (comp.types.includes('administrative_area_level_1')) state = comp.long_name;
        if (comp.types.includes('postal_code')) pincode = comp.long_name;
        if (comp.types.includes('sublocality')) addressLine2 = comp.long_name;
      });
    }

    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        addressLine1: houseNumber,
        addressLine2: addressLine2,
        city: city,
        state: state,
        pincode: pincode,
        fullAddress: location.address
      }
    }));
    setIsAddressModalOpen(false);
  };

  // toggleSkill removed


  const handleSubmit = async () => {
    // Zod Validation depending on mode
    const schema = isEdit ? editWorkerSchema : addWorkerSchema;

    // Construct validation object
    const validationData = {
      name: formData.name,
      phone: formData.phone,
      serviceCategories: formData.serviceCategories,
      ...(isEdit ? {} : { aadhar: { number: formData.aadhar.number } })
    };

    const validationResult = schema.safeParse(validationData);

    if (!validationResult.success) {
      toast.error(validationResult.error.errors[0].message);
      return;
    }

    // Additional manual check for Aadhar doc on 'new'
    if (!isEdit && !formData.aadhar.document && !aadharFile) {
      toast.error("Aadhar document is required");
      return;
    }

    try {
      setLoading(true);
      setUploading(true);

      let photoUrl = formData.profilePhoto;
      let aadharUrl = formData.aadhar.document;

      // Upload photo if selected
      if (photoFile) {
        try {
          photoUrl = await uploadFile(photoFile);
        } catch (err) {
          console.error('Photo upload failed:', err);
          toast.error('Failed to upload profile photo');
          setLoading(false);
          setUploading(false);
          return;
        }
      }

      // Upload Aadhar if selected
      if (aadharFile) {
        try {
          aadharUrl = await uploadFile(aadharFile);
        } catch (err) {
          console.error('Aadhar upload failed:', err);
          toast.error('Failed to upload Aadhar document');
          setLoading(false);
          setUploading(false);
          return;
        }
      }

      // Clean payload
      const payload = {
        ...formData,
        profilePhoto: photoUrl,
        aadhar: {
          ...formData.aadhar,
          document: aadharUrl || 'pending_upload' // Ensure strictly that we have something
        }
      };

      if (!payload.aadhar.document && !isEdit) {
        // Should have been caught by validation, but double check
        // If still empty and no file, maybe error?
        // For now let backend handle it or user re-try
      }

      if (isEdit) {
        await updateWorker(id, payload);
        toast.success('Worker updated');
      } else {
        await createWorker(payload);
        toast.success('Worker added');
      }
      window.dispatchEvent(new Event('vendorWorkersUpdated'));
      navigate('/vendor/workers');
    } catch (error) {
      console.error('Save error:', error);
      toast.error(error.response?.data?.message || 'Failed to save');
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  const handleLinkWorker = async () => {
    if (!linkPhone.trim() || linkPhone.length < 10) {
      toast.error('Enter valid phone number');
      return;
    }
    try {
      setLoading(true);
      await linkWorker(linkPhone);
      toast.success('Worker linked successfully!');
      window.dispatchEvent(new Event('vendorWorkersUpdated'));
      navigate('/vendor/workers');
    } catch (error) {
      console.error('Link error:', error);
      toast.error(error.response?.data?.message || 'Failed to link worker');
    } finally {
      setLoading(false);
    }
  };

  // selectedCategoriesData and allAvailableSkills removed as they are no longer needed

  return (
  return (
    <div className="min-h-screen pb-20 bg-white">
      <Header title={isEdit ? 'Edit Worker' : 'Add Worker'} />

      <main className="px-4 py-6 max-w-lg mx-auto">

        {/* Tabs for Add New vs Link (Black Theme) */}
        {!isEdit && (
          <div className="flex bg-gray-50 rounded-2xl p-1.5 mb-8 border border-gray-100 shadow-sm">
            <button
              onClick={() => setActiveTab('new')}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${activeTab === 'new'
                ? 'bg-black text-white shadow-xl shadow-gray-200'
                : 'text-gray-400'
                }`}
            >
              <FiUserPlus className="w-4 h-4" />
              New Profile
            </button>
            <button
              onClick={() => setActiveTab('link')}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${activeTab === 'link'
                ? 'bg-black text-white shadow-xl shadow-gray-200'
                : 'text-gray-400'
                }`}
            >
              <FiLink className="w-4 h-4" />
              Link Worker
            </button>
          </div>
        )}

        {/* Link Existing Mode (Black Theme) */}
        {activeTab === 'link' && !isEdit && (
          <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 text-center space-y-6">
            <div className="w-20 h-20 rounded-3xl bg-gray-50 flex items-center justify-center mx-auto mb-2 border border-gray-100 text-black shadow-sm">
              <FiSearch className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-black text-gray-900 uppercase tracking-widest mb-2">Sync Existing Worker</h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter leading-relaxed px-4">
                Enter the verified phone number to add a registered worker to your fleet.
              </p>
            </div>

            <div className="pt-4">
              <input
                type="tel"
                value={linkPhone}
                onChange={(e) => setLinkPhone(e.target.value)}
                placeholder="0000000000"
                className="w-full px-6 py-5 bg-gray-50 border border-gray-100 rounded-2xl focus:border-black focus:bg-white outline-none text-center text-2xl font-black tracking-[0.2em] text-gray-900"
                maxLength={10}
              />
            </div>

            <button
              onClick={handleLinkWorker}
              disabled={loading}
              className="w-full py-5 text-white rounded-[24px] font-black text-[11px] uppercase tracking-[0.2em] bg-black shadow-2xl shadow-gray-200 active:scale-95 transition-all flex items-center justify-center gap-3 mt-4"
            >
              {loading ? 'Processing...' : 'Search & Sync'}
            </button>
          </div>
        )}

        {/* Create / Edit Mode (Black Theme) */}
        {(activeTab === 'new' || isEdit) && (
          <div className="space-y-8">

            {/* Profile Photo Upload */}
            <div className="flex flex-col items-center justify-center mb-4">
              <div className="relative">
                <div className="w-28 h-28 rounded-[40px] overflow-hidden border-4 border-white shadow-2xl bg-gray-50 flex items-center justify-center group relative">
                  {photoPreview || formData.profilePhoto ? (
                    <img
                      src={photoPreview || formData.profilePhoto}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-gray-300">
                      <FiUserPlus className="w-10 h-10 mb-2" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <FiCamera className="text-white w-6 h-6" />
                  </div>
                  <input
                    id="worker-photo-upload"
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handlePhotoChange}
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-black rounded-2xl flex items-center justify-center shadow-lg border-2 border-white">
                  <FiPlusCircle className="text-white w-5 h-5" />
                </div>
              </div>
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mt-6">Profile Snapshot</p>
            </div>

            {/* Basic Info */}
            <div className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-100 space-y-6">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Contact Information</h4>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="ENTER NAME"
                    className="w-full px-5 py-4 bg-gray-50 rounded-2xl border border-gray-100 focus:border-black focus:bg-white outline-none text-xs font-black text-gray-900 uppercase tracking-widest transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Mobile Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="0000000000"
                    className="w-full px-5 py-4 bg-gray-50 rounded-2xl border border-gray-100 focus:border-black focus:bg-white outline-none text-xs font-black text-gray-900 tracking-[0.2em] transition-all"
                    maxLength={10}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="EMAIL (OPTIONAL)"
                    className="w-full px-5 py-4 bg-gray-50 rounded-2xl border border-gray-100 focus:border-black focus:bg-white outline-none text-xs font-black text-gray-900 uppercase tracking-widest transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Address Info */}
            <div className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-100 space-y-6">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Residence Address</h4>

              <div className="p-5 bg-gray-50 rounded-[28px] border border-gray-100 flex items-start gap-4">
                <FiMapPin className="text-black w-5 h-5 mt-0.5" />
                <p className="text-[11px] font-bold text-gray-900 leading-relaxed tracking-tighter">
                  {formData.address?.fullAddress ||
                    (formData.address?.addressLine1 ? `${formData.address.addressLine1}, ${formData.address.city}` : 'GEOGRAPHICAL ADDRESS NOT SET')
                  }
                </p>
              </div>

              <button
                onClick={() => setIsAddressModalOpen(true)}
                className="w-full py-4 bg-gray-50 text-black rounded-2xl font-black text-[10px] uppercase tracking-widest border border-gray-100 hover:bg-white hover:border-black transition-all flex items-center justify-center gap-2"
              >
                Configure Map Location
              </button>
            </div>

            {/* Work Profile */}
            <div className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-100 space-y-6">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Professional Profile</h4>

              {/* Category Dropdown */}
              <div>
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Primary Skillsets</label>
                <div className="relative">
                  <button
                    onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                    className="w-full px-5 py-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between focus:border-black focus:bg-white outline-none"
                  >
                    <span className={`text-[11px] font-black uppercase tracking-widest truncate ${formData.serviceCategories.length > 0 ? 'text-gray-900' : 'text-gray-300'}`}>
                      {formData.serviceCategories.length > 0
                        ? `${formData.serviceCategories.length} Categories Selected`
                        : 'Select Skills'}
                    </span>
                    <FiChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isCategoryOpen && (
                    <>
                      <div className="fixed inset-0 z-10 bg-transparent" onClick={() => setIsCategoryOpen(false)} />
                      <div className="absolute z-20 w-full mt-3 bg-white rounded-3xl shadow-2xl border border-gray-100 max-h-72 overflow-y-auto p-2">
                        {categories.length > 0 ? (
                          categories.map(cat => (
                            <button
                              key={cat._id}
                              onClick={() => toggleCategory(cat.title)}
                              className="w-full text-left px-5 py-4 hover:bg-gray-50 rounded-2xl transition-all border-b border-gray-50 last:border-0 flex items-center justify-between group"
                            >
                              <span className="text-[10px] font-black text-gray-800 uppercase tracking-widest group-hover:translate-x-1 transition-transform">{cat.title}</span>
                              {formData.serviceCategories.includes(cat.title) && (
                                <div className="w-2 h-2 rounded-full bg-black" />
                              )}
                            </button>
                          ))
                        ) : (
                          <div className="px-5 py-4 text-gray-300 text-[10px] font-black uppercase tracking-widest">No skillsets found</div>
                        )}
                      </div>
                    </>
                  )}
                </div>

                {/* Selected Categories Tags */}
                {formData.serviceCategories.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {formData.serviceCategories.map((cat, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-3 py-1 bg-gray-50 text-gray-900 rounded-lg text-[9px] font-black uppercase tracking-widest border border-gray-100"
                      >
                        {cat}
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleCategory(cat); }}
                          className="ml-2 text-gray-400 hover:text-black"
                        >
                          <FiX className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Documents */}
            {!isEdit && (
              <div className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-100 space-y-6">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Verification Documents</h4>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Aadhar Number</label>
                  <input
                    type="text"
                    value={formData.aadhar.number}
                    onChange={(e) => handleInputChange('aadhar.number', e.target.value)}
                    placeholder="0000 0000 0000"
                    className="w-full px-5 py-4 bg-gray-50 rounded-2xl border border-gray-100 focus:border-black focus:bg-white outline-none text-xs font-black text-gray-900 tracking-[0.3em] transition-all"
                    maxLength={12}
                  />
                </div>

                <div className="border-2 border-dashed border-gray-100 rounded-[32px] p-10 text-center transition-all hover:border-black bg-gray-50 group cursor-pointer relative">
                  <input
                    id="worker-aadhar-upload"
                    type="file"
                    accept="image/*,.pdf"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleAadharChange}
                  />
                  <div className="flex flex-col items-center">
                    {aadharFile ? (
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-14 h-14 bg-black text-white rounded-2xl flex items-center justify-center shadow-lg">
                          <FiCheck className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest truncate max-w-[200px]">{aadharFile.name}</span>
                      </div>
                    ) : formData.aadhar.document && formData.aadhar.document !== 'data:image/png;base64,placeholder' ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-14 h-14 bg-gray-100 text-gray-400 rounded-2xl flex items-center justify-center">
                          <FiUpload className="w-6 h-6" />
                        </div>
                        <p className="text-[10px] font-black text-black uppercase tracking-widest">Document Staged</p>
                      </div>
                    ) : (
                      <>
                        <div className="w-14 h-14 bg-white border border-gray-100 text-gray-200 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm">
                          <FiUpload className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Upload Digital Copy</span>
                        <span className="text-[8px] font-bold text-gray-300 mt-2 uppercase tracking-tighter">Identity Proof (Front Side Only)</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-6 text-white rounded-[32px] font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-gray-200 active:scale-95 transition-all flex items-center justify-center gap-3 bg-black"
            >
              {loading ? 'Finalizing...' : (isEdit ? 'Save Updates' : 'Authorize Worker')}
            </button>
          </div >
        )}
      </main >

      <AddressSelectionModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        address={formData.address?.fullAddress || ''}
        houseNumber={formData.address?.addressLine1 || ''}
        onHouseNumberChange={(val) => handleInputChange('address.addressLine1', val)}
        onSave={handleAddressSave}
      />

      <BottomNav />
    </div >
  );
};

export default AddEditWorker;
