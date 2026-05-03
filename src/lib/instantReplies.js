// src/lib/instantReplies.js
// Wingman Instant Replies
// Purpose: save AI credits by answering common dating questions without calling Claude/OpenAI.

const INSTANT_REPLY_BANK = [
  {
    id: "first-message",
    category: "First Message",
    keywords: [
      "first message",
      "opener",
      "start conversation",
      "say hi",
      "what should i text first",
      "how to start",
      "opening line"
    ],
    context: {
      stage: "first_message",
      temperature: "warm",
      theyFeeling: "curious",
      risk: null
    },
    replies: [
      {
        type: "confident",
        emoji: "😎",
        text: "I was going to say something smooth, but honestly your profile made that difficult in a good way."
      },
      {
        type: "funny",
        emoji: "😂",
        text: "I had a clever opener ready, but now I'm under pressure because you seem actually interesting."
      },
      {
        type: "warm",
        emoji: "🙂",
        text: "Hey, your vibe seems really warm. I wanted to say hi properly."
      },
      {
        type: "simple",
        emoji: "💬",
        text: "Hey, I liked your profile. How's your day going?"
      }
    ]
  },

  {
    id: "they-say-hi",
    category: "Basic Reply",
    keywords: [
      "she said hi",
      "he said hi",
      "they said hi",
      "hi",
      "hey",
      "hello",
      "hey there"
    ],
    context: {
      stage: "early_chat",
      temperature: "warm",
      theyFeeling: "interested",
      risk: null
    },
    replies: [
      {
        type: "warm",
        emoji: "🙂",
        text: "Heyy, I was hoping you'd reply. How's your day going?"
      },
      {
        type: "playful",
        emoji: "😄",
        text: "Hey you. I'll pretend I didn't smile when I saw your message."
      },
      {
        type: "confident",
        emoji: "😎",
        text: "Hey, good to hear from you. What kind of mood are you in today?"
      },
      {
        type: "simple",
        emoji: "💬",
        text: "Hey, how's your day been?"
      }
    ]
  },

  {
    id: "how-are-you",
    category: "Basic Reply",
    keywords: [
      "how are you",
      "how r u",
      "how are u",
      "how have you been",
      "how's your day",
      "how is your day"
    ],
    context: {
      stage: "early_chat",
      temperature: "warm",
      theyFeeling: "interested",
      risk: null
    },
    replies: [
      {
        type: "natural",
        emoji: "🙂",
        text: "I'm good, a little busy but in a good mood. What about you?"
      },
      {
        type: "flirty",
        emoji: "😏",
        text: "Better now that you asked. What about you?"
      },
      {
        type: "funny",
        emoji: "😂",
        text: "Surviving, thriving, and pretending I have my life together. You?"
      },
      {
        type: "confident",
        emoji: "😎",
        text: "Doing well. Today's been decent so far. How's your day going?"
      }
    ]
  },

  {
    id: "wyd",
    category: "Basic Reply",
    keywords: [
      "wyd",
      "what are you doing",
      "what you doing",
      "what r u doing",
      "what are u doing",
      "what's up",
      "whats up"
    ],
    context: {
      stage: "early_chat",
      temperature: "warm",
      theyFeeling: "curious",
      risk: null
    },
    replies: [
      {
        type: "simple",
        emoji: "💬",
        text: "Just relaxing a bit. What are you up to?"
      },
      {
        type: "flirty",
        emoji: "😏",
        text: "Currently trying to look busy, but your message is more interesting."
      },
      {
        type: "funny",
        emoji: "😂",
        text: "Nothing too wild. Just living my very dramatic normal life."
      },
      {
        type: "warm",
        emoji: "🙂",
        text: "Taking it easy right now. How's your evening going?"
      }
    ]
  },

  {
    id: "late-reply",
    category: "Late Reply",
    keywords: [
      "late reply",
      "sorry late",
      "sorry for late reply",
      "busy",
      "forgot to reply",
      "didn't reply",
      "i was busy",
      "i am busy"
    ],
    context: {
      stage: "building_rapport",
      temperature: "warm",
      theyFeeling: "interested",
      risk: "being_too_eager"
    },
    replies: [
      {
        type: "natural",
        emoji: "🙂",
        text: "No worries at all, life gets busy. How's your day going?"
      },
      {
        type: "playful",
        emoji: "😄",
        text: "I'll forgive the late reply this time 😄 How's your day been?"
      },
      {
        type: "confident",
        emoji: "😎",
        text: "You're good. I'm not keeping score yet."
      },
      {
        type: "sweet",
        emoji: "😊",
        text: "Don't worry, I'm just glad you replied."
      }
    ]
  },

  {
    id: "dry-reply",
    category: "Dry Reply",
    keywords: [
      "dry reply",
      "one word",
      "she said ok",
      "he said ok",
      "she said okay",
      "he said okay",
      "she said lol",
      "he said lol",
      "conversation dying",
      "boring reply",
      "short reply"
    ],
    context: {
      stage: "dying_conversation",
      temperature: "cool",
      theyFeeling: "bored",
      risk: "low_energy"
    },
    replies: [
      {
        type: "playful",
        emoji: "😄",
        text: "That reply was dangerously short. Should I be worried or are you just saving your best energy for later?"
      },
      {
        type: "confident",
        emoji: "😎",
        text: "I feel like I'm getting the trailer, not the full movie."
      },
      {
        type: "direct",
        emoji: "💬",
        text: "You seem a little quiet today. Busy day?"
      },
      {
        type: "light",
        emoji: "🙂",
        text: "I'll take that as a mysterious answer."
      }
    ]
  },

  {
    id: "ask-number",
    category: "Move Forward",
    keywords: [
      "ask number",
      "get number",
      "phone number",
      "ask for number",
      "get her number",
      "get his number",
      "snapchat",
      "instagram",
      "ask instagram"
    ],
    context: {
      stage: "building_rapport",
      temperature: "hot",
      theyFeeling: "interested",
      risk: "going_too_slow"
    },
    replies: [
      {
        type: "confident",
        emoji: "😎",
        text: "I like talking to you here, but I feel like this conversation deserves a better place. Want to exchange numbers?"
      },
      {
        type: "smooth",
        emoji: "😏",
        text: "You seem fun to talk to. Want to continue this over text?"
      },
      {
        type: "simple",
        emoji: "💬",
        text: "Would you be comfortable exchanging numbers?"
      },
      {
        type: "playful",
        emoji: "😄",
        text: "I think we've earned an upgrade from app chat to real texting."
      }
    ]
  },

  {
    id: "ask-date",
    category: "Ask Date",
    keywords: [
      "ask her out",
      "ask him out",
      "ask them out",
      "ask for date",
      "date",
      "coffee",
      "meet up",
      "meet",
      "hangout",
      "grab coffee"
    ],
    context: {
      stage: "building_rapport",
      temperature: "hot",
      theyFeeling: "interested",
      risk: "going_too_slow"
    },
    replies: [
      {
        type: "confident",
        emoji: "😎",
        text: "I'm enjoying this. We should continue it over coffee sometime this week."
      },
      {
        type: "warm",
        emoji: "🙂",
        text: "You seem easy to talk to. Would you be open to grabbing coffee sometime?"
      },
      {
        type: "playful",
        emoji: "😄",
        text: "I feel like this conversation would be better with coffee involved."
      },
      {
        type: "simple",
        emoji: "💬",
        text: "Would you like to meet for coffee this week?"
      }
    ]
  },

  {
    id: "compliment",
    category: "Compliment",
    keywords: [
      "compliment",
      "beautiful",
      "cute",
      "pretty",
      "handsome",
      "she looks good",
      "he looks good",
      "hot",
      "attractive"
    ],
    context: {
      stage: "early_chat",
      temperature: "warm",
      theyFeeling: "curious",
      risk: "being_too_eager"
    },
    replies: [
      {
        type: "classy",
        emoji: "🙂",
        text: "You have a really nice smile. It feels very genuine."
      },
      {
        type: "confident",
        emoji: "😎",
        text: "You're attractive, but your vibe is what caught my attention."
      },
      {
        type: "sweet",
        emoji: "😊",
        text: "You have a really warm energy in your photos."
      },
      {
        type: "playful",
        emoji: "😄",
        text: "Okay, I'll admit it — your photos made it hard not to message you."
      }
    ]
  },

  {
    id: "after-date",
    category: "After Date",
    keywords: [
      "after date",
      "after meeting",
      "first date",
      "had a good time",
      "text after date",
      "after coffee",
      "hope you got home safe"
    ],
    context: {
      stage: "post_date",
      temperature: "warm",
      theyFeeling: "interested",
      risk: null
    },
    replies: [
      {
        type: "warm",
        emoji: "🙂",
        text: "I had a really nice time with you today. You're even easier to talk to in person."
      },
      {
        type: "confident",
        emoji: "😎",
        text: "I enjoyed tonight. We should definitely do that again."
      },
      {
        type: "sweet",
        emoji: "😊",
        text: "Just wanted to say I had a great time. Your energy is really nice."
      },
      {
        type: "simple",
        emoji: "💬",
        text: "I had a good time today. Hope you got home safe."
      }
    ]
  },

  {
    id: "no-response",
    category: "Follow Up",
    keywords: [
      "no response",
      "left on read",
      "ghosted",
      "not replying",
      "follow up",
      "double text",
      "should i text again",
      "no reply"
    ],
    context: {
      stage: "dying_conversation",
      temperature: "cool",
      theyFeeling: "guarded",
      risk: "being_too_eager"
    },
    replies: [
      {
        type: "light",
        emoji: "🙂",
        text: "I'll assume life got busy, not that my last message was terrible."
      },
      {
        type: "confident",
        emoji: "😎",
        text: "No pressure to reply fast. Just wanted to see how your week is going."
      },
      {
        type: "playful",
        emoji: "😄",
        text: "Checking in before I officially blame your phone for hiding my message."
      },
      {
        type: "mature",
        emoji: "💬",
        text: "Hey, hope your week's been going well."
      }
    ]
  },

  {
    id: "maybe",
    category: "Uncertain Reply",
    keywords: [
      "maybe",
      "i'll see",
      "i will see",
      "let me see",
      "not sure",
      "possibly",
      "i don't know",
      "i don't know"
    ],
    context: {
      stage: "building_rapport",
      temperature: "warm",
      theyFeeling: "guarded",
      risk: "being_too_eager"
    },
    replies: [
      {
        type: "confident",
        emoji: "😎",
        text: "Fair enough. I'll take maybe as a soft yes with dramatic suspense."
      },
      {
        type: "playful",
        emoji: "😄",
        text: "Maybe is mysterious. I'll allow it for now."
      },
      {
        type: "direct",
        emoji: "💬",
        text: "No worries. Let me know when you're sure."
      },
      {
        type: "flirty",
        emoji: "😏",
        text: "Maybe? Sounds like I still have a chance to convince you."
      }
    ]
  },

  {
    id: "good-morning",
    category: "Daily Text",
    keywords: [
      "good morning",
      "morning text",
      "gm",
      "morning reply"
    ],
    context: {
      stage: "building_rapport",
      temperature: "warm",
      theyFeeling: "interested",
      risk: null
    },
    replies: [
      {
        type: "sweet",
        emoji: "😊",
        text: "Good morning. Hope your day starts better than your alarm sound."
      },
      {
        type: "warm",
        emoji: "🙂",
        text: "Good morning. Hope today treats you nicely."
      },
      {
        type: "flirty",
        emoji: "😏",
        text: "Good morning. I hope I'm not the second-best notification you got today."
      },
      {
        type: "simple",
        emoji: "💬",
        text: "Good morning. How did you sleep?"
      }
    ]
  },

  {
    id: "good-night",
    category: "Daily Text",
    keywords: [
      "good night",
      "gn",
      "night text",
      "sleep well",
      "sweet dreams"
    ],
    context: {
      stage: "building_rapport",
      temperature: "warm",
      theyFeeling: "interested",
      risk: null
    },
    replies: [
      {
        type: "sweet",
        emoji: "😊",
        text: "Good night. Sleep well and don't let your thoughts start a podcast at 2am."
      },
      {
        type: "warm",
        emoji: "🙂",
        text: "Good night. Hope you sleep peacefully."
      },
      {
        type: "flirty",
        emoji: "😏",
        text: "Good night. Try not to miss me too much."
      },
      {
        type: "simple",
        emoji: "💬",
        text: "Good night, talk soon."
      }
    ]
  },

  {
    id: "what-are-you-looking-for",
    category: "Dating Intent",
    keywords: [
      "what are you looking for",
      "looking for relationship",
      "looking for serious",
      "casual or serious",
      "what do you want here"
    ],
    context: {
      stage: "building_rapport",
      temperature: "warm",
      theyFeeling: "curious",
      risk: "over_qualifying"
    },
    replies: [
      {
        type: "mature",
        emoji: "💬",
        text: "I'm open to something real if the connection feels right. I'd rather let it grow naturally than force it."
      },
      {
        type: "confident",
        emoji: "😎",
        text: "I'm looking for a genuine connection. Something fun, honest, and hopefully worth taking seriously."
      },
      {
        type: "warm",
        emoji: "🙂",
        text: "I'd like to meet someone I actually enjoy talking to and see where it goes from there."
      },
      {
        type: "playful",
        emoji: "😄",
        text: "Ideally someone who can make me laugh and not disappear after two good conversations."
      }
    ]
  },

  {
    id: "tell-me-about-yourself",
    category: "About Yourself",
    keywords: [
      "tell me about yourself",
      "about yourself",
      "what do you do",
      "who are you",
      "introduce yourself"
    ],
    context: {
      stage: "early_chat",
      temperature: "warm",
      theyFeeling: "curious",
      risk: null
    },
    replies: [
      {
        type: "natural",
        emoji: "🙂",
        text: "I'm pretty easygoing. I like good conversations, random drives, trying new food, and people who don't take themselves too seriously."
      },
      {
        type: "confident",
        emoji: "😎",
        text: "I'm ambitious, calm, and a little playful once I'm comfortable. I like people with good energy and real conversation."
      },
      {
        type: "funny",
        emoji: "😂",
        text: "I'm a mix of responsible adult and someone who still gets excited about good food and spontaneous plans."
      },
      {
        type: "simple",
        emoji: "💬",
        text: "I'm easygoing, hardworking, and I like meeting people who have a good sense of humour."
      }
    ]
  },

  {
    id: "restart-conversation",
    category: "Restart Chat",
    keywords: [
      "restart conversation",
      "dead conversation",
      "start again",
      "bring back conversation",
      "reopen chat",
      "old match",
      "text old match"
    ],
    context: {
      stage: "dying_conversation",
      temperature: "cool",
      theyFeeling: "guarded",
      risk: "low_energy"
    },
    replies: [
      {
        type: "playful",
        emoji: "😄",
        text: "I feel like our conversation took a dramatic vacation. Should we bring it back?"
      },
      {
        type: "confident",
        emoji: "😎",
        text: "I was going to let this chat fade, but I think we can do better than that."
      },
      {
        type: "warm",
        emoji: "🙂",
        text: "Hey, it's been a little while. How have you been?"
      },
      {
        type: "light",
        emoji: "💬",
        text: "Random check-in: how's your week going?"
      }
    ]
  },

  {
    id: "apology",
    category: "Apology",
    keywords: [
      "apologize",
      "sorry",
      "i made mistake",
      "i messed up",
      "how to say sorry",
      "apology text"
    ],
    context: {
      stage: "building_rapport",
      temperature: "cool",
      theyFeeling: "guarded",
      risk: "over_qualifying"
    },
    replies: [
      {
        type: "mature",
        emoji: "💬",
        text: "You're right, I could've handled that better. I'm sorry. I didn't mean to make you feel that way."
      },
      {
        type: "simple",
        emoji: "🙂",
        text: "I'm sorry. That came out wrong, and I understand why it didn't feel good."
      },
      {
        type: "respectful",
        emoji: "🤝",
        text: "I apologize. I'll be more thoughtful with how I say things."
      },
      {
        type: "warm",
        emoji: "😊",
        text: "I'm sorry. I value talking to you, and I don't want a small misunderstanding to ruin the vibe."
      }
    ]
  },

  {
    id: "rejection",
    category: "Rejection",
    keywords: [
      "not interested",
      "reject",
      "rejection",
      "she rejected me",
      "he rejected me",
      "friend zone",
      "just friends"
    ],
    context: {
      stage: "dying_conversation",
      temperature: "cold",
      theyFeeling: "guarded",
      risk: "being_too_eager"
    },
    replies: [
      {
        type: "mature",
        emoji: "💬",
        text: "I appreciate you being honest. No hard feelings at all. I wish you the best."
      },
      {
        type: "confident",
        emoji: "😎",
        text: "That's fair. I respect your honesty. Take care."
      },
      {
        type: "warm",
        emoji: "🙂",
        text: "Thanks for telling me honestly. I respect that, and I hope everything goes well for you."
      },
      {
        type: "simple",
        emoji: "💬",
        text: "No worries, I understand. All the best."
      }
    ]
  }
];

