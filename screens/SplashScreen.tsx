import React, { useEffect, useRef } from 'react';
import {
  View,
  Animated,
  Text,
  StyleSheet,
  Dimensions,
  ImageBackground,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function SplashScreen({ navigation }: any) {
  const scale = useRef(new Animated.Value(0.3)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
  Animated.parallel([
    Animated.spring(scale, {
      toValue: 1,
      friction: 8,
      tension: 100,
      useNativeDriver: true,
    }),
    Animated.timing(opacity, {
      toValue: 1,
      duration: 1200,
      useNativeDriver: true,
    }),
  ]).start();

  // 2.5 second delay
  const timer = setTimeout(() => navigation.replace('Home'), 2500);
  return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <ImageBackground
      source={require('../assets/splash.png')}
      style={styles.background}
      resizeMode="cover"
      imageStyle={styles.imageStyle}
    >
      
      <View style={styles.overlay} />

      <View style={styles.content}>
        
        <Animated.View
          style={[
            styles.textContainer,
            { transform: [{ scale }], opacity },
          ]}
        >
          <Text style={styles.title}>Heal Me Bot</Text>
          <Text style={styles.subtitle}>Your personal health assistant</Text>
        </Animated.View>

        
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © Designed By Thilan. All rights reserved.
          </Text>
          <View style={styles.socialIcons}>
            <TouchableOpacity
              onPress={() => Linking.openURL('https://discord.com/invite/vfwb7pQW')}
            >
              <Ionicons name="logo-discord" size={22} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                Linking.openURL('https://www.linkedin.com/in/thilan-kalhara-06a9b723a')
              }
            >
              <Ionicons name="logo-linkedin" size={22} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => Linking.openURL('https://github.com/Thilankalhara')}
            >
              <Ionicons name="logo-github" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  imageStyle: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.05)', 
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 100, 
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 40,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
    letterSpacing: 1.2,
  },
  subtitle: {
    fontSize: 19,
    color: '#f8f8f8',
    marginTop: 10,
    fontWeight: '600',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },

  footer: {
    alignItems: 'center',
    paddingVertical: 16,
    width: '100%',
  },
  footerText: {
    fontSize: 12,
    color: '#fff',
    marginBottom: 10,
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  socialIcons: {
    flexDirection: 'row',
    gap: 26,
  },
});