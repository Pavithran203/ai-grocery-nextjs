import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Search } from 'lucide-react-native';
import { COLORS, SPACING } from '../services/theme';
import { useLanguage } from '../context/LanguageContext';

export default function SearchBar({ value, onChangeText, inputRef, onSubmitEditing }) {
  const { t } = useLanguage();

  return (
    <View style={styles.container}>
      <View style={styles.iconBox}>
        <Search size={20} color={COLORS.gray[400]} />
      </View>
      <TextInput
        ref={inputRef}
        autoFocus={true}
        style={styles.input}
        placeholder={t('Search products, stores, brands...')}
        placeholderTextColor={COLORS.gray[400]}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmitEditing}
        returnKeyType="search"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray[50],
    borderRadius: 16,
    paddingHorizontal: SPACING.md,
    height: 50,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.gray[100],
  },
  iconBox: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.foreground,
  }
});
