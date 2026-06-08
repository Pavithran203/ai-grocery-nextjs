import React, { useRef, useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, Platform } from 'react-native';
import { COLORS } from '../services/theme';

export default function OTPInput({ length = 6, value, onChangeText }) {
  const inputRefs = useRef([]);
  const [otpValues, setOtpValues] = useState(new Array(length).fill(''));

  useEffect(() => {
    if (value === '') {
      setOtpValues(new Array(length).fill(''));
    }
  }, [value]);

  const handleChange = (text, index) => {
    const newValues = [...otpValues];
    newValues[index] = text;
    setOtpValues(newValues);
    
    const combinedValue = newValues.join('');
    onChangeText(combinedValue);

    if (text !== '' && index < length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && otpValues[index] === '' && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  return (
    <View style={styles.container}>
      {otpValues.map((val, i) => (
        <TextInput
          key={i}
          ref={(ref) => (inputRefs.current[i] = ref)}
          style={[styles.input, val !== '' && styles.inputFilled]}
          value={val}
          onChangeText={(text) => handleChange(text, i)}
          onKeyPress={(e) => handleKeyPress(e, i)}
          keyboardType="number-pad"
          maxLength={1}
          selectTextOnFocus
          textAlign="center"
          placeholder="0"
          placeholderTextColor={COLORS.gray[200]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
    marginVertical: 20,
  },
  input: {
    width: 50,
    height: 60,
    backgroundColor: COLORS.gray[50],
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.gray[100],
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.foreground,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  inputFilled: {
    borderColor: COLORS.primary,
    backgroundColor: '#fff',
  },
  inputFocused: {
    borderColor: COLORS.primary,
    backgroundColor: '#fff',
  }
});
