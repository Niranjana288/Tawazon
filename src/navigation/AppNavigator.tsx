import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import SplashScreen from '../screens/SplashScreen'
import DisclaimerScreen from '../screens/DisclaimerScreen'
import LoginScreen from '../screens/LoginScreen'
import RegisterScreen from '../screens/RegisterScreen'
import RoleSelectionScreen from '../screens/RoleSelectionScreen'
import RiskAssessmentScreen from '../screens/RiskAssessmentScreen'
import StudentHomeScreen from '../screens/StudentHomeScreen'
import ParentHomeScreen from '../screens/ParentHomeScreen'
import CheckInScreen from '../screens/CheckInScreen'
import MicroInterventionScreen from '../screens/MicroInterventionScreen'
import JournalScreen from '../screens/JournalScreen'
import CopingToolkitScreen from '../screens/CopingToolkitScreen'
import CBTScreen from '../screens/CBTScreen'
import RecoveryCompassScreen from '../screens/RecoveryCompassScreen'
import ProfileScreen from '../screens/ProfileScreen'
import ParentDashboardScreen from '../screens/ParentDashboardScreen'
import LinkParentScreen from '../screens/LinkParentScreen'
import BalanceBoostersScreen from '../screens/BalanceBoostersScreen'
import MoodTriggerScreen from '../screens/MoodTriggerScreen'
import TawazonGuideScreen from '../screens/TawazongGuideScreen'

const Stack = createStackNavigator()

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Disclaimer" component={DisclaimerScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
        <Stack.Screen name="RiskAssessment" component={RiskAssessmentScreen} />
        <Stack.Screen name="MoodTrigger" component={MoodTriggerScreen} />
        <Stack.Screen name="StudentHome" component={StudentHomeScreen} />
        <Stack.Screen name="ParentHome" component={ParentHomeScreen} />
        <Stack.Screen name="CheckIn" component={CheckInScreen} />
        <Stack.Screen name="MicroIntervention" component={MicroInterventionScreen} />
        <Stack.Screen name="Journal" component={JournalScreen} />
        <Stack.Screen name="Coping" component={CopingToolkitScreen} />
        <Stack.Screen name="CBT" component={CBTScreen} />
        <Stack.Screen name="Compass" component={RecoveryCompassScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="ParentDashboard" component={ParentDashboardScreen} />
        <Stack.Screen name="LinkParent" component={LinkParentScreen} />
        <Stack.Screen name="BalanceBoosters" component={BalanceBoostersScreen} />
        <Stack.Screen name="TawazonGuide" component={TawazonGuideScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}