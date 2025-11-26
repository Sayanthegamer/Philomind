import { Question } from './types';

export const QUESTIONS: Question[] = [
  {
    id: 1,
    text: "When someone deeply wrongs you, what is your immediate internal reaction, and how do you eventually handle it?",
    placeholder: "Be honest about your first instinct...",
    options: [
      "I feel intense anger but eventually forgive for my own peace.",
      "I cut them off immediately; betrayal is unacceptable.",
      "I try to understand their perspective and seek reconciliation.",
      "I hold a grudge silently while maintaining a polite exterior."
    ]
  },
  {
    id: 2,
    text: "If you could change one significant regret from your past, would you do it? Why or why not?",
    placeholder: "Think about the consequences of changing who you are...",
    options: [
      "Yes, I would undo the pain I caused others.",
      "No, my mistakes made me who I am today.",
      "Yes, I missed a great opportunity I want back.",
      "No, I believe in fate and that everything happens for a reason."
    ]
  },
  {
    id: 3,
    text: "How do you determine if an action is 'good' or 'bad'? Is it the intent, or the outcome?",
    placeholder: "Explain your moral compass...",
    options: [
      "Intent matters most; accidents shouldn't be punished.",
      "Outcome is king; good intentions don't fix damage.",
      "It's a balance; both must be aligned for true goodness.",
      "Good and bad are subjective social constructs."
    ]
  },
  {
    id: 4,
    text: "Imagine you have achieved everything you ever wanted, but you are completely alone. Is this success?",
    placeholder: "Define what success means to you...",
    options: [
      "No, success is meaningless without someone to share it with.",
      "Yes, personal achievement is the ultimate goal.",
      "It's a hollow victory, but still a victory.",
      "I would prefer a modest life full of love over lonely greatness."
    ]
  },
  {
    id: 5,
    text: "What is more important to you: personal freedom or responsibility to your community?",
    placeholder: "Where is the balance for you?",
    options: [
      "Personal freedom; I must be true to myself first.",
      "Responsibility; we owe it to others to contribute.",
      "Freedom, as long as it doesn't harm others.",
      "Responsibility provides the structure for true freedom."
    ]
  },
  {
    id: 6,
    text: "If you lost your job, your status, and your possessions tomorrow, who would you be?",
    placeholder: "Describe your core self without labels...",
    options: [
      "I would be a survivor, ready to rebuild.",
      "I would be lost; my achievements define me.",
      "I would be free; possessions are just a burden.",
      "I would still be a loving friend/partner/family member."
    ]
  },
  {
    id: 7,
    text: "How do you cope with the realization that life is finite?",
    placeholder: "Does it scare you, drive you, or comfort you?",
    options: [
      "It drives me to make every moment count.",
      "It terrifies me, so I try not to think about it.",
      "It comforts me; eternity would be boring.",
      "I focus on leaving a legacy that outlasts me."
    ]
  }
];

export const MOCK_RESULT = {
  maturityScore: 85,
  philosophicalPersona: "The Resilient Stoic",
  generalAnalysis: "You demonstrate a profound ability to separate external events from internal peace.",
  insights: [],
  hasAward: true,
  awardTitle: "Order of the Calm Mind"
};