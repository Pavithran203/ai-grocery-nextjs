import React, { useRef, useEffect, useState } from 'react';
import { StyleSheet, Animated, PanResponder, Dimensions, View, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../services/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const DRAG_THRESHOLD = 8;

export default function ChatFAB() {
  const navigation = useNavigation();
  const [isOnChat, setIsOnChat] = useState(false);
  const pan = useRef(new Animated.ValueXY({ x: SCREEN_WIDTH - 76, y: SCREEN_HEIGHT - 170 })).current;
  const scale = useRef(new Animated.Value(0)).current;
  const bounce = useRef(new Animated.Value(0)).current;
  const isDragging = useRef(false);

  // Listen for route changes to hide on ChatScreen
  useEffect(() => {
    const unsubscribe = navigation.addListener('state', () => {
      const currentRoute = navigation.getCurrentRoute();
      setIsOnChat(currentRoute?.name === 'ChatScreen');
    });
    return unsubscribe;
  }, [navigation]);

  // Entry animation — pop in with bounce
  useEffect(() => {
    Animated.sequence([
      Animated.delay(500),
      Animated.spring(scale, {
        toValue: 1,
        friction: 4,
        tension: 60,
        useNativeDriver: false
      }),
    ]).start();
  }, []);

  // Gentle floating animation
  useEffect(() => {
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(bounce, { toValue: -4, duration: 1500, useNativeDriver: false }),
        Animated.timing(bounce, { toValue: 4, duration: 1500, useNativeDriver: false }),
      ])
    );
    floatLoop.start();
    return () => floatLoop.stop();
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gesture) => {
        return Math.abs(gesture.dx) > DRAG_THRESHOLD || Math.abs(gesture.dy) > DRAG_THRESHOLD;
      },
      onPanResponderGrant: () => {
        isDragging.current = false;
        pan.setOffset({
          x: pan.x._value,
          y: pan.y._value,
        });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: (e, gesture) => {
        if (Math.abs(gesture.dx) > DRAG_THRESHOLD || Math.abs(gesture.dy) > DRAG_THRESHOLD) {
          isDragging.current = true;
        }
        if (isDragging.current) {
          Animated.event([null, { dx: pan.x, dy: pan.y }], {
            useNativeDriver: false,
          })(e, gesture);
        }
      },
      onPanResponderRelease: (e, gesture) => {
        pan.flattenOffset();

        if (!isDragging.current) {
          navigation.navigate('ChatScreen');
          return;
        }

        const targetX = gesture.moveX > SCREEN_WIDTH / 2 ? SCREEN_WIDTH - 76 : 16;
        Animated.spring(pan, {
          toValue: { x: targetX, y: pan.y._value },
          useNativeDriver: false,
          friction: 5
        }).start();
      },
    })
  ).current;

  if (isOnChat) return null;

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        styles.container,
        {
          transform: [
            { translateX: pan.x },
            { translateY: Animated.add(pan.y, bounce) },
            { scale }
          ]
        }
      ]}
    >
      <View style={styles.fab}>
        {/* Chat bubble body */}
        <View style={styles.bubbleBody}>
          {/* Three animated dots */}
          <View style={styles.dotsRow}>
            <View style={[styles.dot, styles.dot1]} />
            <View style={[styles.dot, styles.dot2]} />
            <View style={[styles.dot, styles.dot3]} />
          </View>
        </View>
        {/* Chat bubble tail */}
        <View style={styles.bubbleTail} />
        
        {/* Online indicator */}
        <View style={styles.onlineDot} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 9999,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 10,
  },
  bubbleBody: {
    width: 28,
    height: 22,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -2,
  },
  bubbleTail: {
    position: 'absolute',
    bottom: 14,
    left: 12,
    width: 0,
    height: 0,
    borderTopWidth: 6,
    borderTopColor: '#FFFFFF',
    borderLeftWidth: 6,
    borderLeftColor: 'transparent',
    borderRightWidth: 0,
    borderRightColor: 'transparent',
    borderBottomWidth: 0,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  dot: {
    width: 4.5,
    height: 4.5,
    borderRadius: 2.25,
    backgroundColor: '#4F46E5',
  },
  dot1: { opacity: 0.5 },
  dot2: { opacity: 0.75 },
  dot3: { opacity: 1 },
  onlineDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#22C55E',
    borderWidth: 2.5,
    borderColor: '#4F46E5',
  },
});
