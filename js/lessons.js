// ScamProof Academy — curated lessons. Scam examples are real-world patterns
// used for recognition training only (standard public-interest content, cf. FTC/Action Fraud).
(function () {
  "use strict";

  window.SCAMPROOF_LESSONS = [
    {
      id: "prize",
      title: "Prizes & Windfalls",
      icon: "🎁",
      accent: "#C2410C",
      intro: "\"You've WON!\" — if you never entered, you can't win. Prize scams are the oldest trick in the book: they promise free money, then ask for a fee, your bank details, or your one-time codes.",
      goldenRule: "Golden rule: If you have to pay or share codes to receive a prize, it is not a prize.",
      flags: [
        { icon: "🎉", title: "You never entered", why: "Real competitions require entry. A win you never played for does not exist." },
        { icon: "💸", title: "A fee to release the prize", why: "“Admin fee”, “tax”, “delivery charge” — real prizes never cost the winner money first." },
        { icon: "🏦", title: "They ask for bank details", why: "To 'send your winnings' they need your account and card details — used later to steal from you." }
      ],
      quiz: [
        { text: "FREE ENTRY to our £5000 cash draw! You have been SELECTED as a winner. Text CLAIM to 88555. Std rate £1.50/msg", scam: true, why: "A win you never entered + premium-rate number (£1.50/msg). Classic prize scam.", flags: [0, 1] },
        { text: "Congratulations! Your email was selected in the MICROSOFT LOTTERY. You won £750,000. Send your name, address, phone & bank account to claim.", scam: true, why: "Microsoft runs no lottery. Asking for full bank details to 'release' money = scam.", flags: [0, 2] },
        { text: "You've won an iPhone 15! To receive your prize, pay the £1.99 postage fee at this link: bit.ly/win-iphone", scam: true, why: "Paying a fee to claim a prize, plus a shortened link that hides where it really goes.", flags: [1, 0] },
        { text: "Mum, could you text me Aunt Carol's address? Want to send her a birthday card this year. x", scam: false, why: "A normal, low-stakes family request. No money, no urgency, no links.", flags: [] },
        { text: "URGENT: Your £2,450 Tax Refund is pending. Confirm bank details within 24h or it expires forever. govuk-refunds.example.com", scam: true, why: "A 'refund you didn't claim' with a deadline and a fake government address — this family's pattern in a tax costume.", flags: [0, 1, 2] },
        { text: "Raffle results are up! Well done to everyone who took part on Saturday. We raised £410 for the school roof fund 🎉", scam: false, why: "A community raffle you could actually enter, with no ask for money or details.", flags: [] },
        { text: "Lucky winner #7! Your cruise tickets + £1,000 spending money are reserved. Call 0900 1234567 within 48 hours. Lines cost £2.50/min.", scam: true, why: "Expensive premium phone line (0900) + deadline pressure. The prize does not exist.", flags: [0, 1] }
      ]
    },
    {
      id: "authority",
      title: "Banks & Government",
      icon: "🏦",
      accent: "#1D4ED8",
      intro: "Scammers dress up as your bank, the tax office, the police or customs. The message looks official and scary: 'your account is locked', 'you owe a fine'. Fear makes people click first and think later.",
      goldenRule: "Golden rule: Real institutions never ask for codes, passwords or 'verification' by text or call. Hang up and call them back on the official number.",
      flags: [
        { icon: "🚨", title: "Fear + urgency", why: "“Your account will be closed in 24h”. Panic is the product — legitimate letters give you time." },
        { icon: "🔗", title: "A link to 'fix' the problem", why: "It leads to a pixel-perfect fake login page that steals your credentials." },
        { icon: "🔢", title: "They ask for codes or PINs", why: "No bank or agency EVER needs your one-time code. Whoever asks for it is the thief." }
      ],
      quiz: [
        { text: "ALERT: Unusual login detected on your account from London. If this was NOT you, secure your account now: secure-barclays-login.com", scam: true, why: "Looks official but the web address is not your bank's. The link leads to a credential-stealing fake.", flags: [1, 0] },
        { text: "Your account has been SUSPENDED due to suspicious activity. Verify your identity immediately by providing your card PIN and 6-digit app code.", scam: true, why: "A bank asking for PIN + one-time app code by text is impossible — that's the thief themselves.", flags: [2, 0] },
        { text: "HMRC: We have calculated you are owed £318.72. Submit a claim form within 48 hours: tax-refund-hmrc.example.co.uk", scam: true, why: "Tax offices send refunds you applied for — they never chase you by text with a deadline and a link.", flags: [0, 1] },
        { text: "Hello, this is Jane from Nationwide Mortgage team following up on your appointment request. We'll call you back tomorrow morning as arranged.", scam: false, why: "Follow-up you expected, no links, no codes, no pressure, and you can verify by calling the bank back.", flags: [] },
        { text: "POLICE NOTICE: An arrest warrant has been issued in your name for tax evasion. Pay the £5,000 fine via Bitcoin ATM within 6 hours to avoid arrest.", scam: true, why: "Police don't text warrants, and no government accepts Bitcoin ATMs. Pure fear + untraceable payment.", flags: [0] },
        { text: "Reminder from your GP surgery: flu vaccine appointment on Thursday 14:30 at Riverside Clinic. Reply CANCEL if you can't attend.", scam: false, why: "An appointment reminder you can act on calmly — no money, no codes, no link.", flags: [] },
        { text: "CUSTOMS: Your parcel is held. Pay the £2.99 customs fee to release delivery: parcel-fee.example.com", scam: true, why: "Tiny fee + link is the whole trick. Couriers collect duties in their official app, not by text.", flags: [0, 1] }
      ]
    },
    {
      id: "otp",
      title: "Codes & Passwords",
      icon: "🔢",
      accent: "#047857",
      intro: "One-time codes are the keys to your accounts. A whole scam family exists just to steal them: fake 'delivery failed' texts, 'your code arrived by mistake', or a caller who 'helpfully' reads the code back to you.",
      goldenRule: "Golden rule: A one-time code is like a house key. Never share it with anyone — not even someone who already knows your name.",
      flags: [
        { icon: "🤫", title: "Anyone asks for your code", why: "Bank staff, 'delivery drivers', even 'police' — real ones never need your code. Request = theft." },
        { icon: "📱", title: "A code you didn't request", why: "“Someone is trying to access your account — code 4482” means someone IS trying. Don't help them." },
        { icon: "🔁", title: "They move you to another app", why: "WhatsApp/Telegram 'support' asks you to forward the code — it's your own account being hijacked." }
      ],
      quiz: [
        { text: "Your WhatsApp code is 471-902. Don't share this code with others. Someone else tried to register your number?", scam: false, why: "This is the REAL format of a genuine code notification — but its presence means someone is registering YOUR number. The lesson: never forward it.", flags: [] },
        { text: "Hi, I'm from delivery support. We sent a code to your phone by mistake — please text it back so we can complete your parcel registration.", scam: true, why: "No company needs your code. 'Read the code back' is the voice thief's favourite sentence.", flags: [0] },
        { text: "G-828291 is your Google verification code. If you did not request it, someone may be trying to access your account.", scam: false, why: "A genuine notification — but treat it as an alarm: someone has your password. Change it now, never share the code.", flags: [] },
        { text: "URGENT: Your bank card has been locked. To unlock, confirm the 6-digit code we just sent you. Do not share this code with anyone except our agent.", scam: true, why: "'Share the code with our agent' is the whole scam wearing a uniform. Banks cannot accept your code by law.", flags: [0, 1] },
        { text: "Mum, can you send me the wifi password again please? Restarted the router and forgot which one it was 😅", scam: false, why: "Wi-Fi password ≠ one-time code, the request makes everyday sense, and you can verify by calling back.", flags: [] },
        { text: "Your verification code is 551243. A DHL 'driver' will call you shortly and ask for it to confirm identity. Please cooperate.", scam: true, why: "Real codes arrive with 'never share this'. The sentence asking you to cooperate is the scammer's.", flags: [0] },
        { text: "SIM swap in progress for your number. Reply STOP within 10 minutes to cancel, or your bank codes will move to the new SIM.", scam: true, why: "Uses real fear (SIM swapping) to make you reply — replying confirms a live number to target.", flags: [0, 1] }
      ]
    },
    {
      id: "family",
      title: "Family & Romance",
      icon: "❤️",
      accent: "#BE185D",
      intro: "The most painful scams pretend to be people you love: a child texting from a 'new number', an online romance who needs help, a grandchild in trouble. They rely on the best parts of you — love and the wish to help.",
      goldenRule: "Golden rule: Before sending money to anyone 'in trouble', call the real person on the number you already have. Agree a family code word today.",
      flags: [
        { icon: "📲", title: "New number, same family", why: "“Hi mum, I lost my phone, this is my new number” — then a money ask. Verify by calling the old number." },
        { icon: "🌹", title: "Online love who never meets", why: "Weeks of sweet messages, then an emergency: hospital, ticket, customs. Photos are stolen." },
        { icon: "🎁", title: "Help in gift cards or crypto", why: "Real emergencies are solved with a bank transfer to a person you can speak to — never gift cards." }
      ],
      quiz: [
        { text: "Hi mum, I dropped my phone in the bath 😢 This is my new number. I need a favour, are you free to talk?", scam: true, why: "'New number' + 'need a favour' is the opening of the family-emergency scam. Call the old number to verify.", flags: [0] },
        { text: "Mum, it's James. Just checking you got the photos from Sunday? See you at dinner on Friday, bring the dog 🐕", scam: false, why: "Everyday specifics (dinner Friday, the dog) that a scammer wouldn't have. Still fine to verify if unsure.", flags: [] },
        { text: "Hi grandma, it's me! I've been in an accident and I'm at the police station. I'm texting from a borrowed phone — please send £500 to this account, I'm so scared.", scam: true, why: "Emotional pressure + new number + money to a strange account. The real James would sound like James. Call him.", flags: [0, 2] },
        { text: "Dear Sarah, talking to you these 3 months has been wonderful. I know we haven't video-called yet, but my job in the oil rig is lonely. I'll pay your flight once my bonus clears 💕", scam: true, why: "Months of chat, no video call, money promised 'later' — the romance scam pattern before the first 'emergency'.", flags: [1] },
        { text: "Hey Dad! Movie night at ours on Saturday 8pm — I'll make the lasagne you like. Dave says hi 👋", scam: false, why: "Concrete plans and warm specifics; nothing to gain for a scammer.", flags: [] },
        { text: "I've been offered £3,000/month working from home as a 'parcel forwarder'. They just need your bank details to pay you and your address for packages.", scam: true, why: "'Easy money for reshipping packages' makes you a money mule — illegal and your bank account gets emptied.", flags: [2] },
        { text: "This is the hospital. Your daughter was brought in but is stable. She asks you to pay the £1,200 deposit by gift card to start treatment tonight.", scam: true, why: "Hospitals bill by invoice, never gift cards, and a 'stable' patient doesn't need money tonight.", flags: [0, 2] }
      ]
    },
    {
      id: "invest",
      title: "Investment & Crypto",
      icon: "📈",
      accent: "#7C3AED",
      intro: "'Guaranteed returns', 'Elon Musk gives away Bitcoin', a friendly 'trading mentor'. If it sounds too good to be true, it is — real investing is boring, slow, and can always lose money.",
      goldenRule: "Golden rule: Guaranteed profit does not exist. Anyone promising it is selling you a lie.",
      flags: [
        { icon: "🚀", title: "Guaranteed, effortless profit", why: "“300% return, zero risk” — no honest investment can promise this. Zero risk doesn't exist." },
        { icon: "⏳", title: "Act now, offer closing", why: "Fake scarcity stops you from researching the 'company'. Real brokers don't chase you by text." },
        { icon: "🕳️", title: "Profits appear — then money vanishes", why: "The fake app shows gains to make you 'invest' more. Withdrawal is blocked or taxed 'first'." }
      ],
      quiz: [
        { text: "🚀 Elon Musk is giving away 5,000 BTC! Send 0.1 BTC from any wallet and receive 0.5 BTC back instantly. Limited to first 100 people: btc-giveaway.example.com", scam: true, why: "Billionaires don't double your crypto by text. 'Send money, get more back' is always theft.", flags: [0, 1] },
        { text: "Hi! I'm Olivia, your assigned trading mentor. Last week our members made +38%. Join free for 24h, deposit £250 minimum. Spots are closing!", scam: true, why: "Guaranteed-sounding gains + deposit pressure + fake scarcity. The 'mentor' is a salesperson for the fraud.", flags: [0, 1] },
        { text: "Your portfolio at NorthStarInvestments grew by £214.60 this month. Log in from the app or our website to view the statement.", scam: false, why: "No link, no ask, tells you to use the official app — consistent with a real brokerage statement notice.", flags: [] },
        { text: "Congratulations! Your crypto account shows £48,200. To withdraw, pay the 5% verification fee of £2,410 first.", scam: true, why: "The £48k is pixels on a fake dashboard. Paying a 'fee to withdraw' is the moment the money is stolen.", flags: [0, 2] },
        { text: "Reminder: your monthly transfer of £100 into the savings pot is due on the 1st. No action needed if your direct debit is active.", scam: false, why: "Boring, expected, no urgency and no link — what real financial communication looks like.", flags: [] },
        { text: "FOREX GOLD SIGNALS: 97% win rate last month! Copy our trades, turn £100 into £1,300 in 2 weeks. Message us on Telegram now.", scam: true, why: "Nobody has a 97% win rate; 'copy my trades' on Telegram is the standard trap of pig-butchering gangs.", flags: [0, 1] },
        { text: "Pension Free-Check: You may be owed up to £48,000 from old workplace pensions. Free 2-minute review, no obligation: pension-check.example.org", scam: true, why: "Pension 'free reviews' harvest your details to move your savings into high-risk or fake schemes.", flags: [1] }
      ]
    },
    {
      id: "delivery",
      title: "Delivery & Easy Money",
      icon: "📦",
      accent: "#B45309",
      intro: "The two busiest scams in the world: a parcel you're 'expecting' that costs £2.99 to release, and a job that pays a fortune for no skills. Both end with your card details or your bank account being used by criminals.",
      goldenRule: "Golden rule: Track parcels only in the courier's official app, and treat 'earn £3,000/month from home' as a question, not an offer.",
      flags: [
        { icon: "💳", title: "A tiny fee by card", why: "The goal is not £2.99 — it's your full card details, which are then reused and sold." },
        { icon: "❓", title: "A parcel you don't remember", why: "Redelivery or customs texts arrive for packages that never existed. Check the official tracking." },
        { icon: "💼", title: "A job with no interview", why: "Hired instantly, paid suspiciously well, asked to receive and forward money = money mule." }
      ],
      quiz: [
        { text: "Royal Mail: We couldn't deliver your parcel. Pay the £2.99 redelivery fee here: royalmail-redelivery.example.com", scam: true, why: "Royal Mail never texts payment links for redelivery. The fee exists to steal card details.", flags: [0, 1] },
        { text: "WORK FROM HOME: Earn £2,800/week as a payment processor. No experience needed, instant hire. Send your bank details to start today.", scam: true, why: "'Instant hire + send bank details' = your account becomes a laundering tool. This is a crime, not a job.", flags: [2] },
        { text: "Your Amazon order #402-771 has been dispatched and will arrive Tuesday. Track it in Your Orders.", scam: false, why: "No fee, no link to click, tells you where to track safely — a genuine notification.", flags: [] },
        { text: "MYSTERY SHOPPER WANTED: Get paid £200 per assignment. Receive our cheques, cash them, and report your experience. First task today!", scam: true, why: "Cashing 'our cheques' makes you the criminal's cashier — the cheque bounces and the money is yours to repay.", flags: [2] },
        { text: "Hi! It's Priya from the book club. Rotas for cake baking are up on the community board, no panic if you can't make it 😊", scam: false, why: "Community message with nothing to click, pay or lose.", flags: [] },
        { text: "DHL: Customs charge of £1.45 is blocking your package from abroad. Settle now to avoid return: dhl-customs-pay.example.com", scam: true, why: "Sub-£2 'customs' + link is the top UK scam text. Duties are paid in the courier's app.", flags: [0, 1] },
        { text: "Great news — your interview for the Library Assistant role is confirmed for Monday 10am at the council office. Bring your CV!", scam: false, why: "A real job has an interview, a place and a time. Nobody asks for bank details first.", flags: [] }
      ]
    },
    {
      id: "ai",
      title: "AI Voice & Deepfakes",
      icon: "🤖",
      accent: "#0F766E",
      bonus: true,
      mcq: true,
      intro: "New in the AI era: 3 seconds of a voice from a social video is enough to clone it. Grandparents get calls that sound exactly like a crying grandson. Video calls can show a face that isn't real. Your best defence is a protocol, not perfect hearing.",
      goldenRule: "Golden rule: Agree a family code word. On any scary call asking for money — ask for it, then call back on the number you know.",
      flags: [
        { icon: "🎙️", title: "A familiar voice is not proof", why: "3 seconds of audio from a social video is enough to clone a voice. Any call asking for money gets verified another way." },
        { icon: "📹", title: "Video calls can be faked too", why: "Real-time deepfakes exist. A face and a uniform on a call prove nothing — the process does." },
        { icon: "🔐", title: "A code word beats any clone", why: "Agree on a family code word today. It is the one thing no AI can know." }
      ],
      mcq: true,
      mcqs: [
        {
          scenario: "Phone rings at 11pm. A voice that sounds exactly like your grandson, crying: 'Grandma, I crashed the car, I'm scared, please don't tell mum — send £800 right now.'",
          options: ["Send the money immediately — it's really his voice", "Ask for the family code word, then hang up and call his real number", "Ask him to keep talking so you can hear better"],
          answer: 1,
          why: "Voice cloning needs only seconds of audio. A code word is proof a clone cannot fake — and a call to his real number settles it in 10 seconds."
        },
        {
          scenario: "A video call: your 'bank manager' in official uniform shows you a real-looking ID and screen with your account. He asks you to read the one-time code to 'cancel a fraudulent transfer'.",
          options: ["Read the code — you can see he's genuine on video", "Refuse. Hang up and call the bank on the number from your card", "Ask him to email the request instead"],
          answer: 1,
          why: "Video and IDs can be faked; uniforms prove nothing. The one-time code IS the fraudulent transfer. Real banks never ask for it — on any channel."
        },
        {
          scenario: "An urgent voicemail from your 'daughter's number': 'Mum, I've been in an accident, the hospital needs a £1,500 deposit, I'll explain later.'",
          options: ["Pay the deposit — hospital time matters", "Text back asking for details", "Call your daughter's real number, then the hospital's official line"],
          answer: 2,
          why: "Two-step verification: first the real daughter, then the hospital's switchboard from their website. Never the payment details from a voicemail or text."
        },
        {
          scenario: "Your friend messages from her usual account: 'Do me a favour, I'm at the till and my card failed — send £60 and I'll pay back tonight.' Then adds a payment link.",
          options: ["Send £60, she's a friend and it's her account", "Call her by voice — her account may be hijacked", "Reply asking to be paid back next week"],
          answer: 1,
          why: "Hijacked accounts are used exactly like this. One voice call ('code word' if you have one) costs nothing and stops it."
        }
      ]
    }
  ];
})();
