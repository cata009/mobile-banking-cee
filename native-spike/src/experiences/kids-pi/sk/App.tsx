import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  getKidsHomeConcept,
  getPocketProgress,
} from '@/data/kidsMarketHomeConcepts';
import {
  SK_LESSONS,
  SK_MORE_ITEMS,
  SK_TASKS,
} from '@/app/screens/kids/sk/data';
import { formatMoney } from '@/app/registry/countryConfig';
import {
  Card,
  Copy,
  Frame,
  Icon,
  IconButton,
  Nav,
  Progress,
  Row,
  Section,
} from '../controls';
import type { NativeKidsProps } from '../NativeKidsApp';
export default function SlovakKids(props: NativeKidsProps) {
  const concept = getKidsHomeConcept('SK');
  const [tab, setTab] = useState('home'),
    [visible, setVisible] = useState(true);
  const money = (amount: number) =>
    formatMoney(amount, 'SK', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  const education = (
    <Section title="Education">
      <Card>
        <Copy strong>In progress Explore</Copy>
        <Copy size={32} strong>
          4/12
        </Copy>
        <Copy>Financial education</Copy>
        <Progress value={34} color="#f0871d" />
        <Copy>
          Keep up with the good work Maria. You have learned 4 of 12 money
          lessons.
        </Copy>
      </Card>
    </Section>
  );
  const tasks = (all: boolean) => (
    <Section title="Tasks">
      {all ? <Copy>To do Completed</Copy> : null}
      {SK_TASKS.slice(0, all ? 3 : 2).map(task => (
        <Card key={task.title}>
          <Row
            title={task.title}
            subtitle={task.status}
            icon={task.icon}
            value={money(task.reward)}
          />
        </Card>
      ))}
    </Section>
  );
  return (
    <Frame
      title={
        tab === 'home'
          ? 'Products'
          : concept.nav.find(item => item.id === tab)?.label ?? 'Products'
      }
      top={props.screenTopInset}
      onBack={props.onExit}
      showBack={false}
      actions={
        <View style={visualStyles.actions}>
          <IconButton
            label={visible ? 'Hide balance' : 'Show balance'}
            name={visible ? 'eye' : 'eye-off'}
            onPress={() => setVisible(!visible)}
          />
          <IconButton label="Messages" name="header-messages" />
        </View>
      }
      footer={
        <Nav
          items={concept.nav}
          value={tab}
          onChange={setTab}
          bottom={props.bottomInset}
        />
      }
    >
      {tab === 'home' ? (
        <>
          <Section title="Accounts">
            <Card>
              <Copy strong>{concept.allowanceLabel}</Copy>
              <Copy>SK31UNCR7000123456789</Copy>
              <Copy size={25} strong style={visualStyles.money}>
                {visible ? money(concept.balance) : '****'}
              </Copy>
            </Card>
          </Section>
          <Section title="Shortcuts">
            <View style={visualStyles.shortcuts}>
              {concept.actions.map(action => (
                <View key={action.label} style={visualStyles.shortcut}>
                  <Icon name={action.icon} color="#f0871d" size={28} />
                  <Copy strong size={12}>
                    {action.label}
                  </Copy>
                </View>
              ))}
            </View>
          </Section>
          <Section title="Cards">
            <Card>
              <Row
                title={concept.cardStatus}
                subtitle="**** **** **** 4007"
                icon="credit-card"
                value={money(1000)}
              />
            </Card>
          </Section>
          <Card>
            <Copy size={24} strong>
              Get a savings
            </Copy>
            <Copy>{concept.pockets[0].helper}</Copy>
            <Progress
              value={getPocketProgress(concept.pockets[0])}
              color="#f0871d"
            />
          </Card>
          {education}
          {tasks(false)}
        </>
      ) : tab === 'education' ? (
        <>
          {education}
          <Section title="Next lesson">
            {SK_LESSONS.map(lesson => (
              <Card key={lesson.title}>
                <Row title={lesson.title} icon={lesson.icon} />
              </Card>
            ))}
          </Section>
        </>
      ) : tab === 'tasks' ? (
        tasks(true)
      ) : (
        <Section title="More">
          {SK_MORE_ITEMS.map(item => (
            <Card key={item.title}>
              <Row title={item.title} icon={item.icon} />
            </Card>
          ))}
        </Section>
      )}
    </Frame>
  );
}
const visualStyles = StyleSheet.create({
  actions: { flexDirection: 'row', gap: 8 },
  money: { textAlign: 'right' },
  shortcuts: { flexDirection: 'row', gap: 24, justifyContent: 'center' },
  shortcut: { alignItems: 'center', gap: 8 },
});