function normalizeText(text = "") {
  return String(text)
    .toLowerCase()
    .replace(/[^\w\s']/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function scoreMatch(input, keywords) {
  let score = 0;
  const cleanInput = normalizeText(input);

  for (const keyword of keywords) {
    const cleanKeyword = normalizeText(keyword);

    if (!cleanKeyword) continue;

    // Strong match: full keyword appears
    if (cleanInput.includes(cleanKeyword)) {
      score += cleanKeyword.length >= 8 ? 5 : 3;
    }

    // Soft match: individual words appear
    const words = cleanKeyword.split(" ").filter((word) => word.length > 2);
    for (const word of words) {
      if (cleanInput.includes(word)) {
        score += 0.75;
      }
    }
  }

  return score;
}

export function findInstantReply(userInput) {
  const input = normalizeText(userInput);

  if (!input) return null;

  let bestItem = null;
  let bestScore = 0;

  for (const item of INSTANT_REPLY_BANK) {
    const score = scoreMatch(input, item.keywords);

    if (score > bestScore) {
      bestScore = score;
      bestItem = item;
    }
  }

  // Increase this number if wrong matches happen too often.
  const MIN_SCORE_TO_MATCH = 2.5;

  if (!bestItem || bestScore < MIN_SCORE_TO_MATCH) {
    return null;
  }

  return {
    usedAI: false,
    source: "instant_template",
    matchedCategory: bestItem.category,
    matchedId: bestItem.id,
    context: bestItem.context,
    replies: bestItem.replies
  };
}

export async function getWingmanReply(userInput, aiFunction) {
  // 1. Try instant replies first
  const instant = findInstantReply(userInput);

  if (instant) {
    return instant;
  }

  // 2. If no template match, use AI
  if (typeof aiFunction !== "function") {
    return {
      usedAI: false,
      source: "fallback",
      matchedCategory: "Fallback",
      matchedId: "fallback",
      context: {
        stage: "early_chat",
        temperature: "warm",
        theyFeeling: "interested",
        risk: null
      },
      replies: [
        {
          type: "simple",
          emoji: "💬",
          text: "Keep it simple and natural. Ask something easy for them to answer."
        },
        {
          type: "warm",
          emoji: "🙂",
          text: "That sounds interesting. Tell me more about that."
        },
        {
          type: "playful",
          emoji: "😄",
          text: "Okay, now I'm curious. What happened next?"
        },
        {
          type: "confident",
          emoji: "😎",
          text: "I like that. You seem like someone with good stories."
        }
      ]
    };
  }

  const aiResult = await aiFunction(userInput);

  return {
    ...aiResult,
    usedAI: true,
    source: "ai"
  };
}

export { INSTANT_REPLY_BANK };
