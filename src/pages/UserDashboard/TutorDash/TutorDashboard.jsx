import { useSearchParams } from 'react-router-dom'
import DashboardLayout from '../DashboardLayout'
import ProfileTab from '../components/ProfileTab'
import SettingsTab from '../components/SettingsTab'
import PlaceholderTabs from '../components/PlaceholderTabs'
import MyStudents from './components/MyStudents'
import Curriculum from './components/Curriculum'
import GroupCurriculum from './components/GroupCurriculum'
import TutorCertification from './components/TutorCertification'
import TutorSettlements from './components/TutorSettlements'

export default function TutorDashboard() {
  const [searchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'profile'

  const renderTabContent = ({ userData, setUserData, handleLogout }) => {
    switch (activeTab) {
      case 'profile':
        return <ProfileTab userData={userData} setUserData={setUserData} userType="tutor" />
      case 'settings':
        return <SettingsTab userData={userData} setUserData={setUserData} />
      case 'courses':
        return <PlaceholderTabs title="My Courses" description="View your assigned courses and student rosters" />
      case 'mystudents':
        return <MyStudents userData={userData} />
      case 'curriculum':
        return <Curriculum userData={userData} />
      case 'groupcurriculum':
        return <GroupCurriculum userData={userData} />
      case 'certification':
        return <TutorCertification userData={userData} />
      case 'settlements':
        return <TutorSettlements userData={userData} />
      default:
        return <ProfileTab userData={userData} setUserData={setUserData} userType="tutor" />
    }
  }

  return (
    <DashboardLayout userType="tutor">
      {renderTabContent}
    </DashboardLayout>
  )
}
