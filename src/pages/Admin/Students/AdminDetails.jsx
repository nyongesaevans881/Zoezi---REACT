import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { FaEdit, FaSave, FaTimes, FaPlus, FaTrash } from 'react-icons/fa';
import { CiSearch } from "react-icons/ci";
import AdminLayout from '../AdminLayout/AdminLayout';

const API_BASE_URL = import.meta.env.VITE_SERVER_URL;

const GRADE_OPTIONS = [
  { value: '', label: 'Select Grade' },
  { value: 'Distinction', label: 'Distinction' },
  { value: 'Merit', label: 'Merit' },
  { value: 'Credit', label: 'Credit' },
  { value: 'Pass', label: 'Pass' },
  { value: 'Fail', label: 'Fail' }
];

const SECTIONS = {
    personal: 'Personal Information',
    contact: 'Contact Information',
    academic: 'Academic Information',
    profile: 'Profile Picture',
    financial: 'Financial Information',
    exams: 'Exam Information',
    cpd: 'CPD Records'
};

export default function AdminDetails() {
    const [searchType, setSearchType] = useState('student'); // 'student' or 'alumni'
    const [searchQuery, setSearchQuery] = useState('');
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [editingSection, setEditingSection] = useState(null);
    const [editData, setEditData] = useState({});
    const [saving, setSaving] = useState(false);
    const [profileImageFile, setProfileImageFile] = useState(null);
    const [profileImagePreview, setProfileImagePreview] = useState(null);
    const [newExamName, setNewExamName] = useState('');
    const [newExamScore, setNewExamScore] = useState('');
    const [newCpdYear, setNewCpdYear] = useState(new Date().getFullYear());
    const [newCpdDate, setNewCpdDate] = useState('');
    const [newCpdResult, setNewCpdResult] = useState('pass');
    const [newCpdScore, setNewCpdScore] = useState('');
    const [newCpdRemarks, setNewCpdRemarks] = useState('');

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) {
            toast.error('Please enter a search query');
            return;
        }

        setLoading(true);
        try {
            const endpoint = searchType === 'student' ? '/students' : '/alumni/list';
            const query = new URLSearchParams({
                search: searchQuery,
                limit: 100,
                skip: 0
            });

            const response = await fetch(`${API_BASE_URL}${endpoint}?${query}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Search failed');
            }

            const results = searchType === 'student' ? data.data.students : data.data.alumni;

            if (results.length === 0) {
                toast.error('No results found');
                setProfile(null);
            } else if (results.length === 1) {
                setProfile(results[0]);
                toast.success('Profile loaded!');
            } else {
                // If multiple results, show first one and notify
                setProfile(results[0]);
                toast.success(`Found ${results.length} matches. Showing first result.`);
            }
        } catch (error) {
            console.error('Search error:', error);
            toast.error(error.message || 'Search failed');
        } finally {
            setLoading(false);
        }
    };

    const startEditing = (section) => {
        setEditingSection(section);
        // Initialize edit data based on section
        const sectionData = getSectionData(section);
        setEditData(sectionData);
        setProfileImagePreview(profile.profilePicture);
    };

    const getSectionData = (section) => {
        switch (section) {
            case 'personal':
                return {
                    firstName: profile.firstName,
                    lastName: profile.lastName,
                    dateOfBirth: profile.dateOfBirth,
                    gender: profile.gender
                };
            case 'contact':
                return {
                    email: profile.email,
                    phone: profile.phone
                };
            case 'academic':
                return {
                    qualification: profile.qualification,
                    course: profile.course,
                    trainingMode: profile.trainingMode,
                    courseDuration: profile.courseDuration
                };
            case 'financial':
                return {
                    courseFee: profile.courseFee,
                    upfrontFee: profile.upfrontFee
                };
            case 'exams':
                return {
                    exams: (profile.exams && Array.isArray(profile.exams)) ? profile.exams : []
                };
            case 'cpd':
                return {
                    cpdRecords: (profile.cpdRecords && Array.isArray(profile.cpdRecords)) ? profile.cpdRecords : []
                };
            default:
                return {};
        }
    };

    const handleInputChange = (field, value) => {
        setEditData((prev) => ({
            ...prev,
            [field]: value
        }));
    };

    const handleExamChange = (index, field, value) => {
        const updatedExams = [...editData.exams];
        updatedExams[index] = { ...updatedExams[index], [field]: value };
        setEditData((prev) => ({
            ...prev,
            exams: updatedExams
        }));
    };

    const handleAddExam = () => {
        if (!newExamName.trim()) {
            toast.error('Please enter exam name');
            return;
        }
        const updatedExams = [...editData.exams, { name: newExamName, score: newExamScore }];
        setEditData((prev) => ({
            ...prev,
            exams: updatedExams
        }));
        setNewExamName('');
        setNewExamScore('');
        toast.success('Exam added!');
    };

    const handleRemoveExam = (index) => {
        const updatedExams = editData.exams.filter((_, idx) => idx !== index);
        setEditData((prev) => ({
            ...prev,
            exams: updatedExams
        }));
        toast.success('Exam removed!');
    };

    const handleCpdChange = (index, field, value) => {
        const updatedCpd = [...editData.cpdRecords];
        updatedCpd[index] = { ...updatedCpd[index], [field]: value };
        setEditData((prev) => ({
            ...prev,
            cpdRecords: updatedCpd
        }));
    };

    const handleAddCpd = () => {
        if (!newCpdDate.trim()) {
            toast.error('Please select a date');
            return;
        }
        const updatedCpd = [...editData.cpdRecords, { 
            year: newCpdYear, 
            dateTaken: newCpdDate, 
            result: newCpdResult,
            score: newCpdScore ? Number(newCpdScore) : null,
            remarks: newCpdRemarks
        }];
        setEditData((prev) => ({
            ...prev,
            cpdRecords: updatedCpd
        }));
        setNewCpdYear(new Date().getFullYear());
        setNewCpdDate('');
        setNewCpdResult('pass');
        setNewCpdScore('');
        setNewCpdRemarks('');
        toast.success('CPD record added!');
    };

    const handleRemoveCpd = (index) => {
        const updatedCpd = editData.cpdRecords.filter((_, idx) => idx !== index);
        setEditData((prev) => ({
            ...prev,
            cpdRecords: updatedCpd
        }));
        toast.success('CPD record removed!');
    };

    const handleProfileImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const saveChanges = async () => {
        if (!profile || !profile._id) {
            toast.error('Profile not loaded');
            return;
        }

        setSaving(true);
        try {
            const endpoint = searchType === 'student' ? '/students' : '/alumni';
            const updateUrl = `${API_BASE_URL}${endpoint}/${profile._id}/update`;

            // Prepare update data
            let updateData = { ...editData };

            // Handle profile picture separately if it's being updated
            if (editingSection === 'profile' && profileImageFile) {
                const formData = new FormData();
                formData.append('file', profileImageFile);
                formData.append('section', 'profile');

                const imageResponse = await fetch(`${API_BASE_URL}${endpoint}/${profile._id}/update`, {
                    method: 'PUT',
                    body: formData
                });

                if (!imageResponse.ok) {
                    throw new Error('Failed to upload profile picture');
                }

                const imageData = await imageResponse.json();
                toast.success('Profile picture updated!');
                setProfile(imageData.data);
                setEditingSection(null);
                setProfileImageFile(null);
                return;
            }

            // Regular data update
            const response = await fetch(updateUrl, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    section: editingSection,
                    data: updateData
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Update failed');
            }

            setProfile(result.data);
            setEditingSection(null);
            toast.success('Changes saved successfully!');
        } catch (error) {
            console.error('Save error:', error);
            toast.error(error.message || 'Failed to save changes');
        } finally {
            setSaving(false);
        }
    };

    const cancelEdit = () => {
        setEditingSection(null);
        setEditData({});
        setProfileImageFile(null);
        setProfileImagePreview(null);
    };

    return (
        <AdminLayout>
            <div className="w-full">
                {/* Header */}
                <div className="mb-6">
                    <h2 className="text-2xl font-bold mb-2" style={{ color: '#2b2520' }}>
                        🔍 Search & Edit Details
                    </h2>
                    <p className="text-sm text-gray-600">Search for students or alumni and edit their information</p>
                </div>

                {/* Search Section */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <div className="flex gap-3 mb-4">
                        <label className="flex items-center gap-2">
                            <input
                                type="radio"
                                value="student"
                                checked={searchType === 'student'}
                                onChange={(e) => setSearchType(e.target.value)}
                                className="w-4 h-4"
                            />
                            <span className="font-semibold" style={{ color: '#2b2520' }}>Search Students</span>
                        </label>
                        <label className="flex items-center gap-2">
                            <input
                                type="radio"
                                value="alumni"
                                checked={searchType === 'alumni'}
                                onChange={(e) => setSearchType(e.target.value)}
                                className="w-4 h-4"
                            />
                            <span className="font-semibold" style={{ color: '#2b2520' }}>Search Alumni</span>
                        </label>
                    </div>

                    <form onSubmit={handleSearch} className="flex gap-3">
                        <input
                            type="text"
                            placeholder="Search by name, email, phone, or admission number..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1 px-4 py-2 border-2 rounded-lg focus:outline-none transition-colors"
                            style={{ borderColor: '#d4a644' }}
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 rounded-lg font-semibold text-white transition-colors flex items-center gap-2"
                            style={{ backgroundColor: loading ? '#ccc' : '#d4a644', cursor: loading ? 'not-allowed' : 'pointer' }}
                        >
                            <CiSearch /> {loading ? 'Searching...' : 'Search'}
                        </button>
                    </form>
                </div>

                {/* Profile Display */}
                {profile && (
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        {/* Profile Header */}
                        <div className="p-6 border-b-2" style={{ borderColor: '#d4a644', backgroundColor: '#f5f5f3' }}>
                            <div className="flex items-center gap-6">
                                <img
                                    src={profileImagePreview || profile.profilePicture || 'https://via.placeholder.com/100'}
                                    alt={`${profile.firstName} ${profile.lastName}`}
                                    className="w-24 h-24 rounded-lg object-cover border-2"
                                    style={{ borderColor: '#d4a644' }}
                                />
                                <div>
                                    <h3 className="text-2xl font-bold" style={{ color: '#2b2520' }}>
                                        {profile.firstName} {profile.lastName}
                                    </h3>
                                    <p className="text-gray-600">Admission #: {profile.admissionNumber}</p>
                                    <p className="text-gray-600">Email: {profile.email}</p>
                                </div>
                            </div>
                        </div>

                        {/* Sections Grid */}
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Profile Picture Section */}
                                <div className="p-4 rounded-lg border-2" style={{ borderColor: '#d4a644' }}>
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-semibold" style={{ color: '#2b2520' }}>📸 {SECTIONS.profile}</h4>
                                        {editingSection !== 'profile' && (
                                            <button
                                                onClick={() => startEditing('profile')}
                                                className="text-white px-3 py-1 rounded text-sm font-semibold flex items-center gap-1"
                                                style={{ backgroundColor: '#d4a644' }}
                                            >
                                                <FaEdit /> Edit
                                            </button>
                                        )}
                                    </div>

                                    {editingSection === 'profile' ? (
                                        <div className="space-y-3">
                                            <div className="flex justify-center">
                                                <img
                                                    src={profileImagePreview}
                                                    alt="Preview"
                                                    className="w-20 h-20 rounded-lg object-cover border-2"
                                                    style={{ borderColor: '#d4a644' }}
                                                />
                                            </div>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleProfileImageChange}
                                                className="block w-full text-sm"
                                            />
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={saveChanges}
                                                    disabled={saving}
                                                    className="flex-1 px-3 py-2 rounded font-semibold text-white flex items-center gap-1 justify-center"
                                                    style={{ backgroundColor: saving ? '#ccc' : '#2b8a3e' }}
                                                >
                                                    <FaSave /> Save
                                                </button>
                                                <button
                                                    onClick={cancelEdit}
                                                    className="flex-1 px-3 py-2 rounded font-semibold border-2"
                                                    style={{ borderColor: '#d32f2f', color: '#d32f2f' }}
                                                >
                                                    <FaTimes /> Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-gray-600 text-sm">Profile picture updated</p>
                                    )}
                                </div>

                                {/* Personal Information */}
                                <div className="p-4 rounded-lg border-2" style={{ borderColor: '#d4a644' }}>
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-semibold" style={{ color: '#2b2520' }}>👤 {SECTIONS.personal}</h4>
                                        {editingSection !== 'personal' && (
                                            <button
                                                onClick={() => startEditing('personal')}
                                                className="text-white px-3 py-1 rounded text-sm font-semibold flex items-center gap-1"
                                                style={{ backgroundColor: '#d4a644' }}
                                            >
                                                <FaEdit /> Edit
                                            </button>
                                        )}
                                    </div>

                                    {editingSection === 'personal' ? (
                                        <div className="space-y-3">
                                            <input
                                                type="text"
                                                placeholder="First Name"
                                                value={editData.firstName || ''}
                                                onChange={(e) => handleInputChange('firstName', e.target.value)}
                                                className="w-full px-3 py-2 border-2 rounded text-sm"
                                                style={{ borderColor: '#d4a644' }}
                                            />
                                            <input
                                                type="text"
                                                placeholder="Last Name"
                                                value={editData.lastName || ''}
                                                onChange={(e) => handleInputChange('lastName', e.target.value)}
                                                className="w-full px-3 py-2 border-2 rounded text-sm"
                                                style={{ borderColor: '#d4a644' }}
                                            />
                                            <input
                                                type="date"
                                                value={editData.dateOfBirth ? editData.dateOfBirth.split('T')[0] : ''}
                                                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                                                className="w-full px-3 py-2 border-2 rounded text-sm"
                                                style={{ borderColor: '#d4a644' }}
                                            />
                                            <select
                                                value={editData.gender || ''}
                                                onChange={(e) => handleInputChange('gender', e.target.value)}
                                                className="w-full px-3 py-2 border-2 rounded text-sm"
                                                style={{ borderColor: '#d4a644' }}
                                            >
                                                <option value="">Select Gender</option>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Other">Other</option>
                                            </select>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={saveChanges}
                                                    disabled={saving}
                                                    className="flex-1 px-3 py-2 rounded font-semibold text-white flex items-center gap-1 justify-center"
                                                    style={{ backgroundColor: saving ? '#ccc' : '#2b8a3e' }}
                                                >
                                                    <FaSave /> Save
                                                </button>
                                                <button
                                                    onClick={cancelEdit}
                                                    className="flex-1 px-3 py-2 rounded font-semibold border-2"
                                                    style={{ borderColor: '#d32f2f', color: '#d32f2f' }}
                                                >
                                                    <FaTimes /> Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-1 text-sm text-gray-600">
                                            <p><strong>First:</strong> {profile.firstName}</p>
                                            <p><strong>Last:</strong> {profile.lastName}</p>
                                            <p><strong>DOB:</strong> {profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : 'N/A'}</p>
                                            <p><strong>Gender:</strong> {profile.gender}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Contact Information */}
                                <div className="p-4 rounded-lg border-2" style={{ borderColor: '#d4a644' }}>
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-semibold" style={{ color: '#2b2520' }}>📞 {SECTIONS.contact}</h4>
                                        {editingSection !== 'contact' && (
                                            <button
                                                onClick={() => startEditing('contact')}
                                                className="text-white px-3 py-1 rounded text-sm font-semibold flex items-center gap-1"
                                                style={{ backgroundColor: '#d4a644' }}
                                            >
                                                <FaEdit /> Edit
                                            </button>
                                        )}
                                    </div>

                                    {editingSection === 'contact' ? (
                                        <div className="space-y-3">
                                            <input
                                                type="email"
                                                placeholder="Email"
                                                value={editData.email || ''}
                                                onChange={(e) => handleInputChange('email', e.target.value)}
                                                className="w-full px-3 py-2 border-2 rounded text-sm"
                                                style={{ borderColor: '#d4a644' }}
                                            />
                                            <input
                                                type="tel"
                                                placeholder="Phone"
                                                value={editData.phone || ''}
                                                onChange={(e) => handleInputChange('phone', e.target.value)}
                                                className="w-full px-3 py-2 border-2 rounded text-sm"
                                                style={{ borderColor: '#d4a644' }}
                                            />
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={saveChanges}
                                                    disabled={saving}
                                                    className="flex-1 px-3 py-2 rounded font-semibold text-white flex items-center gap-1 justify-center"
                                                    style={{ backgroundColor: saving ? '#ccc' : '#2b8a3e' }}
                                                >
                                                    <FaSave /> Save
                                                </button>
                                                <button
                                                    onClick={cancelEdit}
                                                    className="flex-1 px-3 py-2 rounded font-semibold border-2"
                                                    style={{ borderColor: '#d32f2f', color: '#d32f2f' }}
                                                >
                                                    <FaTimes /> Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-1 text-sm text-gray-600">
                                            <p><strong>Email:</strong> {profile.email}</p>
                                            <p><strong>Phone:</strong> {profile.phone}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Academic Information */}
                                <div className="p-4 rounded-lg border-2" style={{ borderColor: '#d4a644' }}>
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-semibold" style={{ color: '#2b2520' }}>🎓 {SECTIONS.academic}</h4>
                                        {editingSection !== 'academic' && (
                                            <button
                                                onClick={() => startEditing('academic')}
                                                className="text-white px-3 py-1 rounded text-sm font-semibold flex items-center gap-1"
                                                style={{ backgroundColor: '#d4a644' }}
                                            >
                                                <FaEdit /> Edit
                                            </button>
                                        )}
                                    </div>

                                    {editingSection === 'academic' ? (
                                        <div className="space-y-3">
                                            <input
                                                type="text"
                                                placeholder="Qualification"
                                                value={editData.qualification || ''}
                                                onChange={(e) => handleInputChange('qualification', e.target.value)}
                                                className="w-full px-3 py-2 border-2 rounded text-sm"
                                                style={{ borderColor: '#d4a644' }}
                                            />
                                            <input
                                                type="text"
                                                placeholder="Course"
                                                value={editData.course || ''}
                                                onChange={(e) => handleInputChange('course', e.target.value)}
                                                className="w-full px-3 py-2 border-2 rounded text-sm"
                                                style={{ borderColor: '#d4a644' }}
                                            />
                                            <input
                                                type="text"
                                                placeholder="Training Mode"
                                                value={editData.trainingMode || ''}
                                                onChange={(e) => handleInputChange('trainingMode', e.target.value)}
                                                className="w-full px-3 py-2 border-2 rounded text-sm"
                                                style={{ borderColor: '#d4a644' }}
                                            />
                                            <input
                                                type="text"
                                                placeholder="Course Duration"
                                                value={editData.courseDuration || ''}
                                                onChange={(e) => handleInputChange('courseDuration', e.target.value)}
                                                className="w-full px-3 py-2 border-2 rounded text-sm"
                                                style={{ borderColor: '#d4a644' }}
                                            />
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={saveChanges}
                                                    disabled={saving}
                                                    className="flex-1 px-3 py-2 rounded font-semibold text-white flex items-center gap-1 justify-center"
                                                    style={{ backgroundColor: saving ? '#ccc' : '#2b8a3e' }}
                                                >
                                                    <FaSave /> Save
                                                </button>
                                                <button
                                                    onClick={cancelEdit}
                                                    className="flex-1 px-3 py-2 rounded font-semibold border-2"
                                                    style={{ borderColor: '#d32f2f', color: '#d32f2f' }}
                                                >
                                                    <FaTimes /> Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-1 text-sm text-gray-600">
                                            <p><strong>Qualification:</strong> {profile.qualification}</p>
                                            <p><strong>Course:</strong> {profile.course}</p>
                                            <p><strong>Training Mode:</strong> {profile.trainingMode}</p>
                                            <p><strong>Duration:</strong> {profile.courseDuration}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Financial Information */}
                                <div className="p-4 rounded-lg border-2" style={{ borderColor: '#d4a644' }}>
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-semibold" style={{ color: '#2b2520' }}>💰 {SECTIONS.financial}</h4>
                                        {editingSection !== 'financial' && (
                                            <button
                                                onClick={() => startEditing('financial')}
                                                className="text-white px-3 py-1 rounded text-sm font-semibold flex items-center gap-1"
                                                style={{ backgroundColor: '#d4a644' }}
                                            >
                                                <FaEdit /> Edit
                                            </button>
                                        )}
                                    </div>

                                    {editingSection === 'financial' ? (
                                        <div className="space-y-3">
                                            <input
                                                type="number"
                                                placeholder="Course Fee"
                                                value={editData.courseFee || ''}
                                                onChange={(e) => handleInputChange('courseFee', e.target.value)}
                                                className="w-full px-3 py-2 border-2 rounded text-sm"
                                                style={{ borderColor: '#d4a644' }}
                                            />
                                            <input
                                                type="number"
                                                placeholder="Upfront Fee"
                                                value={editData.upfrontFee || ''}
                                                onChange={(e) => handleInputChange('upfrontFee', e.target.value)}
                                                className="w-full px-3 py-2 border-2 rounded text-sm"
                                                style={{ borderColor: '#d4a644' }}
                                            />
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={saveChanges}
                                                    disabled={saving}
                                                    className="flex-1 px-3 py-2 rounded font-semibold text-white flex items-center gap-1 justify-center"
                                                    style={{ backgroundColor: saving ? '#ccc' : '#2b8a3e' }}
                                                >
                                                    <FaSave /> Save
                                                </button>
                                                <button
                                                    onClick={cancelEdit}
                                                    className="flex-1 px-3 py-2 rounded font-semibold border-2"
                                                    style={{ borderColor: '#d32f2f', color: '#d32f2f' }}
                                                >
                                                    <FaTimes /> Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-1 text-sm text-gray-600">
                                            <p><strong>Course Fee:</strong> KES {(profile.courseFee || 0).toLocaleString()}</p>
                                            <p><strong>Upfront Fee:</strong> KES {(profile.upfrontFee || 0).toLocaleString()}</p>
                                            <p><strong>Balance:</strong> KES {(Math.max(0, (profile.courseFee || 0) - (profile.upfrontFee || 0))).toLocaleString()}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Exam Information */}
                                <div className="p-4 rounded-lg border-2 md:col-span-2" style={{ borderColor: '#d4a644' }}>
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-semibold" style={{ color: '#2b2520' }}>📊 {SECTIONS.exams}</h4>
                                        {editingSection !== 'exams' && (
                                            <button
                                                onClick={() => {
                                                    startEditing('exams');
                                                    setNewExamName('');
                                                    setNewExamScore('');
                                                }}
                                                className="text-white px-3 py-1 rounded text-sm font-semibold flex items-center gap-1"
                                                style={{ backgroundColor: '#d4a644' }}
                                            >
                                                <FaEdit /> Edit
                                            </button>
                                        )}
                                    </div>

                                    {editingSection === 'exams' ? (
                                        <div className="space-y-3">
                                            {/* Existing Exams */}
                                            {editData.exams && editData.exams.length > 0 && (
                                                <div>
                                                    <p className="text-sm font-semibold mb-2" style={{ color: '#2b2520' }}>Existing Exams</p>
                                                    {editData.exams.map((exam, idx) => (
                                                        <div key={idx} className="p-3 bg-gray-50 rounded border-l-4 flex gap-2 items-end mb-2" style={{ borderColor: '#d4a644' }}>
                                                            <div className="flex-1 space-y-2">
                                                                <input
                                                                    type="text"
                                                                    placeholder="Exam Name"
                                                                    value={exam.name || ''}
                                                                    onChange={(e) => handleExamChange(idx, 'name', e.target.value)}
                                                                    className="w-full px-3 py-2 border-2 rounded text-sm"
                                                                    style={{ borderColor: '#d4a644' }}
                                                                />
                                                                <select
                                                                    value={exam.score || ''}
                                                                    onChange={(e) => handleExamChange(idx, 'score', e.target.value)}
                                                                    className="w-full px-3 py-2 border-2 rounded text-sm font-semibold"
                                                                    style={{ borderColor: '#d4a644' }}
                                                                >
                                                                    {GRADE_OPTIONS.map((grade) => (
                                                                        <option key={grade.value} value={grade.value}>
                                                                            {grade.label}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                            <button
                                                                onClick={() => handleRemoveExam(idx)}
                                                                className="px-3 py-2 rounded bg-red-500 text-white font-semibold"
                                                                title="Delete exam"
                                                            >
                                                                <FaTrash />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Add New Exam */}
                                            <div className="p-3 bg-blue-50 rounded border-2" style={{ borderColor: '#d4a644' }}>
                                                <p className="text-sm font-semibold mb-2" style={{ color: '#2b2520' }}>Add New Exam</p>
                                                <div className="space-y-2">
                                                    <input
                                                        type="text"
                                                        placeholder="Exam Name"
                                                        value={newExamName}
                                                        onChange={(e) => setNewExamName(e.target.value)}
                                                        className="w-full px-3 py-2 border-2 rounded text-sm"
                                                        style={{ borderColor: '#d4a644' }}
                                                    />
                                                    <select
                                                        value={newExamScore}
                                                        onChange={(e) => setNewExamScore(e.target.value)}
                                                        className="w-full px-3 py-2 border-2 rounded text-sm font-semibold"
                                                        style={{ borderColor: '#d4a644' }}
                                                    >
                                                        {GRADE_OPTIONS.map((grade) => (
                                                            <option key={grade.value} value={grade.value}>
                                                                {grade.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <button
                                                        onClick={handleAddExam}
                                                        className="w-full px-3 py-2 rounded font-semibold text-white flex items-center gap-2 justify-center"
                                                        style={{ backgroundColor: '#2b8a3e' }}
                                                    >
                                                        <FaPlus /> Add Exam
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="flex gap-2">
                                                <button
                                                    onClick={saveChanges}
                                                    disabled={saving}
                                                    className="flex-1 px-3 py-2 rounded font-semibold text-white flex items-center gap-1 justify-center"
                                                    style={{ backgroundColor: saving ? '#ccc' : '#2b8a3e' }}
                                                >
                                                    <FaSave /> Save
                                                </button>
                                                <button
                                                    onClick={cancelEdit}
                                                    className="flex-1 px-3 py-2 rounded font-semibold border-2"
                                                    style={{ borderColor: '#d32f2f', color: '#d32f2f' }}
                                                >
                                                    <FaTimes /> Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {profile.exams && profile.exams.length > 0 ? (
                                                profile.exams.map((exam, idx) => (
                                                    <div key={idx} className="p-2 bg-gray-50 rounded text-sm">
                                                        <p><strong>{exam.name}</strong></p>
                                                        <p className="text-gray-600">Grade: {exam.score || 'Pending'}</p>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-gray-600 text-sm">No exams added yet. Click Edit to add exams.</p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* CPD Records */}
                                <div className="p-4 rounded-lg border-2 md:col-span-2" style={{ borderColor: '#d4a644' }}>
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-semibold" style={{ color: '#2b2520' }}>📋 {SECTIONS.cpd}</h4>
                                        {editingSection !== 'cpd' && (
                                            <button
                                                onClick={() => {
                                                    startEditing('cpd');
                                                    setNewCpdYear(new Date().getFullYear());
                                                    setNewCpdDate('');
                                                    setNewCpdResult('pass');
                                                    setNewCpdScore('');
                                                    setNewCpdRemarks('');
                                                }}
                                                className="text-white px-3 py-1 rounded text-sm font-semibold flex items-center gap-1"
                                                style={{ backgroundColor: '#d4a644' }}
                                            >
                                                <FaEdit /> Edit
                                            </button>
                                        )}
                                    </div>

                                    {editingSection === 'cpd' ? (
                                        <div className="space-y-3">
                                            {/* Existing CPD Records */}
                                            {editData.cpdRecords && editData.cpdRecords.length > 0 && (
                                                <div>
                                                    <p className="text-sm font-semibold mb-2" style={{ color: '#2b2520' }}>Existing CPD Records</p>
                                                    {editData.cpdRecords.map((cpd, idx) => (
                                                        <div key={idx} className="p-3 bg-gray-50 rounded border-l-4 space-y-2 mb-2" style={{ borderColor: '#d4a644' }}>
                                                            <div className="flex gap-2 items-center justify-between">
                                                                <div className="flex-1 grid grid-cols-2 gap-2">
                                                                    <div>
                                                                        <label className="text-xs font-semibold text-gray-600">Year</label>
                                                                        <input
                                                                            type="number"
                                                                            min="2000"
                                                                            max={new Date().getFullYear() + 1}
                                                                            value={cpd.year || new Date().getFullYear()}
                                                                            onChange={(e) => handleCpdChange(idx, 'year', Number(e.target.value))}
                                                                            className="w-full px-2 py-1 border-2 rounded text-sm"
                                                                            style={{ borderColor: '#d4a644' }}
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <label className="text-xs font-semibold text-gray-600">Date Taken</label>
                                                                        <input
                                                                            type="date"
                                                                            value={cpd.dateTaken ? cpd.dateTaken.split('T')[0] : ''}
                                                                            onChange={(e) => handleCpdChange(idx, 'dateTaken', e.target.value)}
                                                                            className="w-full px-2 py-1 border-2 rounded text-sm"
                                                                            style={{ borderColor: '#d4a644' }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <button
                                                                    onClick={() => handleRemoveCpd(idx)}
                                                                    className="px-3 py-2 rounded bg-red-500 text-white font-semibold h-fit"
                                                                    title="Delete CPD record"
                                                                >
                                                                    <FaTrash />
                                                                </button>
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-2">
                                                                <div>
                                                                    <label className="text-xs font-semibold text-gray-600">Result</label>
                                                                    <select
                                                                        value={cpd.result || 'pass'}
                                                                        onChange={(e) => handleCpdChange(idx, 'result', e.target.value)}
                                                                        className="w-full px-2 py-1 border-2 rounded text-sm font-semibold"
                                                                        style={{ borderColor: '#d4a644' }}
                                                                    >
                                                                        <option value="pass">✅ Pass</option>
                                                                        <option value="fail">❌ Fail</option>
                                                                    </select>
                                                                </div>
                                                                <div>
                                                                    <label className="text-xs font-semibold text-gray-600">CPD Points</label>
                                                                    <input
                                                                        type="number"
                                                                        placeholder="e.g., 3.5"
                                                                        min="0"
                                                                        max="100"
                                                                        value={cpd.score || ''}
                                                                        onChange={(e) => handleCpdChange(idx, 'score', e.target.value ? Number(e.target.value) : null)}
                                                                        className="w-full px-2 py-1 border-2 rounded text-sm"
                                                                        style={{ borderColor: '#d4a644' }}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <label className="text-xs font-semibold text-gray-600">Remarks (Optional)</label>
                                                                <textarea
                                                                    placeholder="Add any remarks..."
                                                                    value={cpd.remarks || ''}
                                                                    onChange={(e) => handleCpdChange(idx, 'remarks', e.target.value)}
                                                                    className="w-full px-2 py-1 border-2 rounded text-sm"
                                                                    style={{ borderColor: '#d4a644' }}
                                                                    rows="2"
                                                                />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Add New CPD Record */}
                                            <div className="p-3 bg-blue-50 rounded border-2" style={{ borderColor: '#d4a644' }}>
                                                <p className="text-sm font-semibold mb-2" style={{ color: '#2b2520' }}>Add New CPD Record</p>
                                                <div className="grid grid-cols-2 gap-2 mb-2">
                                                    <div>
                                                        <label className="text-xs font-semibold text-gray-600">Year</label>
                                                        <input
                                                            type="number"
                                                            min="2000"
                                                            max={new Date().getFullYear() + 1}
                                                            value={newCpdYear}
                                                            onChange={(e) => setNewCpdYear(Number(e.target.value))}
                                                            className="w-full px-2 py-1 border-2 rounded text-sm"
                                                            style={{ borderColor: '#d4a644' }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-semibold text-gray-600">Date Taken</label>
                                                        <input
                                                            type="date"
                                                            value={newCpdDate}
                                                            onChange={(e) => setNewCpdDate(e.target.value)}
                                                            className="w-full px-2 py-1 border-2 rounded text-sm"
                                                            style={{ borderColor: '#d4a644' }}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 mb-2">
                                                    <div>
                                                        <label className="text-xs font-semibold text-gray-600">Result</label>
                                                        <select
                                                            value={newCpdResult}
                                                            onChange={(e) => setNewCpdResult(e.target.value)}
                                                            className="w-full px-2 py-1 border-2 rounded text-sm font-semibold"
                                                            style={{ borderColor: '#d4a644' }}
                                                        >
                                                            <option value="pass">✅ Pass</option>
                                                            <option value="fail">❌ Fail</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-semibold text-gray-600">CPD Points</label>
                                                        <input
                                                            type="number"
                                                             placeholder="e.g., 3.5"
                                                            min="0"
                                                            max="100"
                                                            value={newCpdScore}
                                                            onChange={(e) => setNewCpdScore(e.target.value)}
                                                            className="w-full px-2 py-1 border-2 rounded text-sm"
                                                            style={{ borderColor: '#d4a644' }}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="mb-2">
                                                    <label className="text-xs font-semibold text-gray-600">Remarks (Optional)</label>
                                                    <textarea
                                                        placeholder="Add any remarks..."
                                                        value={newCpdRemarks}
                                                        onChange={(e) => setNewCpdRemarks(e.target.value)}
                                                        className="w-full px-2 py-1 border-2 rounded text-sm"
                                                        style={{ borderColor: '#d4a644' }}
                                                        rows="2"
                                                    />
                                                </div>
                                                <button
                                                    onClick={handleAddCpd}
                                                    className="w-full px-3 py-2 rounded font-semibold text-white flex items-center gap-2 justify-center"
                                                    style={{ backgroundColor: '#2b8a3e' }}
                                                >
                                                    <FaPlus /> Add CPD Record
                                                </button>
                                            </div>

                                            <div className="flex gap-2">
                                                <button
                                                    onClick={saveChanges}
                                                    disabled={saving}
                                                    className="flex-1 px-3 py-2 rounded font-semibold text-white flex items-center gap-1 justify-center"
                                                    style={{ backgroundColor: saving ? '#ccc' : '#2b8a3e' }}
                                                >
                                                    <FaSave /> Save
                                                </button>
                                                <button
                                                    onClick={cancelEdit}
                                                    className="flex-1 px-3 py-2 rounded font-semibold border-2"
                                                    style={{ borderColor: '#d32f2f', color: '#d32f2f' }}
                                                >
                                                    <FaTimes /> Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {profile.cpdRecords && profile.cpdRecords.length > 0 ? (
                                                [...profile.cpdRecords].reverse().map((cpd, idx) => (
                                                    <div key={idx} className="p-3 bg-gray-50 rounded border-l-4" style={{ borderColor: '#d4a644' }}>
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div>
                                                                <p className="font-semibold" style={{ color: '#2b2520' }}>
                                                                    {cpd.year} - {cpd.dateTaken ? new Date(cpd.dateTaken).toLocaleDateString() : 'N/A'}
                                                                </p>
                                                            </div>
                                                            <span className={`px-2 py-1 rounded text-xs font-bold ${cpd.result === 'pass' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                                {cpd.result === 'pass' ? '✅ PASS' : '❌ FAIL'}
                                                            </span>
                                                        </div>
                                                        {cpd.score && <p className="text-sm text-gray-600">CPD Points: {cpd.score}</p>}
                                                        {cpd.remarks && <p className="text-sm text-gray-600 italic">Remarks: {cpd.remarks}</p>}
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-gray-600 text-sm">No CPD records added yet. Click Edit to add records.</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* No Profile State */}
                {!profile && !loading && (
                    <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                        <p className="text-gray-600 text-lg">Search for a student or alumni to view and edit their profile</p>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
