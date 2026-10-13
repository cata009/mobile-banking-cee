import { useState } from 'react'
import { ProfileButton, ProfileField, ProfilePage, ProfileRow, ProfileTabs } from './MobileFirstProfilePrimitives'
import { ServiceDocumentPreview, ServiceQuickAction, ServiceTextAction } from './MobileFirstProfileServicesElements'
import { profileSupportArticleBody, profileSupportArticleDetail, profileSupportTopics } from './profileServicesContent'
import { profileServicesAssets as a } from './profileServicesAssets'
import type { ProfileServicesNavigate } from './MobileFirstProfileServices'

type SupportView = 'home' | 'topics' | 'articles' | 'article' | 'tutorials' | 'tutorial' | 'guide' | 'phone' | 'chat'
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
]
export default function MobileFirstProfileServicesSupport({
  onBack,
  onClose,
  onNavigate,
}: {
  onBack: () => void
  onClose: () => void
  onNavigate: ProfileServicesNavigate
}) {
  const [view, setView] = useState<SupportView>('home')
  const [category, setCategory] = useState('Conti')
  const [topicTitle, setTopicTitle] = useState('Gestione del conto')
  const [article, setArticle] = useState('Info sulla gestione in self del mio conto corrente')
  const [query, setQuery] = useState('')
  const [expanded, setExpanded] = useState(false)
  const [tutorialIndex, setTutorialIndex] = useState(0)
  const [tutorialStep, setTutorialStep] = useState(0)
  const [guide, setGuide] = useState('')
  const [phone, setPhone] = useState('')
  const [chatText, setChatText] = useState('')
  const [messages, setMessages] = useState<string[]>([])
  const [notice, setNotice] = useState('')
  const topic = profileSupportTopics.find((item) => item.title === topicTitle) ?? profileSupportTopics[0]!
  const topics = profileSupportTopics.filter((item) =>
    query
      ? `${item.title} ${item.description} ${item.articles.join(' ')}`
          .toLocaleLowerCase('it')
          .includes(query.toLocaleLowerCase('it'))
      : item.category === category,
  )
  const categories = [...new Set(profileSupportTopics.map((item) => item.category))]
  const showTopic = (title: string) => {
    const selectedTopic = profileSupportTopics.find((item) => item.title === title)
    if (selectedTopic) setCategory(selectedTopic.category)
    setTopicTitle(title)
    setView('articles')
    setQuery('')
    setExpanded(false)
  }
  const openArticle = (title: string) => {
    setArticle(title)
    setView('article')
  }
  const footer = (
    <div className="mf-services-double">
      <ProfileButton onClick={() => setView('chat')}>
        <span className="mf-services-icon-label">
          <img src={a.chat} alt="" />
          Chatta con noi
        </span>
      </ProfileButton>
      <ProfileButton
        onClick={() => {
          setPhone('')
          setView('phone')
        }}
      >
        <span className="mf-services-icon-label">
          <img src={a.phoneWhite} alt="" />
          Chiama
        </span>
      </ProfileButton>
    </div>
  )
  if (view === 'phone')
    return (
      <ProfilePage
        className="mf-services"
        title="Quale numero vuoi chiamare?"
        onBack={() => setView('home')}
        onClose={onClose}
      >
        <ProfileRow label="800 575 757" detail="Numero gratuito dall’Italia" onClick={() => setPhone('800 575 757')} />
        <ProfileRow
          label="+39 02 33408973"
          detail="Numero a pagamento dall’estero"
          onClick={() => setPhone('+39 02 33408973')}
        />
        {phone && (
          <div className="mf-services-contact-result" role="status">
            <strong>{phone}</strong>
            <p>Numero da contattare</p>
            <ProfileButton secondary onClick={() => setPhone('')}>
              Termina
            </ProfileButton>
          </div>
        )}
      </ProfilePage>
    )
  if (view === 'chat')
    return (
      <ProfilePage
        className="mf-services"
        title="Chatta con noi"
        onBack={() => setView('home')}
        onClose={onClose}
        footer={
          <>
            <ProfileField
              label="Scrivi un messaggio"
              maxLength={2000}
              value={chatText}
              onChange={(event) => setChatText(event.target.value)}
            />
            <ProfileButton
              disabled={!chatText.trim()}
              onClick={() => {
                const answer = /cart/i.test(chatText)
                  ? profileSupportTopics.find((topic) => topic.title === 'Problemi con la carta')!.description
                  : /cont|saldo|iban/i.test(chatText)
                    ? profileSupportArticleBody
                    : /appuntamento|filiale/i.test(chatText)
                      ? 'Seleziona Fissa un appuntamento per scegliere la filiale, la categoria, il giorno e l’orario.'
                      : 'Puoi trovare informazioni negli argomenti di Supporto o fissare un appuntamento con la tua filiale.'
                setMessages((current) => [...current, chatText, answer])
                setChatText('')
              }}
            >
              Invia
            </ProfileButton>
          </>
        }
      >
        <p className="mf-services-chat-bubble">Ciao Andrea, come possiamo aiutarti?</p>
        {messages.map((message, index) => (
          <p className={`mf-services-chat-bubble${index % 2 === 0 ? ' is-user' : ''}`} key={index}>
            {message}
          </p>
        ))}
        <ServiceTextAction onClick={() => onNavigate('appointments')}>Fissa un appuntamento</ServiceTextAction>
      </ProfilePage>
    )
  if (view === 'guide')
    return (
      <ServiceDocumentPreview
        title={guide}
        category="Guida"
        onBack={() => setView('home')}
        onClose={onClose}
        footer={<ProfileButton onClick={() => setView('home')}>Torna al Supporto</ProfileButton>}
      />
    )
  if (view === 'tutorial') {
    const selected = tutorials[tutorialIndex]!
    return (
      <ProfilePage
        className="mf-services"
        title={selected.title}
        onBack={() => setView('tutorials')}
        onClose={onClose}
        footer={
          <ProfileButton
            onClick={() => (tutorialStep === 2 ? setView('tutorials') : setTutorialStep((step) => step + 1))}
          >
            {tutorialStep === 2 ? 'Fine tutorial' : 'Continua'}
          </ProfileButton>
        }
      >
        <div className="mf-services-tutorial-hero">
          <img src={selected.icon} alt="" />
        </div>
        <p>
          {tutorialStep === 0
            ? selected.body
            : tutorialStep === 1
              ? 'Le informazioni dei tuoi prodotti sono disponibili in dettaglio. Usa i pulsanti rapidi per le operazioni e la ricerca per trovare movimenti e documenti.'
              : 'Per richiedere assistenza seleziona Aiuto o torna a Supporto. Da qui puoi anche fissare un appuntamento in filiale.'}
        </p>
        <ProfileTabs
          labels={['1', '2', '3']}
          value={String(tutorialStep + 1)}
          onChange={(value) => setTutorialStep(Number(value) - 1)}
          label="Passaggi tutorial"
        />
      </ProfilePage>
    )
  }
  if (view === 'tutorials')
    return (
      <ProfilePage
        className="mf-services"
        title="Tutorial"
        onBack={() => setView('home')}
        onClose={onClose}
        description="Scopri tutto quello che c’è da sapere sull’app"
      >
        {tutorials.map((item, index) => (
          <ProfileRow
            key={item.title}
            label={item.title}
            onClick={() => {
              setTutorialIndex(index)
              setTutorialStep(0)
              setView('tutorial')
            }}
          />
        ))}
      </ProfilePage>
    )
  if (view === 'article')
    return (
      <ProfilePage
        className="mf-services mf-services-article"
        title={topic.title}
        onBack={() => setView('articles')}
        onClose={onClose}
        footer={footer}
      >
        <div className="mf-services-article-hero">
          <img src={a.hero} alt="" />
          <strong>{category}</strong>
        </div>
        <h2>{article}</h2>
        <p>{category === 'Conti' ? profileSupportArticleBody : topic.description}</p>
        <p>
          {category === 'Conti'
            ? profileSupportArticleDetail
            : `Accedi alla sezione ${category} dalla homepage. Seleziona il prodotto o la funzionalità per consultarne i dettagli e gestire le opzioni disponibili. Puoi chiedere assistenza al servizio clienti o al tuo consulente per informazioni specifiche.`}
        </p>
        <h2>{category === 'Conti' ? 'Vai al Conto' : `Vai a ${category}`}</h2>
        <ProfileRow
          label={category === 'Conti' ? 'Gestione conto' : topic.title}
          onClick={() => {
            onNavigate(
              category === 'Conti'
                ? 'account'
                : category === 'Carte'
                  ? 'cards'
                  : category === 'Documenti'
                    ? 'documents'
                    : category === 'Sicurezza'
                      ? 'security'
                      : 'personal',
            )
            setNotice('Sezione richiesta dal collegamento contestuale.')
          }}
        />
        <h2>Potrebbe interessarti anche</h2>
        {topic.articles
          .filter((title) => title !== article)
          .map((title) => (
            <div className="mf-services-topic-card" key={title}>
              <strong>{title}</strong>
              <ServiceTextAction onClick={() => openArticle(title)}>Leggi articolo ›</ServiceTextAction>
            </div>
          ))}
        <h2>Contatti utili</h2>
        <p>Servizio clienti 800.078.777 (dall’estero +39 045.80.64.686)</p>
        {notice && <p role="status">{notice}</p>}
      </ProfilePage>
    )
  if (view === 'articles')
    return (
      <ProfilePage className="mf-services" title="Altri dettagli" onBack={() => setView('topics')} onClose={onClose}>
        <h2>{topic.title}</h2>
        <p>{topic.description}</p>
        <ProfileField
          label="Cerca articoli"
          placeholder="Cerca..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        {topic.articles
          .filter((title) => title.toLocaleLowerCase('it').includes(query.toLocaleLowerCase('it')))
          .map((title) => (
            <div className="mf-services-topic-card" key={title}>
              <strong>{title}</strong>
              <ServiceTextAction onClick={() => openArticle(title)}>Leggi articolo ›</ServiceTextAction>
            </div>
          ))}
        {!topic.articles.some((title) => title.toLocaleLowerCase('it').includes(query.toLocaleLowerCase('it'))) && (
          <p>Nessun risultato trovato</p>
        )}
        <h3>Altre categorie</h3>
        {categories.map((value) => (
          <ProfileRow
            key={value}
            label={value}
            onClick={() => {
              setCategory(value)
              setQuery('')
              setView('topics')
            }}
          />
        ))}
      </ProfilePage>
    )
  if (view === 'topics')
    return (
      <ProfilePage className="mf-services" title="Altri dettagli" onBack={() => setView('home')} onClose={onClose}>
        <h2>{query ? 'Cosa stai cercando?' : category}</h2>
        <ProfileField
          label="Cerca argomenti"
          placeholder="Cerca..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <h3>Tutti gli argomenti</h3>
        {topics.slice(0, expanded ? undefined : 3).map((item) => (
          <div className="mf-services-topic-card" key={item.title}>
            <strong>{item.title}</strong>
            <p>{item.description}</p>
            <ServiceTextAction onClick={() => showTopic(item.title)}>Approfondisci ›</ServiceTextAction>
          </div>
        ))}
        {topics.length > 3 && (
          <ServiceTextAction onClick={() => setExpanded((current) => !current)}>
            {expanded ? 'Mostra meno' : 'Mostra altri'}
          </ServiceTextAction>
        )}
        {topics.length === 0 && <p>Nessun risultato trovato</p>}
        <h2>Altre categorie</h2>
        {categories
          .filter((value) => value !== category)
          .map((value) => (
            <ProfileRow
              key={value}
              label={value}
              onClick={() => {
                setCategory(value)
                setQuery('')
                setExpanded(false)
              }}
            />
          ))}
      </ProfilePage>
    )
  return (
    <ProfilePage
      className="mf-services mf-services-support-home"
      title={
        <>
          Ciao Andrea,
          <br />
          come possiamo aiutarti?
        </>
      }
      description="Versione app 01.02"
      onBack={onBack}
      onClose={onClose}
      footer={footer}
    >
      <section className="mf-services-section">
        <h2>Azioni rapide</h2>
        <div className="mf-services-quick-actions">
          <ServiceQuickAction
            icon={a.problem}
            label="Problemi Carta"
            onClick={() => {
              setCategory('Carte')
              showTopic('Problemi con la carta')
            }}
          />
          <ServiceQuickAction
            icon={a.pin}
            label={'I tuoi\ncodici'}
            onClick={() => {
              setCategory('Sicurezza')
              showTopic('Gestione sicurezza')
            }}
          />
          <ServiceQuickAction icon={a.document} label="Documenti" onClick={() => onNavigate('documents')} />
          <ServiceQuickAction icon={a.branch} label="Trova filiale o ATM" onClick={() => onNavigate('branches')} />
        </div>
      </section>
      <ServiceTextAction icon={a.calendar} onClick={() => onNavigate('appointments')}>
        Fissa un appuntamento
      </ServiceTextAction>
      <section className="mf-services-section">
        <h2>Argomenti suggeriti</h2>
        <ProfileTabs labels={categories} value={category} onChange={setCategory} label="Argomenti suggeriti" />
        {topics.slice(0, 3).map((item) => (
          <div className="mf-services-topic-card" key={item.title}>
            <strong>{item.title}</strong>
            <p>{item.description}</p>
            <ServiceTextAction onClick={() => showTopic(item.title)}>Approfondisci ›</ServiceTextAction>
          </div>
        ))}
        <ServiceTextAction
          onClick={() => {
            setView('topics')
            setQuery('')
          }}
        >
          Vedi altro ›
        </ServiceTextAction>
      </section>
      <section className="mf-services-section">
        <h2>Tutorial</h2>
        <p>Scopri tutto quello che c’è da sapere sull’app</p>
        <div className="mf-services-tutorial-carousel">
          {tutorials.slice(tutorialIndex, tutorialIndex + 3).map((item, index) => (
            <button
              type="button"
              key={item.title}
              onClick={() => {
                setTutorialIndex(tutorialIndex + index)
                setTutorialStep(0)
                setView('tutorial')
              }}
            >
              <span>
                <img src={item.icon} alt="" />
              </span>
              <strong>{item.title}</strong>
            </button>
          ))}
        </div>
        <div className="mf-services-double">
          <ServiceTextAction onClick={() => setTutorialIndex((index) => Math.max(0, index - 1))}>
            Precedenti
          </ServiceTextAction>
          <ServiceTextAction onClick={() => setTutorialIndex((index) => Math.min(tutorials.length - 3, index + 1))}>
            Successivi
          </ServiceTextAction>
        </div>
        <ServiceTextAction onClick={() => setView('tutorials')}>Vedi tutti i tutorial ›</ServiceTextAction>
      </section>
      <section className="mf-services-section">
        <h2>Guida</h2>
        {['Guida al servizio di banca multicanale', 'Prospetto delle funzionalità - DOL'].map((title) => (
          <ProfileRow
            key={title}
            label={title}
            icon={a.document}
            onClick={() => {
              setGuide(title)
              setView('guide')
            }}
          />
        ))}
      </section>
    </ProfilePage>
  )
}
