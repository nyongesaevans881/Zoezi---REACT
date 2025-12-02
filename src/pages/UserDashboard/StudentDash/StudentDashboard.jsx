import { useSearchParams } from 'react-router-dom'
import DashboardLayout from '../DashboardLayout'
import ProfileTab from '../components/ProfileTab'
import SettingsTab from '../components/SettingsTab'
import MyCourses from '../components/MyCourses'
import StudentCourseView from './components/StudentCourseView'
import StudentCertifications from './components/StudentCertifications'

export default function StudentDashboard() {
  const [searchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'profile'

  const renderTabContent = ({ userData, setUserData, handleLogout, refreshUserData }) => {
    // Handle dynamic course tabs
    if (activeTab.startsWith('course-')) {
      const courseId = activeTab.replace('course-', '')
      return <StudentCourseView userData={userData} courseId={courseId} />
    }

    switch (activeTab) {
      case 'profile':
        return <ProfileTab userData={userData} setUserData={setUserData} userType="student" refreshUserData={refreshUserData}/>
      case 'settings':
        return <SettingsTab userData={userData} setUserData={setUserData} refreshUserData={refreshUserData}/>
      case 'courses':
        return <MyCourses userData={userData} setUserData={setUserData} refreshUserData={refreshUserData}/>
      case 'certifications':
        return <StudentCertifications userData={userData} />
      default:
        return <ProfileTab userData={userData} setUserData={setUserData} userType="student" refreshUserData={refreshUserData}/>
    }
  }

  return (
    <DashboardLayout userType="student">
      {renderTabContent}
    </DashboardLayout>
  )
}
