// Navigation Navigator for Smart Local Grocery Marketplace
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Home, ShoppingCart, ClipboardList, User, Store } from 'lucide-react-native';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

import HomeScreen from '../screens/HomeScreen';
import ProductListScreen from '../screens/ProductListScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import CartScreen from '../screens/CartScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import ProfileScreen from '../screens/ProfileScreen';
import OrdersScreen from '../screens/OrdersScreen';
import AddressScreen from '../screens/AddressScreen';
import WishlistScreen from '../screens/WishlistScreen';
import StoresScreen from '../screens/StoresScreen';
import StoreDetailScreen from '../screens/StoreDetailScreen';
import PaymentMethodsScreen from '../screens/PaymentMethodsScreen';
import SecurityScreen from '../screens/SecurityScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ChatScreen from '../screens/ChatScreen';
import CampaignScreen from '../screens/CampaignScreen';
import StoreOfferMarketplaceScreen from '../screens/StoreOfferMarketplaceScreen';
import GroceryOfferDetailsScreen from '../screens/GroceryOfferDetailsScreen';
import CategoryMarketplaceScreen from '../screens/CategoryMarketplaceScreen';
import TrackingScreen from '../screens/TrackingScreen';
import NearbyStoresMapScreen from '../screens/NearbyStoresMapScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import ChatFAB from '../components/ChatFAB';
import { COLORS } from '../services/theme';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const HomeStack = createStackNavigator();
function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="Home" component={HomeScreen} />
      <HomeStack.Screen name="StoreDetail" component={StoreDetailScreen} />
      <HomeStack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <HomeStack.Screen name="CategoryMarketplace" component={CategoryMarketplaceScreen} />
      <HomeStack.Screen name="StoreOfferMarketplace" component={StoreOfferMarketplaceScreen} />
    </HomeStack.Navigator>
  );
}

const StoresStack = createStackNavigator();
function StoresStackNavigator() {
  return (
    <StoresStack.Navigator screenOptions={{ headerShown: false }}>
      <StoresStack.Screen name="Stores" component={StoresScreen} />
      <StoresStack.Screen name="StoreDetail" component={StoreDetailScreen} />
      <StoresStack.Screen name="ProductDetail" component={ProductDetailScreen} />
    </StoresStack.Navigator>
  );
}

function TabNavigator() {
  const { getCartCount } = useCart();
  const { t } = useLanguage();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: true,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray[400],
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarIcon: ({ color, size, focused }) => {
          let icon;
          if (route.name === 'HomeTab') {
            icon = <Home size={size} color={color} />;
          } else if (route.name === 'StoresTab') {
            icon = <Store size={size} color={color} />;
          } else if (route.name === 'OrdersTab') {
            icon = <ClipboardList size={size} color={color} />;
          } else if (route.name === 'CartTab') {
            const count = getCartCount();
            icon = (
              <View>
                <ShoppingCart size={size} color={color} />
                {count > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{count > 99 ? '99+' : count}</Text>
                  </View>
                )}
              </View>
            );
          } else if (route.name === 'ProfileTab') {
             icon = <User size={size} color={color} />;
          }
          
          return (
            <View style={[styles.iconContainer, focused && styles.focusedIcon]}>
              {icon}
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeStackNavigator} options={{ title: t('Home') }} />
      <Tab.Screen name="StoresTab" component={StoresStackNavigator} options={{ title: t('Stores') }} />
      <Tab.Screen name="OrdersTab" component={OrdersScreen} options={{ title: t('Orders') }} />
      <Tab.Screen name="CartTab" component={CartScreen} options={{ title: t('Cart') }} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ title: t('Profile') }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <>
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={TabNavigator} />
      <Stack.Screen name="ProductList" component={ProductListScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="AddressScreen" component={AddressScreen} />
      <Stack.Screen name="WishlistScreen" component={WishlistScreen} />
      <Stack.Screen name="PaymentMethodsScreen" component={PaymentMethodsScreen} />
      <Stack.Screen name="SecurityScreen" component={SecurityScreen} />
      <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
      <Stack.Screen name="ChatScreen" component={ChatScreen} />
      <Stack.Screen name="CampaignScreen" component={CampaignScreen} />
      <Stack.Screen name="GroceryOfferDetails" component={GroceryOfferDetailsScreen} />
      <Stack.Screen name="TrackingScreen" component={TrackingScreen} />
      <Stack.Screen name="NearbyStoresMap" component={NearbyStoresMapScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
    <ChatFAB />
    </>
  );
}


const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 25,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 25,
    height: 70,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    borderTopWidth: 0,
    paddingBottom: 10,
    paddingTop: 10,
  },
  tabBarLabel: {
    fontSize: 10,
    fontWeight: '700',
  },
  iconContainer: {
    padding: 8,
    borderRadius: 12,
  },
  focusedIcon: {
    backgroundColor: 'rgba(45, 106, 79, 0.1)',
  },
  badge: {
    position: 'absolute',
    right: -6,
    top: -6,
    backgroundColor: COLORS.rose[500],
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  badgeText: {
    color: 'white',
    fontSize: 9,
    fontWeight: 'bold',
  }
});
