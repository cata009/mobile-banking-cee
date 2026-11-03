import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { StyleSheet, View } from 'react-native';

/** Web preview encodes the displayed mCash reference as a real QR code. */
export function McashQrCode({ value }: { value: string }) {
  return (
    <View
      testID="mcash-qr-code"
      accessibilityRole="image"
      accessibilityLabel="mCash QR code"
      style={styles.root}
    >
      <QRCodeSVG
        value={value}
        size={220}
        level="M"
        marginSize={2}
        title="mCash QR code"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { width: 220, height: 220, backgroundColor: '#FFFFFF' },
});
