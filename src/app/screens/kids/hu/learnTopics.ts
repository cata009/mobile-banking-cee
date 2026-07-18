/**
 * HU Kids Learn curriculum: every topic with its lessons, slides, and
 * checkpoint quizzes.
 *
 * Kept in its own module because it is by far the largest content block in the
 * Kids app and it changes for editorial reasons, not product ones.
 */
import type { LearnModule } from "@/data/huKidsBanking";
import type { HuLearnTopic } from "./types";

export const HU_LEARN_TOPICS: HuLearnTopic[] = [
  {
    id: "money-basics",
    moduleId: "learn-balance",
    title: "Money basics",
    subtitle: "Balance, daily spend and choices that fit today.",
    helper: "Understand what money is available now and what should stay untouched.",
    visual: "balance",
    lessons: [
      {
        id: "money-basics-balance",
        title: "What is balance?",
        eyebrow: "Lesson 1",
        description: "The money you can use now, after card payments and transfers.",
        body: [
          "Your balance is the money already available in your account. It changes when you receive allowance, pay by card, move money, or save toward a goal.",
          "In this Kids home, the big number shows what Alexandra can spend today. The full amount stays lower on the page, because not all money should feel ready to spend.",
          "A good habit is to check what is available today before deciding what to buy.",
        ],
        visual: "balance",
        slides: [
          {
            title: "Welcome to your balance!",
            text: "In your banking app, the \"balance\" is the total amount of money sitting in your account right now. Think of it as a digital wallet that quietly holds your funds for you. Whenever you open the app, this number tells you exactly how much you have to work with. It is the starting point for every smart choice you make with your money, so getting comfortable reading it is the first skill every saver needs to learn.",
            points: [
              "Your balance is the money ready to use in your account today.",
              "It changes whenever money comes in or goes out.",
              "Checking it before spending is a smart daily habit.",
            ],
          },
          {
            title: "How it changes",
            text: "Your balance goes up whenever you receive pocket money, a birthday gift, or a reward for chores. It goes down each time you pay with your card, buy a game online, or move money into a saving goal. Think of it like water in a bucket: some flows in, and some flows out. Watching those changes helps you understand where your money really goes and why your balance never stays the same for long.",
            points: [
              "Money flows in from allowance, gifts, and chore rewards.",
              "Money flows out through card payments and transfers.",
              "Watching both sides helps you stay in control.",
            ],
          },
          {
            title: "Smart check routine",
            text: "Before buying anything, get into the habit of checking your balance first. Ask yourself whether you have enough for today's needs and whether this purchase is truly worth it. A quick ten-second check can save you from running out of money later in the week, and it builds confidence every single time. Small habits like this are how confident money managers are built, one smart choice at a time.",
            points: [
              "Check your balance before every purchase, big or small.",
              "A ten-second glance can save you from running out.",
              "Confidence grows with every smart daily choice.",
            ],
          },
        ],
        quiz: [
          {
            question: "What is your account balance?",
            options: [
              "The total money available in your account.",
              "A list of items you want to buy.",
              "The money you spent last year.",
            ],
            correctIndex: 0,
          },
          {
            question: "When does your balance go up?",
            options: [
              "When you buy a snack.",
              "When you receive pocket money or allowance.",
              "When you freeze your card.",
            ],
            correctIndex: 1,
          },
        ],
      },
      {
        id: "money-basics-today",
        title: "Spend today, plan tomorrow",
        eyebrow: "Lesson 2",
        description: "Learn why daily money and total money are different.",
        body: [
          "Daily spend is the amount that fits today's plan. Total money includes savings, goals, and money that should stay safe.",
          "When an app separates these numbers, it helps you make faster decisions without accidentally using money saved for something important.",
        ],
        visual: "card",
        slides: [
          {
            title: "The two numbers",
            text: "Your app separates \"Daily spend\" from \"Total money\" for a clever reason. Seeing all your money at once can trick your brain into feeling like you can spend it all today. Daily spend shows only what is safely available for snacks, games, and little treats. The rest stays quietly protected in the background, where it belongs. Two simple numbers, one big difference to how clearly you think about money every day.",
            points: [
              "\"Daily spend\" is what you can safely use today.",
              "\"Total money\" includes savings you should not touch.",
              "Separate numbers stop you from over-spending by accident.",
            ],
          },
          {
            title: "Protecting your savings",
            text: "Imagine you have 10,000 HUF in total, but 8,000 HUF is being saved for a shiny new bicycle. That means your real budget for snacks, games, and small treats is only 2,000 HUF. The daily spend number reminds you of this so you do not accidentally dip into your bike fund when temptation pops up. Protecting savings is exactly how wishes actually come true, one careful choice at a time.",
            points: [
              "Total money is not the same as spendable money.",
              "Savings for goals should stay safely out of reach.",
              "Knowing your real budget protects what matters most.",
            ],
          },
          {
            title: "Separation is key",
            text: "Keeping your daily spending money apart from your savings is one of the smartest things you can do. It protects the money you have been patiently setting aside for something you truly care about. When savings stay separate, you can enjoy your small treats without any worry or guilt. Good separation turns money goals from distant dreams into real, reachable plans.",
            points: [
              "Separate pots keep spending money and savings safe.",
              "You can enjoy treats without touching your goals.",
              "Clear separation turns dreams into real plans.",
            ],
          },
        ],
        quiz: [
          {
            question: "Why does the app separate Daily spend from Total money?",
            options: [
              "To make the screen look more colorful.",
              "To help you avoid spending money saved for goals.",
              "To show how fast you can spend everything.",
            ],
            correctIndex: 1,
          },
          {
            question: "If you have 8,000 HUF saved and a total of 10,000 HUF, what is your spending budget?",
            options: [
              "10,000 HUF",
              "8,000 HUF",
              "2,000 HUF",
            ],
            correctIndex: 2,
          },
        ],
      },
      {
        id: "money-basics-check",
        title: "Quick money check",
        eyebrow: "Lesson 3",
        description: "A small routine before buying something.",
        body: [
          "Before spending, ask three questions: do I have enough today, do I still need money later, and would this slow down a saving goal?",
          "If the answer is unclear, wait a little or ask a parent. Waiting is also a money skill.",
        ],
        visual: "goals",
        slides: [
          {
            title: "The 3-question routine",
            text: "Before tapping your card at a store, pause and ask yourself three quick questions. First, do I really need this today? Second, do I have enough in my daily budget? Third, will this slow down my saving goal? Answering these honestly only takes a few seconds, and it can save you from a lot of regret later. Three simple questions are like a tiny shield that protects both your wallet and your future plans.",
            points: [
              "Ask: do I need it, can I afford it, will it hurt my goal?",
              "Honest answers take only a few seconds.",
              "A short pause prevents most spending regrets.",
            ],
          },
          {
            title: "Wants vs. Needs",
            text: "A \"need\" is something essential, like a school lunch or a bus ticket to get home. A \"want\" is something nice to have, like a new game or a fancy snack. There is nothing wrong with wants, but learning to tell them apart is a huge money skill that lasts a lifetime. Needs come first, and wants fill in once the needs are safely covered for the day.",
            points: [
              "\"Needs\" are essentials like lunch and bus tickets.",
              "\"Wants\" are extras, nice but not necessary.",
              "Cover needs first, then enjoy your wants.",
            ],
          },
          {
            title: "The 24-Hour rule",
            text: "Whenever you really want to buy a \"want\", try waiting 24 hours before deciding. Often you will find the urge fades, and you no longer feel you need it as much as you thought. The money you did not spend stays safely in your account for something better and more meaningful. This simple rule has saved people a fortune, and it works just as well for a 500 HUF snack as for a 50,000 HUF bike.",
            points: [
              "Wait a day before buying any non-essential treat.",
              "The urge often fades while you wait.",
              "Money not spent stays ready for what matters more.",
            ],
          },
        ],
        quiz: [
          {
            question: "What is a \"need\"?",
            options: [
              "A new video game.",
              "An essential item like school lunch.",
              "A cinema ticket.",
            ],
            correctIndex: 1,
          },
          {
            question: "What is the 24-hour rule?",
            options: [
              "Waiting a day to see if you still want to buy a non-essential item.",
              "Spending all your money in 24 hours.",
              "Only buying items that last 24 hours.",
            ],
            correctIndex: 0,
          },
        ],
      },
    ],
  },
  {
    id: "saving-goals",
    moduleId: "learn-goals",
    title: "Saving goals",
    subtitle: "Small steps for bigger wishes.",
    helper: "Turn wishes into reachable goals with a target and steady progress.",
    visual: "goals",
    lessons: [
      {
        id: "saving-goals-target",
        title: "Pick a clear target",
        eyebrow: "Lesson 1",
        description: "Every goal needs a name and a target amount.",
        body: [
          "A goal works best when it is specific. 'New bike' is easier to understand than 'save more'.",
          "The target amount tells you how close you are. Progress makes patience visible.",
        ],
        visual: "goals",
        slides: [
          {
            title: "Make it specific",
            text: "Saving without a plan is hard, because it is easy to lose focus. It becomes much easier when you give your goal a clear name, like \"New Skateboard\" instead of just \"saving money\". A specific target gives your brain something to aim for every single week. The clearer the picture, the more motivated you will feel, and the less tempting it becomes to spend your money on random little things instead.",
            points: [
              "Name your goal, like \"New Skateboard\", not just \"saving\".",
              "A clear target keeps your brain focused each week.",
              "Specific goals make random spending less tempting.",
            ],
          },
          {
            title: "Set the numbers",
            text: "Every solid goal needs two numbers: a target amount, which is how much the item costs, and a target date, which is when you would love to have it. Together, these give you a clear finish line to run towards. You will always know how far you have come and how far is left to go. That simple pair of numbers turns a fuzzy wish into a real plan you can actually follow week by week.",
            points: [
              "Set a target amount, the real cost of the item.",
              "Set a target date, when you want to reach it.",
              "Two numbers turn a wish into a real plan.",
            ],
          },
          {
            title: "Patience is visible",
            text: "Each time you add a little money to your goal, your progress bar grows a bit more. Watching that bar climb higher makes your patience feel real and rewarding. It turns waiting, which can feel boring, into something exciting you can actually see and celebrate. Every pixel of progress is proof that your effort is working, and that feeling is what keeps great savers going.",
            points: [
              "Each deposit makes the progress bar climb.",
              "Seeing progress makes patience feel rewarding.",
              "Visible growth keeps you motivated to continue.",
            ],
          },
        ],
        quiz: [
          {
            question: "Which of these is the best saving goal?",
            options: [
              "I want to save some money eventually.",
              "Save 15,000 HUF for a skateboard by September.",
              "Buy a lot of toys.",
            ],
            correctIndex: 1,
          },
          {
            question: "How does the progress bar help you?",
            options: [
              "It shows how close you are to reaching your target.",
              "It charges your phone battery.",
              "It orders the item automatically.",
            ],
            correctIndex: 0,
          },
        ],
      },
      {
        id: "saving-goals-boost",
        title: "Boost it safely",
        eyebrow: "Lesson 2",
        description: "Add money without emptying today's budget.",
        body: [
          "Adding a little money often is easier than adding a lot once. The app can help you move money after allowance, rewards, or gifts.",
          "A smart goal should grow while daily spending still feels comfortable.",
        ],
        visual: "balance",
        slides: [
          {
            title: "Small steps add up",
            text: "You do not need to save a huge amount all at once. Setting aside small amounts on a regular schedule, like 500 HUF every week, is the easiest way to reach any goal. Small steps almost do not feel like a sacrifice, yet they add up faster than you would expect. Steady little wins beat one big stressful push every time, and they are far more likely to actually reach the finish line.",
            points: [
              "Save small amounts on a regular schedule.",
              "500 HUF a week barely feels like a sacrifice.",
              "Steady small wins beat one big stressful push.",
            ],
          },
          {
            title: "Automatic saving",
            text: "You can set up a simple rule in the app that moves a small part of your allowance straight into your saving goal the moment you receive it. Because it happens automatically, you never have to remember or feel tempted to spend it first. It is like having a tiny robot helper that quietly does the saving for you in the background. Before you know it, your goal is fully funded and you hardly noticed the effort.",
            points: [
              "Auto-rules move money into savings the moment it arrives.",
              "You never feel tempted to spend it first.",
              "Saving quietly happens in the background.",
            ],
          },
          {
            title: "Power of consistency",
            text: "Consistent saving really is a superpower. Just 500 HUF a week grows into 2,000 HUF in a single month, and over a full year that becomes 24,000 HUF. The amounts feel small at the time, but the total result is huge and surprisingly satisfying. The secret is simply to keep going, week after week, without stopping, and let those small amounts quietly stack into something big.",
            points: [
              "500 HUF a week becomes 24,000 HUF in a year.",
              "Small amounts feel tiny but stack into big totals.",
              "The secret is simply to keep going without stopping.",
            ],
          },
        ],
        quiz: [
          {
            question: "What is the easiest way to save for a big goal?",
            options: [
              "Wait and try to save all the money at the very end.",
              "Save small, consistent amounts regularly.",
              "Hope you find money on the ground.",
            ],
            correctIndex: 1,
          },
          {
            question: "If you save 500 HUF a week, how much do you save in a month?",
            options: [
              "1,000 HUF",
              "2,000 HUF",
              "5,000 HUF",
            ],
            correctIndex: 1,
          },
        ],
      },
      {
        id: "saving-goals-share",
        title: "Ask for help",
        eyebrow: "Lesson 3",
        description: "Parents can help without seeing every private thought.",
        body: [
          "You can ask a parent to help with a goal when you need a boost. The important part is explaining the amount and why it matters.",
          "Goal support should feel safe, not pressured.",
        ],
        visual: "request",
        slides: [
          {
            title: "Talk about your goals",
            text: "If you are saving for something big or important, it is a great idea to share your goal progress with your parents or family. Telling someone makes the goal feel more real, and they can cheer you on along the way. The people close to you genuinely want to help you succeed, and a quick conversation can turn into great encouragement. Sharing turns a private plan into a happy team effort.",
            points: [
              "Tell your family about your saving goals.",
              "Sharing makes the goal feel more real.",
              "Their encouragement turns saving into teamwork.",
            ],
          },
          {
            title: "Show your effort",
            text: "Parents love to see that you are being responsible with money. Before you ask for any help, try to show them your progress, like the fact that you already saved 50% of the goal all by yourself. Seeing your effort proves how much the goal matters to you in real life. Hard work makes people want to support you even more, and it makes any help feel like a true partnership.",
            points: [
              "Show your progress before asking for help.",
              "Saving 50% yourself proves the goal matters.",
              "Hard work makes others eager to support you.",
            ],
          },
          {
            title: "Savings match",
            text: "Sometimes parents will offer to match your savings, meaning they add the same amount again to help you reach the target faster. Other times they might give you a boost in exchange for a few extra chores around the house. Both are wonderful ways to turn your effort into even bigger results than you could reach alone. Just remember, the match only works because you did the real saving first.",
            points: [
              "A match means parents add the same amount you saved.",
              "Extra chores can also earn a helpful boost.",
              "Matches reward the saving you already did first.",
            ],
          },
        ],
        quiz: [
          {
            question: "What is a good way to show responsibility to parents?",
            options: [
              "Show them you've already saved a part of the goal yourself.",
              "Demand they buy the item immediately.",
              "Keep your goal completely secret.",
            ],
            correctIndex: 0,
          },
          {
            question: "What does \"matching savings\" mean?",
            options: [
              "Finding two identical coins.",
              "Parents contributing to your goal to reward your saving efforts.",
              "Spending the same amount as your friend.",
            ],
            correctIndex: 1,
          },
        ],
      },
      {
        id: "saving-goals-priority",
        title: "Pick what matters most",
        eyebrow: "Lesson 4",
        description: "When you have many wishes, save for the important one first.",
        body: [
          "It is normal to want several things at once. Choosing one goal to focus on helps you reach it faster than splitting money everywhere.",
          "A clear priority keeps you motivated, because progress happens quickly and feels rewarding.",
        ],
        visual: "goals",
        slides: [
          {
            title: "Too many wishes",
            text: "Maybe you want a new bike, a video game, and a pair of trainers all at the same time. That is completely normal, but trying to save for everything at once makes each goal crawl forward very slowly. When you spread 1,000 HUF across five different goals, each one only gets 200 HUF, and nothing feels like it is moving. Choosing one main goal first changes that completely and gives you a real chance of finishing it.",
            points: [
              "Wanting several things at once is completely normal.",
              "Splitting money everywhere makes every goal crawl.",
              "Focusing on one goal first helps you reach it faster.",
            ],
          },
          {
            title: "How to choose",
            text: "A simple way to pick your top goal is to ask which one you would still care about in three months. The bike you will ride every day probably beats a snack you forget by tomorrow. Sort your wishes from most important to least important, then send your saving energy to number one. The others can happily wait their turn once the first goal is done.",
            points: [
              "Ask which wish you will still care about in three months.",
              "Sort wishes from most important to least important.",
              "Save for number one first, then move to the next.",
            ],
          },
          {
            title: "Finish, then start again",
            text: "Once your main goal is fully funded and the item is yours, you get a wonderful feeling of success. That proud moment is the perfect time to pick the next goal from your list and start again. Reaching goals one by one is how ordinary people build amazing things over the years, like a guitar, a trip, or even a first car later on. Each finished goal makes the next one feel easier and more exciting.",
            points: [
              "Finishing a goal feels wonderful and proud.",
              "Then pick the next wish and start again.",
              "One by one, small goals stack into something amazing.",
            ],
          },
        ],
        quiz: [
          {
            question: "Why is saving for many goals at once tricky?",
            options: [
              "Each goal moves forward very slowly.",
              "You are not allowed to have more than one goal.",
              "The bank charges extra fees.",
            ],
            correctIndex: 0,
          },
          {
            question: "What is a smart way to choose your top goal?",
            options: [
              "Pick whatever is cheapest.",
              "Ask which one you will still care about in three months.",
              "Always pick the one a friend chose.",
            ],
            correctIndex: 1,
          },
        ],
      },
      {
        id: "saving-goals-celebrate",
        title: "Celebrate the win",
        eyebrow: "Lesson 5",
        description: "Reaching a goal is a big deal, enjoy it and plan the next step.",
        body: [
          "When your progress bar hits 100%, take a moment to feel proud. Saving patiently is a real skill worth celebrating.",
          "After the celebration, you can set a fresh goal and use everything you learned to reach it even faster.",
        ],
        visual: "request",
        slides: [
          {
            title: "The 100% moment",
            text: "There is a special moment when your progress bar finally fills all the way to 100%. That is when your saving is complete and the item you dreamed of is finally within reach. It feels amazing because you earned every single forint of it through patience and good choices. Pause and enjoy that proud feeling, because it is the reward for all those weeks of saying no to little temptations.",
            points: [
              "Hitting 100% on your progress bar feels amazing.",
              "You earned every forint through patience and choices.",
              "Pause and enjoy the proud feeling of finishing.",
            ],
          },
          {
            title: "Treat yourself kindly",
            text: "Reaching a goal is a great reason to celebrate in a small, sensible way. Maybe you tell your family, share the news with a friend, or enjoy a tiny 500 HUF treat alongside your big purchase. The celebration does not have to cost much, it just marks the moment and helps you remember how good saving feels. Positive memories like this make you want to keep saving for the next goal too.",
            points: [
              "Celebrate finishing a goal in a small, sensible way.",
              "Share the news or enjoy a tiny 500 HUF treat.",
              "Good memories make you want to save again.",
            ],
          },
          {
            title: "Ready for the next goal",
            text: "Now that you have reached one goal, you have proof that saving really works. You can use the same tricks, like weekly deposits and clear targets, to reach the next wish even faster. Some kids set a brand new goal the very same week, keeping their saving habit alive without a pause. Each finished goal makes you a stronger, more confident saver for life.",
            points: [
              "Finishing proves that your saving method works.",
              "Reuse the same tricks for the next goal, faster.",
              "Each win makes you a stronger saver for life.",
            ],
          },
        ],
        quiz: [
          {
            question: "What does it mean when your progress bar reaches 100%?",
            options: [
              "You have spent all your money.",
              "Your saving goal is complete.",
              "Your card is frozen.",
            ],
            correctIndex: 1,
          },
          {
            question: "What is a good thing to do after reaching a goal?",
            options: [
              "Give up on saving forever.",
              "Celebrate and then set a new goal.",
              "Hide the money under your pillow.",
            ],
            correctIndex: 1,
          },
        ],
      },
    ],
  },
  {
    id: "online-safety",
    moduleId: "learn-scam",
    title: "Online safety",
    subtitle: "Spot strange links, prizes and urgent messages.",
    helper: "Pause before sharing codes, card details, or personal information.",
    visual: "safety",
    lessons: [
      {
        id: "online-safety-pause",
        title: "Pause before tapping",
        eyebrow: "Lesson 1",
        description: "Urgent messages are often trying to rush you.",
        body: [
          "A message saying 'act now' or 'you won' can feel exciting. Scams use that feeling to make people move too fast.",
          "Slow down, check the sender, and ask a parent before opening strange links.",
        ],
        visual: "safety",
        slides: [
          {
            title: "The excitement trap",
            text: "Have you ever seen a message pop up saying \"You won a free game console! Tap here to claim in 2 minutes!\"? That burst of excitement is no accident, it is a trap set by scammers. If a prize feels too good to be true, it almost certainly is a trick designed to grab your attention. Real rewards never demand that you tap a strange link within seconds, so always pause before you celebrate.",
            points: [
              "Surprise \"you won\" messages are usually scams.",
              "If a prize feels too good, it is probably fake.",
              "Real rewards never rush you to tap a link.",
            ],
          },
          {
            title: "Why they rush you",
            text: "Scammers always create a fake sense of urgency, like a countdown or a warning that something will expire. They want to rush you so you tap the link or hand over details before you have time to think. The trick only works when you panic and stop asking questions. A slow, calm pause is the simplest and most powerful way to defeat almost every urgent trick.",
            points: [
              "Scammers fake countdowns and urgent warnings.",
              "Their trick only works when you panic.",
              "A calm pause defeats almost every rush tactic.",
            ],
          },
          {
            title: "The rule of thumb",
            text: "Real banks and trusted companies never threaten you or demand immediate action through a message. If anything says \"act now\" or warns your account will be closed in minutes, that is a huge warning sign of a scam. Stop right there, do not tap anything, and ask an adult you trust before doing anything else. A genuine bank will always give you time to check, calmly and safely.",
            points: [
              "Real banks never threaten you in messages.",
              "\"Act now\" warnings are a huge scam sign.",
              "Stop, do not tap, and ask a trusted adult.",
            ],
          }
        ],
        quiz: [
          {
            question: "Why do scammers make messages feel very urgent?",
            options: [
              "To help you get your reward faster.",
              "To make you act quickly without thinking.",
              "Because their computers are slow."
            ],
            correctIndex: 1
          },
          {
            question: "What should you do with a link promising a free prize?",
            options: [
              "Tap it immediately.",
              "Ignore it and ask a parent to verify.",
              "Forward it to all contacts."
            ],
            correctIndex: 1
          }
        ]
      },
      {
        id: "online-safety-private",
        title: "Keep codes private",
        eyebrow: "Lesson 2",
        description: "PINs, passwords, and login codes are never chat messages.",
        body: [
          "A bank, parent, or friend should not ask for your PIN in a message. If someone asks, stop and tell an adult.",
          "Private codes protect your money like a key protects a door.",
        ],
        visual: "card",
        slides: [
          {
            title: "Keys to your vault",
            text: "Your PIN code, account passwords, and the verification codes you receive by text are completely private. Think of them as the keys that lock and unlock the vault holding your money. You would never hand your house keys to a stranger on the street, so treat these codes the exact same way. They protect everything you have patiently saved, and keeping them secret is one of the most important safety rules of all.",
            points: [
              "PINs, passwords, and SMS codes are always private.",
              "They are the keys to your money vault.",
              "Never share them, just like house keys.",
            ],
          },
          {
            title: "The support lie",
            text: "Scammers might message you pretending to be game administrators or bank support. They will claim there is a problem with your account and that they urgently need your PIN or password to fix it. This is always a lie, because real support never asks for your secret codes in a chat or message. The safest answer is a firm no, then telling an adult you trust right away.",
            points: [
              "Fake support will ask for your PIN or password.",
              "Real support never requests secret codes.",
              "Say no firmly and tell a trusted adult.",
            ],
          },
          {
            title: "Keep it hidden",
            text: "Never share your codes in chat apps or screenshots, even with people you trust online. When you type your PIN at an ATM or a store terminal, get into the habit of covering the keypad with your free hand. It only takes one quick glance for someone nearby to steal your code and quietly drain your money. A little shielding goes a very long way in keeping everything you have saved safe.",
            points: [
              "Never share codes in chats or screenshots.",
              "Cover the keypad when typing your PIN.",
              "One hidden glance can steal your whole code.",
            ],
          }
        ],
        quiz: [
          {
            question: "When is it okay to send your PIN in a chat message?",
            options: [
              "When a friend needs to borrow money.",
              "When support claims your account is locked.",
              "Never, PIN codes must always stay private."
            ],
            correctIndex: 2
          },
          {
            question: "What should you do when typing your PIN at a store?",
            options: [
              "Cover the keypad with your other hand.",
              "Say the numbers out loud.",
              "Let the person behind you check it."
            ],
            correctIndex: 0
          }
        ]
      },
      {
        id: "online-safety-report",
        title: "Report what feels wrong",
        eyebrow: "Lesson 3",
        description: "Freezing a card and asking for help are strong choices.",
        body: [
          "If something feels wrong, you can freeze your card and speak with a parent. Acting quickly helps keep money safe.",
          "Safety is not about never making mistakes. It is about knowing what to do next.",
        ],
        visual: "safety",
        slides: [
          {
            title: "Don't be embarrassed",
            text: "If you accidentally tapped a suspicious link or shared some card details, do not panic and do not feel embarrassed. Anyone can be caught off guard, even adults who think they have seen everything. The most important thing is to act quickly and tell someone you trust straight away. Fast action is what really keeps your money safe in the end, far more than staying silent.",
            points: [
              "Mistakes happen to everyone, even adults.",
              "Do not panic and do not feel embarrassed.",
              "Act quickly and tell a trusted adult fast.",
            ],
          },
          {
            title: "The Freeze button",
            text: "Open your banking app and tap \"Freeze\" on your card. This instantly locks the card so that nobody can use it to spend your money, no matter where they found it. It works in seconds, and you can always reverse it later once you feel safe again. Think of it as a fast pause button for your account, one tap and your money becomes untouchable until you decide otherwise.",
            points: [
              "Tap \"Freeze\" in the app to instantly lock a card.",
              "A frozen card cannot be used by anyone.",
              "You can unfreeze it later when you feel safe.",
            ],
          },
          {
            title: "Tell an adult",
            text: "Tell a parent or guardian right away, in your own words, what happened and when. They can help you contact the bank to block the card permanently and order a safe new one. Speaking up early makes a huge difference, because the bank can act before any money is lost. You are never in trouble for asking for help, and acting fast is always the smart, brave choice.",
            points: [
              "Tell a parent what happened, in your own words.",
              "They can call the bank to block the card.",
              "Acting early can stop money from being lost.",
            ],
          }
        ],
        quiz: [
          {
            question: "What is the first thing you should do if you lose your card?",
            options: [
              "Freeze the card in your banking app.",
              "Wait a few weeks to see if it shows up.",
              "Delete the banking app."
            ],
            correctIndex: 0
          },
          {
            question: "Who should you talk to if you think your account is unsafe?",
            options: [
              "Your classmates.",
              "A parent or guardian immediately.",
              "Nobody, keep it secret."
            ],
            correctIndex: 1
          }
        ]
      },
    ],
  },
  {
    id: "request-money",
    moduleId: "learn-request",
    title: "Request money",
    subtitle: "Ask clearly and follow the status.",
    helper: "Requests are easier to approve when the amount and reason are simple.",
    visual: "request",
    lessons: [
      {
        id: "request-money-reason",
        title: "Explain the reason",
        eyebrow: "Lesson 1",
        description: "A good request says what the money is for.",
        body: [
          "A request with a reason helps your parent understand the situation. 'Food after practice' is clearer than just asking for money.",
          "The app keeps the status visible, so you know whether it is waiting, approved, or declined.",
        ],
        visual: "request",
        slides: [
          {
            title: "Money is a conversation",
            text: "When you send a money request in the app, your parents receive a notification on their phone. It is always best to add a short, polite reason explaining what the money is for. A friendly note like \"lunch after football practice\" helps them understand right away and feel good about helping. Clear words make the whole request feel respectful, honest, and easy to say yes to.",
            points: [
              "Each request sends a notification to your parents.",
              "Add a short, polite reason for the money.",
              "Clear notes make requests easy to say yes to.",
            ],
          },
          {
            title: "Clear vs. Vague",
            text: "A request for 1,500 HUF with the note \"Bus ticket home\" is easy for parents to understand and approve. A blank request for the same amount leaves them guessing what the money is really for, which slows everything down. The clearer you are, the faster they can say yes with confidence and no worries. Good notes build good habits that make every future request smoother.",
            points: [
              "\"1,500 HUF for bus ticket home\" is clear.",
              "Blank requests leave parents guessing and slow.",
              "Clear notes earn faster, confident approvals.",
            ],
          },
          {
            title: "Building trust",
            text: "Explaining your needs shows that you respect your family's budget and understand the real value of money. Over time, these honest little explanations add up to something bigger and more valuable: trust. When parents can see you are thoughtful and fair, they feel genuinely good about saying yes. Trust is the quiet reward for being clear and honest, request after request.",
            points: [
              "Clear reasons show respect for the family budget.",
              "Honest explanations quietly build long-term trust.",
              "Trustworthy kids get more confident \"yes\" answers.",
            ],
          }
        ],
        quiz: [
          {
            question: "Why is adding a reason to a request helpful?",
            options: [
              "It helps parents understand the need so they can approve it easily.",
              "It makes the notification sound louder.",
              "It is required to type at least 50 words."
            ],
            correctIndex: 0
          },
          {
            question: "Which request note is the most responsible?",
            options: [
              "\"give me money\"",
              "\"2,000 HUF for art class sketchbook\"",
              "\"cash please\""
            ],
            correctIndex: 1
          }
        ]
      },
      {
        id: "request-money-amount",
        title: "Choose a fair amount",
        eyebrow: "Lesson 2",
        description: "Small, realistic requests build trust.",
        body: [
          "A fair amount matches the real need. Asking for the right amount makes approvals faster and helps everyone feel confident.",
          "If you are not sure how much something costs, estimate and add a short note.",
        ],
        visual: "balance",
        slides: [
          {
            title: "Check the price first",
            text: "Before sending a request, take a moment to find out how much the item actually costs. Check the price in the shop, on the receipt, or online, instead of guessing a random high number. A correct figure shows you have thought it through and respected the family budget. Guessing can make the request look careless or unfair, and it slows down the approval you really want.",
            points: [
              "Check the real price before sending a request.",
              "Look at the shop, receipt, or website.",
              "Correct figures show you have thought it through.",
            ],
          },
          {
            title: "Stick to the facts",
            text: "If a school lunch costs 1,200 HUF, then the fair request is exactly 1,200 HUF. Asking for 3,000 HUF instead would only make sense if you had already agreed on something extra ahead of time. Sticking to the real cost keeps everything honest, simple, and easy to approve without any questions. Parents notice when your numbers match real life, and that honesty earns their confidence.",
            points: [
              "A 1,200 HUF lunch means a 1,200 HUF request.",
              "Ask for extra only if it was agreed beforehand.",
              "Matching real prices keeps requests honest and simple.",
            ],
          },
          {
            title: "Trust is a currency",
            text: "Requesting fair and accurate amounts is one of the best ways to build trust over time. When parents see that you only ever ask for what you genuinely need, they feel confident giving you more responsibility later on. Trust works a lot like a savings account: small, honest deposits grow into something valuable and lasting. Every fair request you send is another deposit into that account.",
            points: [
              "Fair amounts build trust over time.",
              "Trustworthy kids earn more responsibility later.",
              "Think of trust like a savings account you grow.",
            ],
          }
        ],
        quiz: [
          {
            question: "How should you determine the request amount?",
            options: [
              "Ask for a large round number to get extra cash.",
              "Check the actual cost and request that exact amount.",
              "Ask for a different amount every day."
            ],
            correctIndex: 1
          },
          {
            question: "What is the benefit of requesting fair amounts?",
            options: [
              "It builds trust with your parents.",
              "It gives you free coupon codes.",
              "It doubles your allowance."
            ],
            correctIndex: 0
          }
        ]
      },
      {
        id: "request-money-wait",
        title: "Waiting is normal",
        eyebrow: "Lesson 3",
        description: "Pending means your parent still needs to check.",
        body: [
          "A pending request is not a no. It simply means the adult has not decided yet.",
          "While waiting, keep the plan simple and avoid making the same request many times.",
        ],
        visual: "goals",
        slides: [
          {
            title: "What \"Pending\" means",
            text: "After you send a request, the app status shows \"Pending\". This simply means your parent has not yet had a chance to read and approve it. It is not a no, and it is not a yes yet either, the decision is still on its way. The status will update the moment they take a look at their phone, so a little waiting is perfectly normal and nothing to worry about.",
            points: [
              "\"Pending\" means your parent has not decided yet.",
              "It is not a no, the answer is still coming.",
              "The status updates the moment they take a look.",
            ],
          },
          {
            title: "Avoid notification spam",
            text: "Please do not send the same request over and over again. Spamming notifications will not make the approval come any faster, and it can quickly become annoying instead of helpful. One clear, well-explained request is always more effective than a flood of reminders. Patience is part of being trusted with money, and a calm single request shows real maturity.",
            points: [
              "Do not send the same request many times.",
              "Spam never speeds up an approval.",
              "One clear request shows real patience and maturity.",
            ],
          },
          {
            title: "Be patient",
            text: "Parents are often busy with work, errands, or chores, so a short wait is completely normal and no cause for worry. Be patient and give them a little time to check their phone when they can. If something really is super urgent, a polite phone call or a quick word in person always works best. Kindness and patience get faster answers than frustration ever will.",
            points: [
              "Short waits are normal while parents are busy.",
              "Give them time before following up at all.",
              "For urgent needs, a polite call works best.",
            ],
          }
        ],
        quiz: [
          {
            question: "What does a \"Pending\" status mean?",
            options: [
              "The request failed.",
              "The request is waiting for your parent's review.",
              "The bank has declined it."
            ],
            correctIndex: 1
          },
          {
            question: "What should you do if your request is pending?",
            options: [
              "Send the same request repeatedly.",
              "Wait patiently or talk in person if urgent.",
              "Delete the request immediately."
            ],
            correctIndex: 1
          }
        ]
      },
      {
        id: "request-money-thanks",
        title: "Say thank you",
        eyebrow: "Lesson 4",
        description: "A little gratitude makes future requests easier.",
        body: [
          "When a parent approves your request, a quick thank you goes a long way. It shows you appreciate their help and the money they sent.",
          "Gratitude builds trust, and trust is what makes parents more likely to say yes next time.",
        ],
        visual: "request",
        slides: [
          {
            title: "Why thanks matter",
            text: "When your parent approves a request and sends you money, they took time out of their day to help you. Saying thank you, out loud or in a short message, shows that you noticed their effort and truly appreciate it. It costs nothing, yet it makes the other person feel good and more willing to help you again. Kind words are a tiny habit that builds strong trust between you and your family over the years.",
            points: [
              "Parents take time to read and approve your requests.",
              "A thank you shows you notice and appreciate their help.",
              "Gratitude costs nothing but builds real family trust.",
            ],
          },
          {
            title: "More than money",
            text: "Saying thank you is about much more than just the money you received. It shows you are mature enough to recognize when someone supports you, whether that support is 500 HUF for a snack or 5,000 HUF for a birthday treat. People who feel appreciated are always happier to help again in the future. Good manners make every request, big or small, far more likely to get a friendly yes.",
            points: [
              "Thanks show maturity, not just for the cash.",
              "People who feel appreciated happily help again.",
              "Good manners make a yes more likely next time.",
            ],
          },
          {
            title: "Keep the trust",
            text: "Every approved request is a little bit of trust your parent has placed in you. When you say thank you, spend the money wisely, and do exactly what you promised, that trust grows stronger. Over time, a strong trust record means parents worry less and approve bigger requests more easily. Trust is built in small moments and protects your chance to ask for help whenever you truly need it.",
            points: [
              "Each approval is trust your parent places in you.",
              "Spend wisely and keep your promises to grow trust.",
              "Strong trust makes bigger future requests easier.",
            ],
          },
        ],
        quiz: [
          {
            question: "Why is saying thank you after a request important?",
            options: [
              "It is required by the bank.",
              "It shows appreciation and builds trust for next time.",
              "It makes the money arrive faster.",
            ],
            correctIndex: 1,
          },
          {
            question: "What helps parents trust you with bigger requests later?",
            options: [
              "Spending wisely and keeping your promises.",
              "Asking many times a day.",
              "Hiding what you bought.",
            ],
            correctIndex: 0,
          },
        ],
      },
      {
        id: "request-money-plan",
        title: "Have a plan for it",
        eyebrow: "Lesson 5",
        description: "Know exactly what the money is for before you ask.",
        body: [
          "Parents are far more likely to say yes when you can explain clearly what you need the money for.",
          "A clear plan also helps you spend the money on the thing you asked about, not something else.",
        ],
        visual: "balance",
        slides: [
          {
            title: "Know the reason",
            text: "Before you tap request, get really clear in your own head about why you need this money. Is it for a 2,000 HUF book for school, a 3,500 HUF cinema trip with friends, or a contribution toward a saving goal? When you know the exact reason, you can explain it in one simple sentence. A clear reason sounds honest and thoughtful, and parents respond much better to that than to a vague \"I just need some money\".",
            points: [
              "Decide the exact reason before you ask.",
              "Be specific, like a 2,000 HUF school book.",
              "Clear reasons sound honest and thoughtful.",
            ],
          },
          {
            title: "Explain the amount",
            text: "Once you know the reason, you also need to explain the amount you are asking for. If the cinema ticket costs 3,500 HUF and you already saved 1,000 HUF, then you only need to ask for 2,500 HUF. Showing this little bit of maths proves you have thought it through carefully. Parents love to see that kind of thinking, because it shows real responsibility with money.",
            points: [
              "Match the amount to the real cost of the item.",
              "Show the maths, like 3,500 minus 1,000 you saved.",
              "Careful thinking proves real responsibility.",
            ],
          },
          {
            title: "Stick to the plan",
            text: "After your request is approved, try hard to spend the money on the thing you explained. If you asked for a book but then spent it all on snacks, your parent may be less keen to approve the next request. Sticking to your plan shows you are reliable and honest, which keeps trust strong. If your plan changes, just tell them honestly, that is far better than hiding it.",
            points: [
              "Spend the approved money on what you described.",
              "Switching to snacks can weaken trust next time.",
              "If plans change, be honest rather than secretive.",
            ],
          },
        ],
        quiz: [
          {
            question: "What is a good way to explain a request?",
            options: [
              "Just say \"I need money\".",
              "Say exactly what it is for and how much you need.",
              "Ask for double what you need.",
            ],
            correctIndex: 1,
          },
          {
            question: "What should you do after a request is approved?",
            options: [
              "Spend it on anything random.",
              "Spend it on what you explained, or be honest if plans change.",
              "Hide what you bought from your parent.",
            ],
            correctIndex: 1,
          },
        ],
      },
      {
        id: "request-money-frequency",
        title: "Ask the right amount",
        eyebrow: "Lesson 6",
        description: "How often you ask matters as much as what you ask for.",
        body: [
          "Asking for money every single day feels overwhelming to a parent. Spacing out your requests shows patience and planning.",
          "A good habit is to group smaller needs together and ask less often for slightly bigger amounts.",
        ],
        visual: "goals",
        slides: [
          {
            title: "Too many requests",
            text: "Imagine sending your parent a new money request every single day. Even if each one is small, the constant asking quickly feels tiring and a little demanding. Parents start to wonder whether you are thinking carefully or just asking on impulse. Spacing out your requests, maybe once a week, shows you are patient and thoughtful, and it makes each request much more likely to be taken seriously.",
            points: [
              "Daily requests feel tiring and a bit demanding.",
              "Parents may think you are asking on impulse.",
              "Asking about once a week looks patient and thoughtful.",
            ],
          },
          {
            title: "Group your needs",
            text: "A smart trick is to group several small needs into one bigger request. Instead of asking for 500 HUF today, 300 HUF tomorrow, and 800 HUF on Friday, plan ahead and ask for 1,600 HUF once at the start of the week. This is easier for your parent to review, and it teaches you to think about the whole week at once. Grouping needs is a grown-up planning skill that really works.",
            points: [
              "Combine small needs into one weekly request.",
              "One 1,600 HUF ask beats three tiny daily ones.",
              "Planning the whole week is a grown-up skill.",
            ],
          },
          {
            title: "Smart timing",
            text: "Timing also matters when you make a request. Try to ask when your parent is not super busy or stressed, so they have a calm moment to read your reason. Early evening or a quiet weekend morning often works much better than a rushed school-run afternoon. A well-timed request gets a faster and friendlier answer, which is exactly what you want.",
            points: [
              "Ask when your parent is calm and not too busy.",
              "Early evening or quiet weekends often work well.",
              "Well-timed requests get faster, friendlier answers.",
            ],
          },
        ],
        quiz: [
          {
            question: "Why is sending a request every day a problem?",
            options: [
              "It is against the rules.",
              "It feels tiring and looks like impulse asking.",
              "The app blocks daily requests.",
            ],
            correctIndex: 1,
          },
          {
            question: "What is a smart way to ask for several small things?",
            options: [
              "Group them into one weekly request.",
              "Send each one separately every hour.",
              "Ask a different parent for each one.",
            ],
            correctIndex: 0,
          },
        ],
      },
      {
        id: "request-money-no",
        title: "Handling a no",
        eyebrow: "Lesson 7",
        description: "A no is not the end, it is a chance to learn.",
        body: [
          "Sometimes a parent will decline a request, and that is okay. A calm reaction shows real maturity.",
          "Ask why politely, learn from the reason, and you will know how to ask better next time.",
        ],
        visual: "request",
        slides: [
          {
            title: "Stay calm",
            text: "When a request comes back as a no, it is normal to feel a little disappointed. Take a breath and stay calm instead of getting upset or angry. A calm reaction shows you are mature and respectful, even when things do not go your way. Parents really notice this kind of response, and it actually makes them more open to saying yes to your next request in the future.",
            points: [
              "Feeling disappointed at a no is completely normal.",
              "Staying calm shows you are mature and respectful.",
              "Calm reactions make future yeses more likely.",
            ],
          },
          {
            title: "Ask why politely",
            text: "A no always has a reason behind it. Maybe the timing is not right, the amount is too high, or your parent thinks the purchase is not necessary right now. Politely asking why helps you understand their thinking, without sounding like you are arguing. Understanding the reason turns a no into a useful lesson that helps you make a stronger, smarter request the next time around.",
            points: [
              "Every no has a reason hiding behind it.",
              "Ask politely, without sounding like you argue.",
              "Understanding the reason makes next time stronger.",
            ],
          },
          {
            title: "Try again smarter",
            text: "A no today does not mean a no forever. Maybe you can save up part of the amount yourself, wait a few weeks, or choose a slightly cheaper option. Each no teaches you something new about how to plan and ask better. Great savers and planners have heard plenty of nos along the way, and they used every single one to get smarter with their money.",
            points: [
              "A no today is not a no forever.",
              "Save part yourself, wait, or pick a cheaper option.",
              "Every no teaches you to plan and ask smarter.",
            ],
          },
        ],
        quiz: [
          {
            question: "What is the best reaction when a request is declined?",
            options: [
              "Get angry and shout.",
              "Stay calm and ask why politely.",
              "Send the request again immediately.",
            ],
            correctIndex: 1,
          },
          {
            question: "What can you do after a no to improve your chances next time?",
            options: [
              "Give up on asking for anything ever.",
              "Save part yourself or pick a cheaper option.",
              "Ask a stranger for the money instead.",
            ],
            correctIndex: 1,
          },
        ],
      },
    ],
  },
  {
    id: "card-confidence",
    moduleId: "learn-card",
    title: "Card confidence",
    subtitle: "Pay, freeze and protect your card.",
    helper: "Learn what your card can do and how to keep it safe.",
    visual: "card",
    lessons: [
      {
        id: "card-confidence-pay",
        title: "Before you pay",
        eyebrow: "Lesson 1",
        description: "Check the amount and merchant before confirming.",
        body: [
          "Before paying, look at the amount, merchant, and what you are buying. A few seconds can prevent surprises.",
          "After paying, recent transactions help you remember where the money went.",
        ],
        visual: "card",
        slides: [
          {
            title: "Look at the screen",
            text: "Before you tap your card or phone at a store checkout, take a quick look at the merchant terminal screen. Make sure the total price matches what you expect to pay for that item. Those few seconds of attention can save you from a surprise, like being charged twice by mistake. A small check now prevents a big headache later, and it is one of the easiest smart habits to build.",
            points: [
              "Glance at the terminal before you tap.",
              "Check the total matches the price you expect.",
              "A few seconds of attention prevent big mistakes.",
            ],
          },
          {
            title: "Keep your receipt",
            text: "It is good practice to ask for a paper receipt or check the instant notification that pops up in your app right after you pay. This confirms exactly how much was taken from your account and where it went. If something ever looks wrong, the receipt is your proof to show a parent or the shop. Checking once takes almost no time at all, and it can save you a lot of confusion later.",
            points: [
              "Ask for a receipt or check the app notification.",
              "It confirms the exact amount that was taken.",
              "Keep receipts as proof if anything looks wrong.",
            ],
          },
          {
            title: "Track your history",
            text: "Your transaction history lists every card payment you make, along with the date and the shop name. Glancing through it once a week helps you see exactly where your pocket money has been going. You might spot small patterns, like lots of snacks, that quietly add up to a lot more than you realised. Knowing your habits is the very first step toward managing them and keeping more of your money.",
            points: [
              "History lists every payment with date and shop.",
              "A weekly glance reveals spending patterns.",
              "Spotting small habits helps you keep more money.",
            ],
          }
        ],
        quiz: [
          {
            question: "What should you do before tapping your card at checkout?",
            options: [
              "Check the price displayed on the terminal screen.",
              "Tuck the card away quickly.",
              "Tell the cashier your balance."
            ],
            correctIndex: 0
          },
          {
            question: "How does transaction history help you?",
            options: [
              "It increases your saving balance.",
              "It shows exactly where and when you spent money.",
              "It prints paper money."
            ],
            correctIndex: 1
          }
        ]
      },
      {
        id: "card-confidence-freeze",
        title: "Freeze if unsure",
        eyebrow: "Lesson 2",
        description: "Freezing is a fast safety action.",
        body: [
          "If you cannot find your card or something looks strange, freezing it helps protect your money.",
          "You can unfreeze it later when everything is okay again.",
        ],
        visual: "safety",
        slides: [
          {
            title: "Lost card? Don't panic",
            text: "If you cannot find your debit card anywhere, do not worry and do not panic. You can temporarily lock it straight away using the \"Freeze\" feature inside your banking app. Freezing only takes a few taps and instantly stops anyone else from using the card to spend your money. Once you find it again, unlocking it is just as quick and easy, so there is never any reason to panic.",
            points: [
              "Do not panic if your card goes missing.",
              "Use \"Freeze\" in the app to lock it instantly.",
              "Unlocking is just as quick once you find it.",
            ],
          },
          {
            title: "How it works",
            text: "Freezing blocks every kind of payment on the card, both in shops and online. So even if someone picks up your card off the floor, they will not be able to spend a single HUF from your account. Your money stays exactly where it belongs, safe and untouched by anyone else. It is one of the strongest shields you have, and it works anywhere in the world the moment you tap it.",
            points: [
              "Freezing blocks both in-store and online payments.",
              "Nobody can spend a single HUF from your card.",
              "It is one of the strongest shields you have.",
            ],
          },
          {
            title: "Unfreeze in seconds",
            text: "Imagine you finally spot your card hiding under your gym bag a little while later. No problem at all, just toggle \"Unfreeze\" in the app and the card becomes active again right away. There is no waiting, no forms, and no need to order a new one. Your card is ready to use the moment you need it, which is exactly why freezing is so stress-free and convenient.",
            points: [
              "Toggle \"Unfreeze\" in the app to reactivate.",
              "No waiting, forms, or new card needed.",
              "Your card works again the moment you need it.",
            ],
          }
        ],
        quiz: [
          {
            question: "What happens when you \"Freeze\" your card?",
            options: [
              "The card is deleted forever.",
              "All transactions on the card are blocked until you unfreeze it.",
              "Your phone screen locks."
            ],
            correctIndex: 1
          },
          {
            question: "What should you do if you find your frozen card under your desk?",
            options: [
              "Unfreeze it in the app and continue using it.",
              "Throw it in the bin.",
              "Order a new card immediately."
            ],
            correctIndex: 0
          }
        ]
      },
      {
        id: "card-confidence-details",
        title: "Card details are private",
        eyebrow: "Lesson 3",
        description: "Only reveal details when you really need them.",
        body: [
          "Card number, expiry date, and CVV should be treated carefully. Do not share screenshots or read them out loud in public.",
          "If you copy details, make sure you know exactly where they are going.",
        ],
        visual: "card",
        slides: [
          {
            title: "Private numbers",
            text: "Your debit card holds three important pieces of information: the long 16-digit card number on the front, the expiry date, and the 3-digit CVV code printed on the back. Together, these numbers let you pay online, which is exactly why they must stay private and protected. Anyone who learns all of them could spend your money without permission. Treat them like a secret password that only you should ever know.",
            points: [
              "Your card number, expiry, and CVV are private.",
              "Together they let you pay online.",
              "Anyone with all three could spend your money.",
            ],
          },
          {
            title: "No card selfies",
            text: "Never send pictures of your card in chat apps, even if a friend promises they only want to send you some money. To transfer money to your account, all anyone ever needs is your IBAN, never your card number or CVV. Sharing card photos is one of the easiest ways to get money stolen from your account. Keep the card face for your eyes only, and politely say no to anyone who asks.",
            points: [
              "Never send card photos in any chat app.",
              "Money transfers only ever need your IBAN.",
              "Card photos are an easy way to get robbed.",
            ],
          },
          {
            title: "Online shopping safety",
            text: "If you want to buy something online, always ask a parent to check that the website is safe before you type in your private card numbers. Some fake shops exist only to steal card details from unsuspecting shoppers who trust them too quickly. A trusted adult can spot warning signs you might miss on your own. Better to check first than to lose your money to a fake shop.",
            points: [
              "Ask a parent to check a website before paying.",
              "Some fake shops exist only to steal card details.",
              "Checking first is far better than losing money.",
            ],
          }
        ],
        quiz: [
          {
            question: "What is the 3-digit code on the back of your card?",
            options: [
              "The PIN code.",
              "The CVV security code.",
              "Your birth date."
            ],
            correctIndex: 1
          },
          {
            question: "What details are needed for someone to send money directly to your account?",
            options: [
              "Your card number and CVV code.",
              "Only your IBAN or account number.",
              "Your online banking password."
            ],
            correctIndex: 1
          }
        ]
      },
      {
        id: "card-confidence-lost",
        title: "If your card goes missing",
        eyebrow: "Lesson 4",
        description: "Freeze first, then tell a parent right away.",
        body: [
          "If you cannot find your card, do not panic. Freezing it in the app stops anyone from using it, even if they find it.",
          "After freezing, tell a parent or guardian immediately so they can help you look or order a replacement.",
        ],
        visual: "card",
        slides: [
          {
            title: "Freeze first",
            text: "The moment you realize your card is missing, the very first thing to do is open the app and freeze it. Freezing takes just a couple of taps and it instantly blocks anyone from spending your money, even if they have already found the card. It is like putting a strong padlock on your account until you figure out what happened. Fast freezing is the single most important move, and it can save you a lot of worry.",
            points: [
              "Freeze your card the moment it goes missing.",
              "Freezing blocks anyone from spending your money.",
              "It works like a padlock until you sort things out.",
            ],
          },
          {
            title: "Tell a grown-up",
            text: "Right after freezing the card, go and tell a parent or another trusted grown-up what happened. Do not feel embarrassed, even adults lose their cards sometimes, and it is nothing to be ashamed of. Together you can retrace your steps, check pockets and bags, and decide whether the card is truly lost or just hiding. A calm grown-up can also contact the bank if a replacement card is needed.",
            points: [
              "Tell a parent right after freezing, no embarrassment.",
              "Together retrace your steps and search bags.",
              "A grown-up can contact the bank for a replacement.",
            ],
          },
          {
            title: "Found it again",
            text: "If you find the card after all, maybe it slipped behind a cushion, you can simply unfreeze it in the app and it works again straight away. That is the beauty of freezing, it is reversible and safe. If the card really is gone for good, the bank can issue a brand new one with fresh numbers. Either way, acting fast and staying calm means your money stays protected the whole time.",
            points: [
              "Found the card? Unfreeze it in the app.",
              "Freezing is reversible and completely safe.",
              "If truly lost, the bank can issue a new card.",
            ],
          },
        ],
        quiz: [
          {
            question: "What is the first thing to do if your card is missing?",
            options: [
              "Wait a week and see if it turns up.",
              "Freeze it in the app right away.",
              "Buy something to test if it still works.",
            ],
            correctIndex: 1,
          },
          {
            question: "After freezing a missing card, what should you do next?",
            options: [
              "Tell a parent or trusted grown-up.",
              "Keep it a secret from everyone.",
              "Throw your phone away.",
            ],
            correctIndex: 0,
          },
        ],
      },
    ],
  },
  {
    id: "smart-budgeting",
    moduleId: "learn-balance",
    title: "Smart Budgeting",
    subtitle: "Learn how to divide your money into categories.",
    helper: "Allocate your funds systematically to cover needs, wants, and savings.",
    visual: "balance",
    lessons: [
      {
        id: "budgeting-categories",
        title: "Categorize it",
        eyebrow: "Lesson 1",
        description: "A budget is simply a plan for your money.",
        body: [],
        visual: "balance",
        slides: [
          {
            title: "Welcome to budgeting!",
            text: "A budget is simply a plan for your money, nothing scary or complicated at all. Instead of keeping all your cash in one big pile, you divide it into different boxes, each with its own job. Some boxes are for things you need, some are for fun, and some are for the future. A good budget means your money always knows where to go, and you always know where it went.",
            points: [
              "A budget is just a plan for your money.",
              "Divide cash into boxes for needs, fun, and future.",
              "A good budget means money always has a job.",
            ],
          },
          {
            title: "The 50-30-20 rule",
            text: "A helpful guide is the 50-30-20 rule. Roughly 50% goes to Needs like school supplies and transport, 30% to Wants like games and snacks, and 20% straight into Savings for your bigger goals. The numbers do not have to be perfect, they are just a friendly target to aim for each week. Following even roughly makes your money stretch much further and helps your savings grow without any stress.",
            points: [
              "Roughly 50% for Needs, 30% for Wants, 20% Savings.",
              "Numbers need not be perfect, just a friendly target.",
              "Following it roughly makes money stretch further.",
            ],
          },
          {
            title: "Why it helps",
            text: "Categorizing helps you see clearly where your money is actually going each week. For example, if you spend too much on games, your snack box ends up empty before the week is over. Spotting that pattern lets you rebalance before you run out of money completely. Awareness is the secret ingredient behind every smart budget, and it gives you the power to fix small problems early.",
            points: [
              "Categories show exactly where money goes.",
              "Too much in one box empties another too fast.",
              "Awareness lets you rebalance before you run out.",
            ],
          },
        ],
        quiz: [
          {
            question: "What is a budget?",
            options: [
              "A plan for how to divide and spend your money.",
              "A list of games you want to buy.",
              "A way to get free items from stores.",
            ],
            correctIndex: 0,
          },
          {
            question: "Under the 50-30-20 rule, what is 20% reserved for?",
            options: [
              "Fun and games.",
              "Essential school needs.",
              "Savings and goals.",
            ],
            correctIndex: 2,
          },
        ],
      },
      {
        id: "budgeting-tracking",
        title: "Track your cash",
        eyebrow: "Lesson 2",
        description: "Monitoring and checking every expense you make.",
        body: [],
        visual: "card",
        slides: [
          {
            title: "The tracking habit",
            text: "Tracking means writing down or checking every transaction you make, big or small. If you do not track, your money tends to quietly \"disappear\" without you noticing where it went. Even a quick weekly glance keeps you in control of your spending and your goals. You cannot manage what you never measure, and tracking is the simple habit that turns chaos into clarity.",
            points: [
              "Track every transaction, big or small.",
              "Untracked money tends to quietly disappear.",
              "You cannot manage what you never measure.",
            ],
          },
          {
            title: "Look at history",
            text: "Take a look at your app history every few days and notice the patterns. Do you see a long list of small transactions, like snacks or little in-game purchases? Those tiny amounts can quietly add up to a surprisingly big total over a month. Spotting them early helps you decide what is worth keeping and what to cut back, before they quietly drain your whole allowance.",
            points: [
              "Check your app history every few days.",
              "Small purchases can add up to a big monthly total.",
              "Spotting them early helps you cut back wisely.",
            ],
          },
          {
            title: "Habits lead to wealth",
            text: "Keep a little spending diary, or let the app sort your purchases into categories for you automatically. Either way, knowing your own habits is the very first step toward building real wealth over time. People who understand their spending almost always make better money choices throughout their lives. It all starts with paying attention, one small habit at a time.",
            points: [
              "Keep a spending diary or use app categories.",
              "Knowing your habits is the first step to wealth.",
              "Attentive spenders make better money choices.",
            ],
          },
        ],
        quiz: [
          {
            question: "What does tracking your cash mean?",
            options: [
              "Running after dropped coins.",
              "Monitoring and checking every expense you make.",
              "Asking your parents for money.",
            ],
            correctIndex: 1,
          },
          {
            question: "Why do small expenses matter?",
            options: [
              "They don't matter at all.",
              "They add up to a large sum over time.",
              "They are always free.",
            ],
            correctIndex: 1,
          },
        ],
      },
      {
        id: "budgeting-adjust",
        title: "Adjust the plan",
        eyebrow: "Lesson 3",
        description: "Plans change, and that is okay!",
        body: [],
        visual: "goals",
        slides: [
          {
            title: "Be flexible",
            text: "Plans change, and that is completely okay. If you spent more than expected on a birthday gift this month, you can simply spend a little less on snacks next week to balance it out. A budget bends with real life, it does not have to snap under pressure. Adjusting on the fly is a clear sign that you are paying attention to your money, not failing at all.",
            points: [
              "Plans change, and that is completely okay.",
              "Spend less next week to balance an overspend.",
              "Adjusting on the fly shows you are paying attention.",
            ],
          },
          {
            title: "Making trade-offs",
            text: "Adjusting a budget is really about making trade-offs. If you decide you want a more expensive game, then you naturally need to spend a bit less on things like cinema tickets or snacks that week. You cannot buy absolutely everything, so you choose what matters most to you. Trade-offs are how you get what you really want most, instead of a little bit of nothing.",
            points: [
              "Budgeting is really about making trade-offs.",
              "More on games means less on snacks that week.",
              "Choose what matters most instead of a bit of everything.",
            ],
          },
          {
            title: "You're in control",
            text: "A budget is not a prison that traps you, it is a tool that puts you in control of your own money. When life shifts, you can reshape the plan to fit your new needs and goals. Choosing to adjust it shows mature, grown-up financial thinking that will serve you for life. You are the boss, and the budget simply works for you, never the other way around.",
            points: [
              "A budget is a tool, not a prison.",
              "Reshape the plan whenever life shifts.",
              "You are the boss, the budget works for you.",
            ],
          },
        ],
        quiz: [
          {
            question: "What is a financial trade-off?",
            options: [
              "Exchanging old toys for new ones.",
              "Choosing to spend less on one thing to save for another.",
              "Getting money from the bank.",
            ],
            correctIndex: 1,
          },
          {
            question: "Is a budget fixed forever?",
            options: [
              "No, you can adjust it when your plans change.",
              "Yes, it can never be altered.",
              "Yes, only parents can change it.",
            ],
            correctIndex: 0,
          },
        ],
      },
      {
        id: "budgeting-savings",
        title: "Pay yourself first",
        eyebrow: "Lesson 4",
        description: "Save a little before you start spending.",
        body: [
          "A clever trick is to move a small amount into savings the moment you receive money, before you spend anything at all.",
          "This habit makes sure your future goals always get a share, instead of getting whatever is left over.",
        ],
        visual: "balance",
        slides: [
          {
            title: "Save before you spend",
            text: "Most people do it backwards, they spend first and save whatever is left, which often turns out to be nothing at all. A smarter way is to pay yourself first. The moment your 5,000 HUF allowance arrives, move 500 HUF straight into a saving goal, then feel free to use the remaining 4,500 HUF for the week. Because the saving happens first, it never gets forgotten or squeezed out.",
            points: [
              "Save a little first, then spend the rest.",
              "Move 500 HUF aside the moment allowance arrives.",
              "Saving first means it never gets forgotten.",
            ],
          },
          {
            title: "Small and steady",
            text: "The amount you pay yourself first does not need to be huge. Even 10% of your money, so 500 HUF out of 5,000 HUF, builds up into something meaningful over time. The magic is in doing it every single time without fail, rather than in the size of the amount. Steady small savings quietly grow into thousands of forints, and you barely notice they are gone from your spending money.",
            points: [
              "Even 10% of your money is enough to start.",
              "500 HUF from 5,000 HUF builds up over time.",
              "The habit matters far more than the size.",
            ],
          },
          {
            title: "Future you says thanks",
            text: "Paying yourself first is really a kindness to the future version of you. That saved money will one day pay for a bike, a game, or a special trip you have been dreaming about. When future you reaches the goal, you will be so grateful that past you had the discipline to save first. It feels like receiving a surprise gift from yourself, except you planned it all along.",
            points: [
              "Saving first is a kindness to future you.",
              "That money funds bikes, games, and special trips.",
              "Reaching the goal feels like a gift from yourself.",
            ],
          },
        ],
        quiz: [
          {
            question: "What does \"pay yourself first\" mean?",
            options: [
              "Spend everything and save whatever is left.",
              "Move a little into savings before you spend anything.",
              "Pay yourself with a treat every day.",
            ],
            correctIndex: 1,
          },
          {
            question: "Out of a 5,000 HUF allowance, what is about 10% for savings?",
            options: [
              "500 HUF",
              "5,000 HUF",
              "50 HUF",
            ],
            correctIndex: 0,
          },
        ],
      },
      {
        id: "budgeting-surprises",
        title: "Plan for surprises",
        eyebrow: "Lesson 5",
        description: "Keep a little aside for things you did not expect.",
        body: [
          "Sometimes an unexpected cost pops up, like a friend's birthday gift or a replacement charger. A small surprise fund helps you handle it calmly.",
          "Even setting aside 200 to 300 HUF a week builds a cushion for these moments.",
        ],
        visual: "goals",
        slides: [
          {
            title: "Unexpected costs",
            text: "Life is full of little surprises, and not all of them are fun. A friend's birthday suddenly comes up, your earphones break, or a school trip costs a bit more than expected. These surprise costs can wreck a budget if you are not ready for them. A small emergency pot means you can handle these moments without stress, instead of scrambling to find money at the last second.",
            points: [
              "Surprises like birthdays can wreck a tight budget.",
              "Not all surprises are fun or planned.",
              "A small pot helps you handle them without stress.",
            ],
          },
          {
            title: "Build a cushion",
            text: "You do not need a huge amount to be prepared. Setting aside just 200 or 300 HUF a week into a surprise fund builds a comfortable cushion over a few months. Think of it as a soft pillow for your money, something that catches you when an unexpected cost appears. Having that cushion means a broken charger does not have to ruin your whole week's plan.",
            points: [
              "200 to 300 HUF a week builds a real cushion.",
              "Think of it as a soft pillow for your money.",
              "A cushion stops surprises from ruining your week.",
            ],
          },
          {
            title: "Refill after using",
            text: "When you do dip into your surprise fund, make a plan to refill it as soon as you can. If you spent 2,000 HUF on a birthday gift, add a little extra back over the next few weeks until the cushion is full again. This keeps your safety net ready for the next surprise, whenever it arrives. A refill habit means you are never caught completely off guard.",
            points: [
              "Refill the fund after you use some of it.",
              "Add a little extra back over the next few weeks.",
              "A refill habit keeps your safety net ready always.",
            ],
          },
        ],
        quiz: [
          {
            question: "What is a \"surprise fund\" for?",
            options: [
              "Buying surprise gifts for yourself.",
              "Covering unexpected costs like birthdays or repairs.",
              "Hiding money from your parents.",
            ],
            correctIndex: 1,
          },
          {
            question: "What should you do after using some of your surprise fund?",
            options: [
              "Forget about it forever.",
              "Refill it gradually over the next few weeks.",
              "Empty the rest of it immediately.",
            ],
            correctIndex: 1,
          },
        ],
      },
    ],
  },
  {
    id: "earning-money",
    moduleId: "learn-goals",
    title: "Earning and Chores",
    subtitle: "How money is earned and how to manage rewards.",
    helper: "Explore how work leads to earning and how to take initiative.",
    visual: "goals",
    lessons: [
      {
        id: "earning-work",
        title: "Value of work",
        eyebrow: "Lesson 1",
        description: "Understanding where money comes from.",
        body: [],
        visual: "request",
        slides: [
          {
            title: "Exchange of value",
            text: "Money does not grow on trees, it comes from work. Adults exchange their time, their skills, and their effort for a salary they can use to live. The same idea works on a smaller scale whenever you earn a little money yourself, whether from chores or small jobs. Every HUF you receive stands for real work someone chose to do, and that is what gives money its value.",
            points: [
              "Money comes from work, not from trees.",
              "Adults trade time, skills, and effort for salary.",
              "Every HUF stands for real work someone did.",
            ],
          },
          {
            title: "Parents' effort",
            text: "Understanding where money comes from helps you appreciate the pocket money you receive. Each HUF in your allowance really represents your parents' hard work and the hours they spent earning it. That is why it deserves to be treated with care, respect, and a little gratitude. Gratitude turns pocket money from a number into something truly meaningful, and it changes how you spend.",
            points: [
              "Each HUF of allowance reflects parents' hard work.",
              "Their hours of effort earned the money you receive.",
              "Gratitude turns pocket money into something meaningful.",
            ],
          },
          {
            title: "Spending time",
            text: "When you buy something, you are really spending the hours of work it took to earn that money in the first place. A 2,000 HUF game might have cost you several weeks of patiently saving small amounts. Thinking about that exchange helps you decide whether a purchase is truly worth the time behind it. Money and time are two sides of the same coin, and wise spenders always remember that.",
            points: [
              "Spending money really means spending work hours.",
              "A 2,000 HUF game may be weeks of saving.",
              "Wise spenders weigh the time behind each purchase.",
            ],
          },
        ],
        quiz: [
          {
            question: "Where does money come from?",
            options: [
              "Trees in the bank garden.",
              "Exchange of time, skills, and work.",
              "The ATM screen.",
            ],
            correctIndex: 1,
          },
          {
            question: "What does your pocket money represent?",
            options: [
              "Free cash that has no value.",
              "Your parents' hard work and time.",
              "A bank loan.",
            ],
            correctIndex: 1,
          },
        ],
      },
      {
        id: "earning-rewards",
        title: "Chores and rewards",
        eyebrow: "Lesson 2",
        description: "Doing tasks responsibly builds a strong work ethic.",
        body: [],
        visual: "balance",
        slides: [
          {
            title: "Helping out",
            text: "Many families use chores as a way for kids to earn a little extra money of their own. Chores are simply the everyday tasks that help a whole household run smoothly, from washing up to walking the dog. Doing them well shows you can be counted on, day after day. Plus, you get the proud feeling of earning your own HUF instead of always asking for it.",
            points: [
              "Chores let kids earn a little extra money.",
              "They are tasks that keep a household running.",
              "Doing them well shows you can be counted on.",
            ],
          },
          {
            title: "Duty vs. Extra",
            text: "Basic chores, like tidying your own room, are just part of being a helpful member of the family and are not usually paid. Special chores, such as washing the car or cleaning the windows, can earn you a reward because they go beyond the everyday basics. Knowing the difference keeps things fair for everyone in the household. Extra effort is exactly what unlocks extra pay, and that is a fair deal.",
            points: [
              "Basic chores like tidying are unpaid family duties.",
              "Special chores beyond the basics can earn rewards.",
              "Extra effort is what unlocks extra pay.",
            ],
          },
          {
            title: "Strong work ethic",
            text: "Doing your tasks responsibly, without being reminded, is how you build a strong work ethic. It teaches you the simple truth that real effort leads directly to real reward, again and again. That lesson stays useful for your whole life, far beyond pocket money and childhood. People who learn it early have a huge head start, both in money and in everything else they try.",
            points: [
              "Do tasks responsibly without being reminded.",
              "Effort leads to reward, again and again.",
              "Early learners get a huge head start in life.",
            ],
          },
        ],
        quiz: [
          {
            question: "Which chore is usually a basic family duty (unpaid)?",
            options: [
              "Washing your parent's car.",
              "Cleaning your own bedroom.",
              "Painting the garden fence.",
            ],
            correctIndex: 1,
          },
          {
            question: "What does earning money from chores teach you?",
            options: [
              "That effort leads to reward.",
              "That you should be paid for sleeping.",
              "That work is always easy.",
            ],
            correctIndex: 0,
          },
        ],
      },
      {
        id: "earning-hustle",
        title: "Side hustles",
        eyebrow: "Lesson 3",
        description: "A small business you start by yourself.",
        body: [],
        visual: "goals",
        slides: [
          {
            title: "Your small business",
            text: "A side hustle is just a small business you start by yourself. It is a fun and creative way to earn a little money using the talents you already have. Maybe you make friendship bracelets, bake cookies, or help a neighbour with their phone. The best part is being the boss of your very own idea, deciding what to make, what to charge, and how to grow.",
            points: [
              "A side hustle is a small business you start yourself.",
              "It uses talents you already have, like crafts or baking.",
              "You are the boss of your own idea.",
            ],
          },
          {
            title: "Using your talents",
            text: "Think about what you genuinely enjoy and are good at. If you love drawing, you could design and print custom stickers for friends. If you are a maths star, you might help a younger student with their homework for a small fee. Your skills already have real value, you just need to share them with people who need them. Talents turn into income the moment you confidently offer them to others.",
            points: [
              "Pick something you genuinely enjoy and do well.",
              "Drawing, maths, baking, all skills can earn.",
              "Talents become income when you offer them.",
            ],
          },
          {
            title: "Safety first",
            text: "Always check with your parents before you start any side hustle, even a small one. They can help you make sure your idea is safe, fair, and does not get in the way of school or homework. Your safety and your education always come first, before any extra money you might earn. With their guidance and approval, your small business can really grow in a healthy, balanced way.",
            points: [
              "Always ask parents before starting any side hustle.",
              "Make sure the idea is safe and fair.",
              "Safety and school always come before extra money.",
            ],
          },
        ],
        quiz: [
          {
            question: "What is a side hustle?",
            options: [
              "A school sport event.",
              "A small business you start to earn money using your skills.",
              "Asking parents for a raise.",
            ],
            correctIndex: 1,
          },
          {
            question: "What should you do before starting a small business?",
            options: [
              "Buy expensive equipment immediately.",
              "Check with your parents for safety and approval.",
              "Quit school.",
            ],
            correctIndex: 1,
          },
        ],
      },
      {
        id: "earning-save-rewards",
        title: "Save your rewards",
        eyebrow: "Lesson 4",
        description: "What you earn can grow if you save some of it.",
        body: [
          "Earning money feels great, but the real magic happens when you save part of what you earn instead of spending it all.",
          "A simple rule is to split your rewards, some to spend now and some to save for later.",
        ],
        visual: "balance",
        slides: [
          {
            title: "Don't spend it all",
            text: "When you earn 1,500 HUF for finishing your homework or 800 HUF for loading the dishwasher, the temptation is to spend it all right away on treats. But the smartest kids save a portion of every single reward. Imagine spending 1,000 HUF and putting 500 HUF into a saving goal each time. Over a few weeks, those small saved amounts quietly grow into something exciting, like a new game or a fun day out.",
            points: [
              "Avoid the urge to spend every reward at once.",
              "Save a portion of each reward, big or small.",
              "Small saved amounts quietly grow into something big.",
            ],
          },
          {
            title: "The split rule",
            text: "A popular trick is the split rule, dividing your reward into two pots. For example, you could put 70% into spending and 30% into saving. So out of 1,000 HUF, you get 700 HUF to enjoy now and 300 HUF saved for later. The exact split does not matter as much as simply having a split. Doing this every single time builds a saving habit that lasts a whole lifetime.",
            points: [
              "Split each reward into spending and saving pots.",
              "Maybe 70% to spend now, 30% saved for later.",
              "Having any split builds a lifelong saving habit.",
            ],
          },
          {
            title: "Watch it grow",
            text: "There is something deeply satisfying about watching your saved rewards add up over the weeks. Each chore, each reward, each saved portion pushes your total a little higher, until one day you have enough for something you really wanted. Saving your earnings turns ordinary chores into real progress toward your dreams. That feeling of paying for a big goal with money you earned yourself is unbeatable.",
            points: [
              "Saved rewards add up week by week.",
              "Chores turn into real progress toward dreams.",
              "Earning your own goal money feels unbeatable.",
            ],
          },
        ],
        quiz: [
          {
            question: "What is a smart thing to do when you earn a reward?",
            options: [
              "Spend all of it immediately on snacks.",
              "Save a portion and spend the rest.",
              "Hide it and forget about it.",
            ],
            correctIndex: 1,
          },
          {
            question: "What is the \"split rule\"?",
            options: [
              "Dividing your reward into spending and saving pots.",
              "Splitting a snack with a friend.",
              "Cutting your chores in half.",
            ],
            correctIndex: 0,
          },
        ],
      },
      {
        id: "earning-grow",
        title: "Grow your skills",
        eyebrow: "Lesson 5",
        description: "Better skills can earn bigger rewards over time.",
        body: [
          "As you practice a skill, you get better at it, and better skills often lead to bigger or more interesting rewards.",
          "Trying new tasks and asking to learn new things helps you grow both your skills and your confidence.",
        ],
        visual: "goals",
        slides: [
          {
            title: "Practice makes better",
            text: "Nobody is brilliant at something on the very first try. Whether it is washing the car, helping in the garden, or organizing a bookshelf, every time you do a task you get a little better at it. As your skills grow, you can take on trickier tasks that are worth more reward. The path from a 200 HUF task to a 1,500 HUF task is built from lots of practice and patience.",
            points: [
              "Every task you try makes you a little better.",
              "Better skills unlock trickier, better-paid tasks.",
              "Practice turns 200 HUF tasks into 1,500 HUF ones.",
            ],
          },
          {
            title: "Try new things",
            text: "Sticking only to tasks you already know is comfortable, but it limits how much you can grow. Volunteering for a new chore, like learning to cook a simple meal or helping walk a neighbour's dog, teaches you fresh skills you did not have before. Each new skill is like a tool in your money-earning toolbox, ready to use whenever a chance comes up. Curiosity is a real superpower for earning.",
            points: [
              "New chores teach you fresh, useful skills.",
              "Each new skill is a tool in your earning toolbox.",
              "Curiosity is a real superpower for earning.",
            ],
          },
          {
            title: "Ask to learn",
            text: "If you want to learn a new task, just ask a parent to show you how. Most grown-ups are delighted to teach a willing learner, especially when you offer to help out. Learning from someone experienced is the fastest way to pick up a skill safely and well. Before long, you will be doing the task on your own, and earning rewards for something you genuinely enjoy doing.",
            points: [
              "Ask a parent to teach you a new task.",
              "Grown-ups love teaching a willing learner.",
              "Soon you do it alone and earn while enjoying it.",
            ],
          },
        ],
        quiz: [
          {
            question: "How does practicing a task help you earn more?",
            options: [
              "It does not change anything.",
              "Better skills can unlock bigger, better-paid tasks.",
              "It makes the task take longer.",
            ],
            correctIndex: 1,
          },
          {
            question: "What is a good way to learn a brand new skill?",
            options: [
              "Ask a parent to show you how.",
              "Never try anything new.",
              "Only do tasks you already know.",
            ],
            correctIndex: 0,
          },
        ],
      },
      {
        id: "earning-generosity",
        title: "Earning to give",
        eyebrow: "Lesson 6",
        description: "Some of what you earn can help others too.",
        body: [
          "Earning money is not only about buying things for yourself. A small part can be shared to help people or causes you care about.",
          "Giving even a little from your own earnings feels special, because it is truly yours to share.",
        ],
        visual: "request",
        slides: [
          {
            title: "Sharing your earnings",
            text: "When you earn your own money, you get to decide exactly how to use it, and one powerful choice is to share a little with others. Maybe you donate 200 HUF from your chore rewards to an animal shelter, or chip in toward a family member's birthday present. Giving from money you earned yourself feels far more meaningful than giving money you were simply handed. It turns your effort into kindness.",
            points: [
              "Earning gives you the power to choose to share.",
              "Donate 200 HUF from chores to a cause you love.",
              "Giving your own earnings feels truly meaningful.",
            ],
          },
          {
            title: "Small gifts count",
            text: "You do not need to give huge amounts to make a difference. Even small gifts, like 100 HUF toward a class charity collection or helping buy a small treat for a sibling, add up when lots of people join in. What matters is the thought and the habit of caring about others, not the size of the amount. Generous kids grow into generous adults, and that benefits everyone around them.",
            points: [
              "Small gifts still make a real difference.",
              "Even 100 HUF helps when lots of people join in.",
              "The habit of caring matters more than the size.",
            ],
          },
          {
            title: "Pick a cause you love",
            text: "Giving feels best when it goes to something you genuinely care about. Maybe you love animals, so you pick a pet shelter, or you care about trees, so you support a planting project. Talk with your family about causes that match your interests, and decide together how a little of your earnings could help. Giving with purpose makes the kindness feel twice as rewarding.",
            points: [
              "Give to a cause that matches your interests.",
              "Talk with family about where your money could help.",
              "Giving with purpose feels twice as rewarding.",
            ],
          },
        ],
        quiz: [
          {
            question: "Why does giving from your own earnings feel special?",
            options: [
              "Because it is truly yours to share.",
              "Because the bank pays you extra.",
              "Because it is required by law.",
            ],
            correctIndex: 0,
          },
          {
            question: "How much do you need to give to make a difference?",
            options: [
              "Only huge amounts count.",
              "Even small gifts help, especially when many join in.",
              "You must give all of your money.",
            ],
            correctIndex: 1,
          },
        ],
      },
    ],
  },
  {
    id: "digital-security",
    moduleId: "learn-scam",
    title: "Digital Security",
    subtitle: "Safeguard your mobile banking app and accounts.",
    helper: "Protect passwords, app lock, and secure your network access.",
    visual: "safety",
    lessons: [
      {
        id: "security-biometric",
        title: "App lock & biometrics",
        eyebrow: "Lesson 1",
        description: "Your banking app is protected by passwords or Face ID.",
        body: [],
        visual: "card",
        slides: [
          {
            title: "App protection",
            text: "Your banking app is protected by a password or by biometric security, like Face ID or Touch ID. Biometrics simply means using a part of you, such as your face or fingerprint, to unlock something safely. It is much harder for anyone else to copy than a typed password they might guess or steal. This first lock keeps your money safe the very moment you open the app, before anyone else can peek.",
            points: [
              "Your app is locked by password or biometrics.",
              "Biometrics use your face or fingerprint to unlock.",
              "It is far harder for anyone else to copy.",
            ],
          },
          {
            title: "No sharing passcodes",
            text: "Never share your app passcode with friends, no matter how much you trust them. If someone else gets into your account, they could peek at your balance or even make transfers without your permission. A passcode is like a toothbrush, it is only ever meant for you and nobody else. Keeping it private is one of the easiest and most powerful ways to stay completely safe online.",
            points: [
              "Never share your app passcode with friends.",
              "Others could peek at balances or transfer money.",
              "A passcode is personal, like a toothbrush.",
            ],
          },
          {
            title: "Lost phone safety",
            text: "If you ever lose your phone, the biometric locks are there to save you. Even if a stranger finds your device, they cannot open your banking app without your face or fingerprint. That single layer of protection keeps your money safely out of the wrong hands until you recover or replace the phone. It is one more reason why setting up app lock is so important, even on a busy day.",
            points: [
              "Biometric locks protect you if the phone is lost.",
              "Strangers cannot open the app without your face.",
              "Setting up app lock is a smart safety move.",
            ],
          },
        ],
        quiz: [
          {
            question: "What is biometric security?",
            options: [
              "Locking your phone in a drawer.",
              "Using Face ID or Touch ID to protect your app.",
              "Changing your passcode every hour.",
            ],
            correctIndex: 1,
          },
          {
            question: "Who should you share your banking app passcode with?",
            options: [
              "Your best school friend.",
              "Nobody—it must remain private.",
              "A gaming partner.",
            ],
            correctIndex: 1,
          },
        ],
      },
      {
        id: "security-phishing",
        title: "Avoid phishing",
        eyebrow: "Lesson 2",
        description: "Fake messages sent by scammers to steal your passwords.",
        body: [],
        visual: "safety",
        slides: [
          {
            title: "Phishing traps",
            text: "Phishing is a sneaky trick where scammers send fake emails or messages pretending to be your bank. They hope you will tap a link and type in your password or card details on a website that looks real but is not. The message might even carry an official-looking logo to fool you into trusting it without thinking. The trap only works if you take the bait, so always slow down and look carefully.",
            points: [
              "Phishing uses fake messages pretending to be your bank.",
              "Fake links lead to websites that steal your details.",
              "Official logos do not mean a message is genuine.",
            ],
          },
          {
            title: "Fake verification",
            text: "A phishing message might say something scary like \"Your card is blocked! Tap here to verify your identity.\" The link leads to a fake website built only to steal your passwords and codes the moment you type them in. Real problems are never fixed by tapping a surprise link in a message. When in doubt, close the message and check with an adult you trust before doing anything.",
            points: [
              "Scary \"card blocked\" messages are usually fake.",
              "Fake sites steal details the moment you type them.",
              "Real problems are never fixed by surprise links.",
            ],
          },
          {
            title: "Real bank behavior",
            text: "Real banks never send you links asking for your passwords or PIN codes, not by email, not by text, not ever. If a message asks for any secret detail, you can be almost certain it is a scam trying to trick you. The safest move is to delete the message and tell a parent right away, before anything bad happens. Reporting it helps protect other people too, which is a kind thing to do.",
            points: [
              "Real banks never ask for passwords or PINs by message.",
              "Any request for secrets is almost certainly a scam.",
              "Delete the message and tell a parent right away.",
            ],
          },
        ],
        quiz: [
          {
            question: "What is phishing?",
            options: [
              "Catching fish in the river.",
              "Fake messages sent by scammers to steal your passwords.",
              "Changing your profile picture.",
            ],
            correctIndex: 1,
          },
          {
            question: "What will a real bank never send you?",
            options: [
              "Monthly account statements.",
              "Links asking you to type your password or PIN.",
              "Educational articles.",
            ],
            correctIndex: 1,
          },
        ],
      },
      {
        id: "security-wifi",
        title: "Public Wi-Fi risks",
        eyebrow: "Lesson 3",
        description: "Hackers can monitor the data sent over open networks.",
        body: [],
        visual: "safety",
        slides: [
          {
            title: "Open connection danger",
            text: "Public Wi-Fi in cafes or shopping malls is convenient, but it is usually not secure at all. That means hackers can sometimes watch the data travelling over those open networks, including passwords and card numbers you type. Free internet can quietly come with a hidden cost you never agreed to. It is fine for browsing the news, but risky for anything private or important.",
            points: [
              "Public Wi-Fi in cafes and malls is usually not secure.",
              "Hackers can watch data sent over open networks.",
              "Free internet can carry a hidden cost.",
            ],
          },
          {
            title: "No banking on public Wi-Fi",
            text: "Never log in to your banking app or type in card details while you are connected to public Wi-Fi. On an open network it is much easier for others to intercept your information without you ever noticing it happening. The few minutes you save are simply not worth the risk of losing real money. Wait until you reach a connection you genuinely trust before opening anything private.",
            points: [
              "Never open the banking app on public Wi-Fi.",
              "Open networks let others intercept your data.",
              "Wait for a trusted connection before logging in.",
            ],
          },
          {
            title: "Secure alternatives",
            text: "Whenever you need to use your banking app, wait until you are on your own secure home Wi-Fi or simply switch to your mobile data plan. Both are far safer than any public network you might find in a cafe or shop. A trusted connection is the quiet bodyguard that protects your financial vault from strangers. A little patience here saves a lot of worry later, every single time.",
            points: [
              "Use home Wi-Fi or mobile data for banking.",
              "Both are far safer than any public network.",
              "A trusted connection is your money's bodyguard.",
            ],
          },
        ],
        quiz: [
          {
            question: "Why is public Wi-Fi unsafe for banking?",
            options: [
              "The signal is too slow.",
              "Hackers can intercept data sent over open networks.",
              "It drains your battery.",
            ],
            correctIndex: 1,
          },
          {
            question: "What should you use instead of public Wi-Fi to open your bank app?",
            options: [
              "Any free public network.",
              "Mobile data or your secure home network.",
              "Your classmate's hotspot.",
            ],
            correctIndex: 1,
          },
        ],
      },
      {
        id: "security-updates",
        title: "Keep your app updated",
        eyebrow: "Lesson 4",
        description: "Updates fix weaknesses and keep your money safe.",
        body: [
          "App updates are not just about new features. They often fix security problems that hackers could otherwise use to get in.",
          "Updating your banking app, your phone, and turning on automatic updates is one of the easiest ways to stay protected.",
        ],
        visual: "safety",
        slides: [
          {
            title: "Why updates matter",
            text: "Every app on your phone, including your banking app, is built by people who constantly look for weaknesses a hacker might exploit. When they find a weakness, they send out an update that patches it, like a repair kit for a tiny hole. If you skip the update, that hole stays open and risky. Installing updates quickly is one of the simplest, most powerful ways to keep your money and details protected.",
            points: [
              "Updates patch weaknesses hackers might exploit.",
              "They work like a repair kit for a tiny hole.",
              "Skipping updates leaves the hole open and risky.",
            ],
          },
          {
            title: "Automatic is easier",
            text: "The best trick is to turn on automatic updates, so your apps update themselves overnight while your phone is charging. You never even have to remember, and you always wake up to the safest version of every app. Ask a parent to help you check that automatic updates are switched on for your banking app and your phone itself. Once it is set, you are protected with zero extra effort.",
            points: [
              "Automatic updates happen overnight while charging.",
              "You never have to remember to update anything.",
              "Ask a parent to check they are switched on.",
            ],
          },
          {
            title: "Beware of fake updates",
            text: "Real updates only ever come from the official app store, never from a popup, a text message, or a random link. Hackers sometimes send fake update warnings that are actually tricks to install something harmful on your phone. If a message says you must update right now by tapping a link, ignore it and check the app store yourself instead. Genuine updates never rush you or demand a tap on a strange link.",
            points: [
              "Real updates come only from the official app store.",
              "Fake update popups can be a hacker's trick.",
              "Check the store yourself, ignore rushed links.",
            ],
          },
        ],
        quiz: [
          {
            question: "What do app updates often do for your safety?",
            options: [
              "They fix security weaknesses that hackers could use.",
              "They make your phone slower.",
              "They delete your saved money.",
            ],
            correctIndex: 0,
          },
          {
            question: "Where should real app updates come from?",
            options: [
              "A random link in a text message.",
              "The official app store only.",
              "A popup that says \"update now\".",
            ],
            correctIndex: 1,
          },
        ],
      },
    ],
  },
  {
    id: "family-banking",
    moduleId: "learn-request",
    title: "Family Banking",
    subtitle: "How parents and kids work together on finance.",
    helper: "Discuss big purchases, build trust, and plan team savings goals.",
    visual: "request",
    lessons: [
      {
        id: "family-decisions",
        title: "Joint decisions",
        eyebrow: "Lesson 1",
        description: "Talking about big purchases together.",
        body: [],
        visual: "request",
        slides: [
          {
            title: "Team sport",
            text: "In a family, money is really a team sport. Talking about big purchases together prevents surprises and helps everyone plan ahead with confidence. When each person knows what is going on, there are fewer arguments and a lot more teamwork all round. Open conversation is the secret play that makes a whole household run smoothly, week after week.",
            points: [
              "Family money works best as a team sport.",
              "Talking together prevents surprises and arguments.",
              "Open conversation keeps the household running smoothly.",
            ],
          },
          {
            title: "Ask first",
            text: "If you want to buy something expensive, like a gaming console, discuss it with your parents before making any move. They can help you think it through and put together a realistic plan to save for it over time. Asking first shows real respect for the family budget and the effort behind it. It also turns a fuzzy wish into something you can actually reach, step by step, together.",
            points: [
              "Discuss big purchases with parents first.",
              "They can help you build a realistic saving plan.",
              "Asking first shows respect for the family budget.",
            ],
          },
          {
            title: "Building harmony",
            text: "Making big financial decisions together builds harmony at home and teaches you how real-world budgeting actually works in a household. You learn to listen, to compromise, and to think about other people's needs, not only your own. Those skills will help you for the rest of your life, in money and in friendships. A family that talks openly about money stays stronger together, year after year.",
            points: [
              "Joint money decisions build harmony at home.",
              "You learn to listen, compromise, and share needs.",
              "Open money talk keeps a family stronger together.",
            ],
          },
        ],
        quiz: [
          {
            question: "Why talk about big purchases with family?",
            options: [
              "To get their permission to spend their money.",
              "To prevent surprises and make a plan together.",
              "To make them feel bad.",
            ],
            correctIndex: 1,
          },
          {
            question: "Money management in a family works best as:",
            options: [
              "A team sport with open discussion.",
              "A competition to spend fastest.",
              "A secret game.",
            ],
            correctIndex: 0,
          },
        ],
      },
      {
        id: "family-trust",
        title: "Trust & honesty",
        eyebrow: "Lesson 2",
        description: "Financial trust is earned through honest actions.",
        body: [],
        visual: "balance",
        slides: [
          {
            title: "Earning trust",
            text: "Financial trust is earned slowly through honest, reliable actions over time. If you ever make a mistake, like spending more than you meant to, the best thing you can do is be honest about it right away. Owning up shows real maturity and responsibility, even when it feels awkward. Trust grows from telling the truth, not from being perfect, and every honest moment makes the next one easier.",
            points: [
              "Trust is earned slowly through honest actions.",
              "Admit mistakes right away instead of hiding them.",
              "Honesty matters more than being perfect.",
            ],
          },
          {
            title: "Honesty over secrecy",
            text: "Hiding expenses or lying about how much a game really cost will always break trust in the end. Broken trust is far harder to repair than a low balance, and it can take a very long time to earn back. Honesty keeps the door open for help, understanding, and second chances when you need them most. The truth is almost always less scary than the secret you were trying to keep.",
            points: [
              "Hiding costs always breaks trust in the end.",
              "Broken trust takes a long time to repair.",
              "Honesty keeps the door open for help.",
            ],
          },
          {
            title: "Gaining freedom",
            text: "When you are honest and dependable about money, your parents naturally feel more confident giving you extra freedom and responsibility. Trust unlocks bigger allowances, more choices, and a growing sense of independence as you get older. Each honest action is like a key that quietly opens the next door for you. Freedom follows reliability, every single time, without exception.",
            points: [
              "Honesty earns you more freedom and responsibility.",
              "Trust unlocks bigger allowances and more choices.",
              "Freedom always follows reliability.",
            ],
          },
        ],
        quiz: [
          {
            question: "What is the best action if you spend too much by mistake?",
            options: [
              "Hide the transaction history.",
              "Be honest and talk to a parent about it.",
              "Ask a friend to lie for you.",
            ],
            correctIndex: 1,
          },
          {
            question: "What does financial honesty build?",
            options: [
              "Extra pocket money instantly.",
              "Long-term trust and freedom.",
              "High interest rates.",
            ],
            correctIndex: 1,
          },
        ],
      },
      {
        id: "family-goals",
        title: "Shared savings goals",
        eyebrow: "Lesson 3",
        description: "Working together on shared targets.",
        body: [],
        visual: "goals",
        slides: [
          {
            title: "Team goals",
            text: "A shared goal is a saving target that you and your parents work on together, as a team. It might be something fun like a family holiday, or something useful like a new computer for school. Everyone chips in what they can, and the progress belongs to all of you equally. Shared goals turn ordinary saving into an exciting family adventure you get to enjoy side by side.",
            points: [
              "A shared goal is one the whole family saves for.",
              "It might be a holiday or a computer for school.",
              "Everyone chips in and the progress belongs to all.",
            ],
          },
          {
            title: "Milestone bonuses",
            text: "You can contribute part of your own savings to the shared goal, and your parents might match it or add a bonus whenever you reach a milestone. That means your effort actually goes further than it ever could on your own. Celebrating each little win together keeps everyone excited and motivated along the way. Milestones turn a big faraway goal into a series of small, achievable victories.",
            points: [
              "Add your own savings to the shared family goal.",
              "Parents may match or add milestone bonuses.",
              "Each little win keeps everyone motivated together.",
            ],
          },
          {
            title: "Team spirit",
            text: "Working together on a shared goal makes saving feel faster and a lot more fun. It also teaches you the warm joy of reaching a target as a team, celebrating side by side when you finally get there together. The lesson lasts long after the goal is reached: big things are easier when you are not alone. Team spirit turns ordinary effort into a happy memory you will cherish for years.",
            points: [
              "Shared goals make saving faster and more fun.",
              "Reaching a target together feels genuinely joyful.",
              "Big things are easier when you are not alone.",
            ],
          },
        ],
        quiz: [
          {
            question: "What is a shared saving goal?",
            options: [
              "A competition to see who saves more.",
              "A saving target that you and your parents work on together.",
              "Borrowing money from siblings.",
            ],
            correctIndex: 1,
          },
          {
            question: "How does a shared goal help you?",
            options: [
              "It makes saving faster and teaches teamwork.",
              "It lets you spend without limits.",
              "It deletes all your tasks.",
            ],
            correctIndex: 0,
          },
        ],
      },
    ],
  },
];

export function getHuLearnInitialCompletedLessonIds(modules: LearnModule[]) {
  return HU_LEARN_TOPICS.flatMap((topic) => {
    const module = modules.find((item) => item.id === topic.moduleId);
    const completedCount = module?.isCompleted
      ? topic.lessons.length
      : Math.max(0, Math.min(topic.lessons.length, Math.floor(((module?.progress ?? 0) / 100) * topic.lessons.length)));

    return topic.lessons.slice(0, completedCount).map((lesson) => lesson.id);
  });
}
