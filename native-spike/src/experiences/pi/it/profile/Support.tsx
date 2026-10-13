import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  profileSupportTopics,
  profileSupportArticleBody,
  profileSupportArticleDetail,
} from '@/experiences/pi/it/mobile-first/profileServicesContent';
import {
  Button,
  Copy,
  Field,
  Page,
  Row,
  Tabs,
  Title,
  s,
  type ScreenNavigation,
} from './Primitives';
import { AssetGlyph } from '../../../../universal/AssetGlyph';
import { DataLink, QuickAction } from './DataElements';
import { serviceAssets as a } from './serviceAssets';
export const profileSlug = (value: string) =>
  value
    .toLocaleLowerCase('it')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
const tutorials = [
  {
    title: 'Novità',
    icon: a.novelty,
    body: 'Scopri la nuova homepage: saldo e movimenti dei conti, carte, investimenti e collegamenti rapidi alle operazioni.',
  },
  {
    title: 'Homepage',
    icon: a.home,
    body: 'Tocca un prodotto per aprire il dettaglio. Le azioni rapide consentono di effettuare bonifici, ricariche e pagamenti.',
  },
  {
    title: 'Investimenti',
    icon: a.investments,
    body: 'Consulta il patrimonio, gli strumenti e le operazioni recenti. Le informazioni di dettaglio includono andamento e documentazione.',
  },
  {
    title: 'Area personale',
    icon: a.profile,
    body: 'Dal tuo profilo puoi aggiornare i dati, trovare documenti, gestire le impostazioni e leggere comunicazioni e pratiche.',
  },
  {
    title: 'Mutui e prestiti',
    icon: a.mortgage,
    body: 'Consulta il dettaglio dei finanziamenti, le rate e le simulazioni disponibili nell’area Mutui e Prestiti.',
  },
  {
    title: 'Polizze assicurative',
    icon: a.insurance,
    body: 'Consulta le coperture, i dettagli e i contatti utili nell’area Protezione.',
  },
];
export default function Support({
  route,
  onBack,
  onClose,
  onNavigate,
}: ScreenNavigation) {
  const initialTopic = profileSupportTopics.find(
    item => item.title === route.id || profileSlug(item.title) === route.id,
  );
  const [view, setView] = useState(initialTopic ? 'articles' : 'home');
  const [category, setCategory] = useState(initialTopic?.category ?? 'Conti');
  const [topicTitle, setTopicTitle] = useState(
    initialTopic?.title ?? 'Gestione del conto',
  );
  const [article, setArticle] = useState('');
  const [query, setQuery] = useState('');
  const [phone, setPhone] = useState('');
  const [chatText, setChatText] = useState('');
  const [messages, setMessages] = useState<string[]>([]);
  const [tutorial, setTutorial] = useState(tutorials[0].title);
  const [guide, setGuide] = useState('');
  const [step, setStep] = useState(1);
  const topic = profileSupportTopics.find(item => item.title === topicTitle)!;
  const categories = [
    ...new Set(profileSupportTopics.map(item => item.category)),
  ];
  const footer = (
    <View style={supportStyles.double}>
      <View style={supportStyles.grow}>
        <Button onPress={() => setView('chat')}>Chatta con noi</Button>
      </View>
      <View style={supportStyles.grow}>
        <Button onPress={() => setView('phone')}>Chiama</Button>
      </View>
    </View>
  );
  if (view === 'phone')
    return (
      <Page
        title="Quale numero vuoi chiamare?"
        onBack={() => setView('home')}
        onClose={onClose}
      >
        <Row
          label="800 575 757"
          detail="Numero gratuito dall’Italia"
          onPress={() => setPhone('800 575 757')}
        />
        <Row
          label="+39 02 33408973"
          detail="Numero a pagamento dall’estero"
          onPress={() => setPhone('+39 02 33408973')}
        />
        {phone && (
          <View style={s.card}>
            <Copy strong>{phone}</Copy>
            <Copy>Numero da contattare</Copy>
            <Button secondary onPress={() => setPhone('')}>
              Termina
            </Button>
          </View>
        )}
      </Page>
    );
  if (view === 'chat')
    return (
      <Page
        title="Chatta con noi"
        onBack={() => setView('home')}
        onClose={onClose}
        footer={
          <>
            <Field
              label="Scrivi un messaggio"
              value={chatText}
              onChange={setChatText}
              multiline
              maxLength={2000}
            />
            <Button
              disabled={!chatText.trim()}
              onPress={() => {
                setMessages(current => [
                  ...current,
                  chatText,
                  'Consulta gli argomenti di supporto oppure fissa un appuntamento nella tua filiale per ricevere assistenza.',
                ]);
                setChatText('');
              }}
            >
              Invia
            </Button>
          </>
        }
      >
        <Copy>Benvenuto, come possiamo aiutarti?</Copy>
        {messages.map((message, index) => (
          <View style={s.card} key={index}>
            <Copy>{message}</Copy>
          </View>
        ))}
        <Button secondary onPress={() => onNavigate({ area: 'appointments' })}>
          Fissa un appuntamento
        </Button>
      </Page>
    );
  if (view === 'tutorial')
    return (
      <Page
        title={tutorial}
        onBack={() => setView('tutorials')}
        onClose={onClose}
        footer={
          <Button
            onPress={() =>
              step < 3 ? setStep(step + 1) : setView('tutorials')
            }
          >
            {step === 3 ? 'Fine tutorial' : 'Continua'}
          </Button>
        }
      >
        <Copy>
          {step === 1
            ? tutorials.find(item => item.title === tutorial)!.body
            : step === 2
            ? 'Le informazioni dei tuoi prodotti sono disponibili in dettaglio. Usa i pulsanti rapidi per le operazioni e la ricerca per trovare movimenti e documenti.'
            : 'Per richiedere assistenza seleziona Aiuto o torna a Supporto. Da qui puoi anche fissare un appuntamento in filiale.'}
        </Copy>
        <Tabs
          labels={['1', '2', '3']}
          value={String(step)}
          onChange={value => setStep(Number(value))}
          label="Passaggi tutorial"
        />
      </Page>
    );
  if (view === 'tutorials')
    return (
      <Page
        title="Tutorial"
        description="Scopri tutto quello che c’è da sapere sull’app"
        onBack={() => setView('home')}
        onClose={onClose}
      >
        {tutorials.map(item => (
          <Row
            key={item.title}
            label={item.title}
            onPress={() => {
              setTutorial(item.title);
              setStep(1);
              setView('tutorial');
            }}
          />
        ))}
      </Page>
    );
  if (view === 'article')
    return (
      <Page
        title={topic.title}
        onBack={() => setView('articles')}
        onClose={onClose}
        footer={footer}
      >
        <AssetGlyph asset={a.hero} width={343} height={150} fit="cover" />
        <Title>{article}</Title>
        <Copy>
          {category === 'Conti' ? profileSupportArticleBody : topic.description}
        </Copy>
        <Copy>
          {category === 'Conti'
            ? profileSupportArticleDetail
            : `Accedi alla sezione ${category} dalla homepage. Seleziona il prodotto o la funzionalità per consultarne i dettagli e gestire le opzioni disponibili. Puoi chiedere assistenza al servizio clienti o al tuo consulente per informazioni specifiche.`}
        </Copy>
        <Title>
          {category === 'Conti' ? 'Vai al Conto' : `Vai a ${category}`}
        </Title>
        <Row
          label={category === 'Conti' ? 'Gestione conto' : topic.title}
          onPress={() =>
            onNavigate({
              area:
                category === 'Conti'
                  ? 'accounts'
                  : category === 'Carte'
                  ? 'cards'
                  : category === 'Documenti'
                  ? 'documents'
                  : category === 'Sicurezza'
                  ? 'security'
                  : 'personal',
            })
          }
        />
        <Title>Potrebbe interessarti anche</Title>
        {topic.articles
          .filter(item => item !== article)
          .map(item => (
            <Row key={item} label={item} onPress={() => setArticle(item)} />
          ))}
        <Title>Contatti utili</Title>
        <Copy>
          Servizio clienti 800.078.777 (dall’estero +39 045.80.64.686)
        </Copy>
      </Page>
    );
  if (view === 'articles')
    return (
      <Page
        title="Altri dettagli"
        onBack={() => setView('topics')}
        onClose={onClose}
      >
        <Title>{topic.title}</Title>
        <Copy>{topic.description}</Copy>
        <Field label="Cerca articoli" value={query} onChange={setQuery} />
        {topic.articles
          .filter(item =>
            item
              .toLocaleLowerCase('it')
              .includes(query.toLocaleLowerCase('it')),
          )
          .map(item => (
            <Row
              key={item}
              label={item}
              onPress={() => {
                setArticle(item);
                setView('article');
              }}
            />
          ))}
        <Title>Altre categorie</Title>
        {categories.map(item => (
          <Row
            key={item}
            label={item}
            onPress={() => {
              setCategory(item);
              setQuery('');
              setView('topics');
            }}
          />
        ))}
      </Page>
    );
  if (view === 'topics')
    return (
      <Page
        title="Altri dettagli"
        onBack={() => setView('home')}
        onClose={onClose}
      >
        <Title>{query ? 'Cosa stai cercando?' : category}</Title>
        <Field label="Cerca argomenti" value={query} onChange={setQuery} />
        <Title>Tutti gli argomenti</Title>
        {profileSupportTopics
          .filter(item =>
            query
              ? `${item.title} ${item.description} ${item.articles.join(' ')}`
                  .toLocaleLowerCase('it')
                  .includes(query.toLocaleLowerCase('it'))
              : item.category === category,
          )
          .map(item => (
            <View key={item.title} style={s.card}>
              <Copy strong>{item.title}</Copy>
              <Copy>{item.description}</Copy>
              <Button
                secondary
                onPress={() => {
                  setTopicTitle(item.title);
                  setCategory(item.category);
                  setQuery('');
                  setView('articles');
                }}
              >
                Approfondisci
              </Button>
            </View>
          ))}
      </Page>
    );
  if (view === 'guide')
    return (
      <Page
        title={guide}
        onBack={() => setView('home')}
        onClose={onClose}
        footer={
          <Button onPress={() => setView('home')}>Torna al Supporto</Button>
        }
      >
        <View style={s.card}>
          <Copy strong>FACSIMILE</Copy>
          <Copy>{guide}</Copy>
          <Copy>Documento dimostrativo. Nessuna operazione reale.</Copy>
        </View>
      </Page>
    );
  const showTopic = (title: string) => {
    const selectedTopic = profileSupportTopics.find(
      item => item.title === title,
    )!;
    setCategory(selectedTopic.category);
    setTopicTitle(title);
    setQuery('');
    setView('articles');
  };
  return (
    <Page
      title={'Ciao Andrea,\ncome possiamo aiutarti?'}
      description="Versione app 01.02"
      onBack={onBack}
      onClose={onClose}
      footer={footer}
    >
      <Title>Azioni rapide</Title>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={supportStyles.quick}
      >
        <QuickAction
          label="Problemi Carta"
          variant="service"
          asset={a.problem}
          onPress={() => showTopic('Problemi con la carta')}
        />
        <QuickAction
          label={'I tuoi\ncodici'}
          variant="service"
          asset={a.pin}
          onPress={() => showTopic('Gestione sicurezza')}
        />
        <QuickAction
          label="Documenti"
          variant="service"
          asset={a.document}
          onPress={() => onNavigate({ area: 'documents' })}
        />
        <QuickAction
          label="Trova filiale o ATM"
          variant="service"
          asset={a.branch}
          onPress={() => onNavigate({ area: 'branches' })}
        />
      </ScrollView>
      <DataLink
        label="Fissa un appuntamento"
        onPress={() => onNavigate({ area: 'appointments' })}
      />
      <Title>Argomenti suggeriti</Title>
      <Tabs
        labels={categories}
        value={category}
        onChange={setCategory}
        label="Argomenti suggeriti"
      />
      {profileSupportTopics
        .filter(item => item.category === category)
        .slice(0, 3)
        .map(item => (
          <View key={item.title} style={s.card}>
            <Copy strong>{item.title}</Copy>
            <Copy>{item.description}</Copy>
            <DataLink
              label="Approfondisci ›"
              accessibilityLabel={`Approfondisci ${item.title}`}
              onPress={() => showTopic(item.title)}
            />
          </View>
        ))}
      <DataLink
        label="Vedi altro ›"
        onPress={() => {
          setView('topics');
          setQuery('');
        }}
      />
      <Title>Tutorial</Title>
      <Copy>Scopri tutto quello che c’è da sapere sull’app</Copy>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={supportStyles.quick}
      >
        {tutorials.map(item => (
          <QuickAction
            key={item.title}
            label={item.title}
            asset={item.icon}
            variant="tutorial"
            onPress={() => {
              setTutorial(item.title);
              setStep(1);
              setView('tutorial');
            }}
          />
        ))}
      </ScrollView>
      <DataLink
        label="Vedi tutti i tutorial ›"
        onPress={() => setView('tutorials')}
      />
      <Title>Guida</Title>
      {[
        'Guida al servizio di banca multicanale',
        'Prospetto delle funzionalità - DOL',
      ].map(title => (
        <Row
          key={title}
          label={title}
          icon={a.document}
          onPress={() => {
            setGuide(title);
            setView('guide');
          }}
        />
      ))}
    </Page>
  );
}
const supportStyles = StyleSheet.create({
  double: { flexDirection: 'row', gap: 8 },
  grow: { flex: 1 },
  quick: { flexDirection: 'row', gap: 16 },
});
