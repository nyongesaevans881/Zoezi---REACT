import { useSearchParams } from 'react-router-dom'
import DashboardLayout from '../DashboardLayout'
import ProfileTab from '../components/ProfileTab'
import SettingsTab from '../components/SettingsTab'
import SubscriptionTab from './components/SubscriptionTab'
import MyCourses from '../components/MyCourses'
import CPDHistoryTab from './components/CPDHistoryTab'
import PlaceholderTabs from '../PlaceholderTabs'

export default function AlumniDashboard() {
  const [searchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'profile'

  const renderTabContent = ({ userData, setUserData, handleLogout }) => {
    switch (activeTab) {
      case 'profile':
        return <ProfileTab userData={userData} setUserData={setUserData} userType="alumni" />
      case 'settings':
        return <SettingsTab userData={userData} setUserData={setUserData} />
      case 'subscription':
        return <SubscriptionTab userData={userData} setUserData={setUserData} />
      case 'cpd':
        return userData?.verified ? <CPDHistoryTab userData={userData} /> : <PlaceholderTabs title="CPD Records" description="CPD records available for verified alumni" />
      case 'preview':
        return <PlaceholderTabs title="Preview Profile" description="Preview your public alumni profile" />
      case 'courses':
        return <MyCourses userData={userData} setUserData={setUserData} />
      default:
        return <ProfileTab userData={userData} setUserData={setUserData} userType="alumni" />
    }
  }

  return (
    <DashboardLayout userType="alumni">
      {renderTabContent}
    </DashboardLayout>
  )
}
