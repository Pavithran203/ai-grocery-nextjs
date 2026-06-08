import 'react-native-gesture-handler';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './navigation/AppNavigator';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';

import { LocationProvider } from './context/LocationContext';
import { LanguageProvider } from './context/LanguageContext';
import { AddressProvider } from './context/AddressContext';
import { PreferencesProvider } from './context/PreferencesContext';
import { OrdersProvider } from './context/OrdersContext';
import { LoyaltyProvider } from './context/LoyaltyContext';
import { TrackingProvider } from './context/TrackingContext';
import { FavoriteProvider } from './context/FavoriteContext';
import { RootSiblingParent } from 'react-native-root-siblings';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <RootSiblingParent>
            <LanguageProvider>
              <PreferencesProvider>
                <AddressProvider>
                  <LocationProvider>
                    <OrdersProvider>
                      <LoyaltyProvider>
                        <CartProvider>
                          <WishlistProvider>
                            <FavoriteProvider>
                              <TrackingProvider>
                                <NavigationContainer>
                                  <AppNavigator />
                                  <StatusBar style="auto" />
                                </NavigationContainer>
                              </TrackingProvider>
                            </FavoriteProvider>
                          </WishlistProvider>
                        </CartProvider>
                      </LoyaltyProvider>
                    </OrdersProvider>
                  </LocationProvider>
                </AddressProvider>
              </PreferencesProvider>
            </LanguageProvider>
          </RootSiblingParent>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
