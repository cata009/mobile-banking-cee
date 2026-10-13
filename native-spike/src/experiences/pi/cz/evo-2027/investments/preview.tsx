import React from 'react';
import { createRoot } from 'react-dom/client';
import { StyleSheet, View } from 'react-native';
import { OverlayHost } from '../../../../../universal/ModalPortal';
import { DEFAULT_CZECH_COUNTS } from '../contracts';
import { CzInvestmentsScreen } from './InvestmentsScreen';
import { createCzInvestmentSnapshot } from './model';

const params = new URLSearchParams(window.location.search);
const view = params.get('view');
const styles = StyleSheet.create({
  reserve: { height: 54, backgroundColor: '#FFFFFF' },
  gray: { backgroundColor: '#F5F5F5' },
});
createRoot(document.getElementById('root')!).render(
  <OverlayHost>
    <View style={[styles.reserve, view === 'goals' && styles.gray]} />
    <CzInvestmentsScreen
      snapshot={createCzInvestmentSnapshot(DEFAULT_CZECH_COUNTS)}
      initialView={
        view === 'goals' ? 'goals' : view === 'create' ? 'create' : 'portfolio'
      }
      onBack={() => undefined}
    />
  </OverlayHost>,
);
