import React, { useEffect, useState } from 'react';
import {
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Text, TextInput } from '../../../../universal/Typography';
import { AssetGlyph } from '../../../../universal/AssetGlyph';
import { mobileFirstTokens as tokens } from '../../../../universal/tokens';
import { INSURANCE_FAQ } from '@/experiences/pi/it/mobile-first/insuranceContent';
import { insuranceAssets as a } from '@/experiences/pi/it/mobile-first/insuranceAssets';
import { CreditHeader, s } from '../loans/LoanPrimitives';
import { InsuranceLink as Link } from './InsurancePrimitives';

function ContactButton({
  label,
  asset,
  onPress,
  secondary = false,
  disabled = false,
}: {
  label: string;
  asset?: string | number;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[
        h.button,
        secondary ? h.secondary : h.primary,
        disabled && h.disabled,
      ]}
    >
      {asset && <AssetGlyph asset={asset} size={24} />}
      <Text
        style={[
          h.buttonLabel,
          secondary ? h.secondaryLabel : h.primaryLabel,
          disabled && h.disabledLabel,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}
export default function InsuranceHelp({
  variant = 'faq',
  subject,
  isActive,
  onClose,
}: {
  variant?: 'faq' | 'contact';
  subject?: string;
  isActive?: boolean;
  onClose: () => void;
}) {
  const [question, setQuestion] = useState<number | null>(null);
  const [channel, setChannel] = useState<'chat' | 'phone' | null>(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<string[]>([]);
  const back = () => {
    if (channel) setChannel(null);
    else onClose();
  };
  useEffect(() => {
    if (Platform.OS === 'web' || isActive === false) return;
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        back();
        return true;
      },
    );
    return () => subscription.remove();
  });
  const title =
    channel === 'chat'
      ? 'Chatta con noi'
      : channel === 'phone'
      ? 'Chiama'
      : variant === 'contact'
      ? 'Hai bisogno di assistenza sui canali digitali?'
      : 'Polizze assicurative';
  return (
    <KeyboardAvoidingView
      style={s.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <CreditHeader onClose={back} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={s.content}
      >
        <Text style={s.title}>{title}</Text>
        {channel && subject && <Text style={s.subtitle}>{subject}</Text>}
        {channel === 'phone' ? (
          <Text style={[s.body, s.mt24]}>
            Trovi il contatto telefonico della compagnia nei documenti della tua
            polizza. Puoi consultare il contratto o rivolgerti alla tua filiale.
          </Text>
        ) : channel === 'chat' ? (
          <>
            <Text style={[s.body, s.mt24]}>
              Come possiamo aiutarti con la tua polizza?
            </Text>
            {messages.map((text, index) => (
              <View key={index} style={h.message}>
                <Text style={s.body}>{text}</Text>
              </View>
            ))}
            <Text style={h.inputLabel}>Messaggio</Text>
            <TextInput
              accessibilityLabel="Messaggio"
              style={h.input}
              value={message}
              onChangeText={setMessage}
              maxLength={500}
              placeholder="Scrivi un messaggio..."
            />
          </>
        ) : variant === 'contact' ? (
          <>
            <Text style={[s.body, s.mt24]}>
              Scegli il canale che preferisci per parlare con noi.
            </Text>
            {subject && (
              <Text style={[s.body, s.mt24, s.muted]}>{subject}</Text>
            )}
            <View style={h.contactActions}>
              <ContactButton
                label="Chatta con noi"
                asset={a.chatWhite}
                onPress={() => setChannel('chat')}
              />
              <ContactButton
                label="Chiama"
                asset={a.phone}
                onPress={() => setChannel('phone')}
              />
            </View>
          </>
        ) : (
          <>
            <Text style={[s.body, s.mt24]}>
              In queste pagine trovi le informazioni relative alle tue polizze
              assicurative di protezione distribuite da UniCredit.
            </Text>
            <Text style={[s.body, s.mt24]}>Inoltre, qui troverai anche:</Text>
            {[
              'Il dettaglio delle protezioni e dei moduli assicurati.',
              'I documenti e lo storico della tua polizza.',
              'I contatti per ricevere assistenza.',
            ].map(item => (
              <Text key={item} style={s.body}>
                • {item}
              </Text>
            ))}
            <Text style={[s.body, s.mt24]}>
              Inizialmente, alcuni prodotti potrebbero non essere presenti nella
              sezione, stiamo lavorando per inserirli e darti così piena
              visibilità delle tue polizze.
            </Text>
            <Text style={[s.sectionTitle, s.mt24]}>Consulta le FAQ</Text>
            {INSURANCE_FAQ.map((item, index) => (
              <View style={h.faq} key={item.question}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={item.question}
                  accessibilityState={{ expanded: question === index }}
                  onPress={() => setQuestion(question === index ? null : index)}
                  style={h.faqQuestion}
                >
                  <Text style={[s.cardHeading, h.flex]}>{item.question}</Text>
                  <AssetGlyph asset={a.forth} size={16} />
                </Pressable>
                {question === index && (
                  <Text style={[s.body, h.answer]}>{item.answer}</Text>
                )}
              </View>
            ))}
            <Link
              label="Vedi tutte le FAQ"
              text="VEDI TUTTE LE FAQ"
              onPress={() => setQuestion(question === null ? 0 : null)}
            />
          </>
        )}
      </ScrollView>
      {channel === 'chat' ? (
        <View style={s.footer}>
          <ContactButton
            label="Invia"
            disabled={!message.trim()}
            onPress={() => {
              if (!message.trim()) return;
              setMessages([...messages, message.trim()]);
              setMessage('');
            }}
          />
        </View>
      ) : !channel && variant === 'faq' ? (
        <View style={[s.footer, h.footer]}>
          <View style={h.flex}>
            <ContactButton
              label="Avvia Chat"
              asset={a.chat}
              onPress={() => setChannel('chat')}
            />
          </View>
          <View style={h.flex}>
            <ContactButton
              label="Parla con noi"
              asset={a.agency}
              secondary
              onPress={() => setChannel('phone')}
            />
          </View>
        </View>
      ) : null}
    </KeyboardAvoidingView>
  );
}
const h = StyleSheet.create({
  flex: { flex: 1 },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    minHeight: 56,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: 120,
  },
  primary: { backgroundColor: '#007a91' },
  secondary: { backgroundColor: '#fff', borderColor: '#262626' },
  buttonLabel: {
    fontFamily: tokens.strongFont,
    fontSize: 18,
    lineHeight: 24,
    textAlign: 'center',
  },
  primaryLabel: { color: '#fff' },
  secondaryLabel: { color: '#262626' },
  disabled: { backgroundColor: '#e5e5e5' },
  disabledLabel: { color: '#909090' },
  contactActions: { gap: 24, marginTop: 40 },
  message: {
    marginVertical: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
  },
  inputLabel: {
    fontFamily: tokens.font,
    color: tokens.text,
    fontSize: 18,
    lineHeight: 24,
    marginTop: 24,
    marginBottom: 4,
  },
  input: {
    minHeight: 56,
    borderWidth: 1,
    borderColor: '#909090',
    borderRadius: 16,
    padding: 16,
    fontFamily: tokens.font,
    fontSize: 18,
    lineHeight: 24,
    color: tokens.text,
  },
  faq: { marginVertical: 16, borderBottomWidth: 1, borderBottomColor: '#ccc' },
  faqQuestion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    paddingVertical: 16,
  },
  answer: { paddingBottom: 16 },
  footer: { flexDirection: 'row', gap: 16 },
});
