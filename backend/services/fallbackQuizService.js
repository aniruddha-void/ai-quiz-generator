/**
 * Educational Fallback Service
 * Provides educational quizzes when GEMINI_API_KEY is unset, rate-limited,
 * or offline. Ensures the internship project evaluation never crashes.
 */

// Helper to shuffle options and calibrate correctAnswerIndex
function shuffleOptionsAndFixIndex(q) {
  const originalCorrect = q.options[q.correctAnswerIndex];
  // Deterministic or pseudo-random shuffle
  const indexedOptions = q.options.map((opt, i) => ({ opt, isCorrect: i === q.correctAnswerIndex }));
  // Fisher-Yates shuffle
  for (let i = indexedOptions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indexedOptions[i], indexedOptions[j]] = [indexedOptions[j], indexedOptions[i]];
  }

  const shuffledOptions = indexedOptions.map(item => item.opt);
  const newIndex = indexedOptions.findIndex(item => item.isCorrect);

  return {
    ...q,
    options: shuffledOptions,
    correctAnswerIndex: newIndex >= 0 ? newIndex : 0,
    correctAnswer: originalCorrect
  };
}

const PRESET_TOPICS = {
  javascript: {
    name: 'JavaScript Fundamentals',
    questions: [
      {
        question: 'Which of the following is NOT a primitive type in modern JavaScript?',
        options: ['Object', 'Symbol', 'Boolean', 'BigInt'],
        correctAnswerIndex: 0,
        explanation: 'In JavaScript, primitive types include string, number, bigint, boolean, undefined, symbol, and null. Object is a non-primitive reference type.',
        topicConcept: 'JavaScript Data Types'
      },
      {
        question: 'What is the primary difference between "==" and "===" in JavaScript?',
        options: [
          '=== checks type and value without type coercion',
          '== checks both type and memory address',
          '=== performs automatic type coercion',
          'There is no difference in ES6+'
        ],
        correctAnswerIndex: 0,
        explanation: 'The strict equality operator (===) checks both value and type without performing automatic type conversion (coercion), whereas == coerces types before comparison.',
        topicConcept: 'Equality and Type Coercion'
      },
      {
        question: 'Which array method returns a brand new array with elements that pass a provided test function?',
        options: ['filter()', 'forEach()', 'find()', 'reduce()'],
        correctAnswerIndex: 0,
        explanation: 'Array.prototype.filter() creates a shallow copy of a portion of the given array, filtered down to just the elements that pass the test implemented by the provided function.',
        topicConcept: 'Array Iteration Methods'
      },
      {
        question: 'What does the Event Loop handle in the JavaScript runtime?',
        options: [
          'Scheduling and executing asynchronous callback tasks from the task queue',
          'Compiling JavaScript into machine bytecode',
          'Allocating memory heaps for DOM elements',
          'Handling CSS animation frames exclusively'
        ],
        correctAnswerIndex: 0,
        explanation: 'The event loop continuously checks if the call stack is empty and moves asynchronous tasks from the task/microtask queues into the call stack.',
        topicConcept: 'Asynchronous Event Loop'
      },
      {
        question: 'What is the purpose of the "use strict" directive in JavaScript?',
        options: [
          'Enforces stricter parsing and error handling at runtime',
          'Enables experimental ECMAScript stage-1 features',
          'Forces all variables to be statically typed',
          'Disables asynchronous execution'
        ],
        correctAnswerIndex: 0,
        explanation: '"use strict" enables strict mode, catching silent errors, preventing accidental global variables, and disabling deprecated syntax.',
        topicConcept: 'Strict Mode'
      }
    ]
  },
  react: {
    name: 'React.js Architecture',
    questions: [
      {
        question: 'What is the core purpose of React’s Virtual DOM?',
        options: [
          'To minimize direct, costly real DOM manipulations via reconciliation',
          'To replace the browser HTML parser entirely',
          'To compile JavaScript code into WebAssembly',
          'To securely store sensitive authentication tokens'
        ],
        correctAnswerIndex: 0,
        explanation: 'React compares the Virtual DOM with the previous snapshot (diffing) and updates only the necessary elements in the real DOM (reconciliation) for optimal performance.',
        topicConcept: 'Virtual DOM & Reconciliation'
      },
      {
        question: 'Which Hook should you use to perform side effects like data fetching or subscriptions?',
        options: ['useEffect', 'useMemo', 'useRef', 'useCallback'],
        correctAnswerIndex: 0,
        explanation: 'useEffect is designed specifically for side effects such as API requests, manual DOM mutations, timers, and event listeners.',
        topicConcept: 'React Hooks Lifecycle'
      },
      {
        question: 'Why should you avoid using array indices as "key" props for dynamic lists?',
        options: [
          'It can lead to incorrect state retention and inefficient DOM updates when items reorder',
          'React will throw a fatal syntax error in production builds',
          'Array indices cannot be converted to strings',
          'Keys are strictly reserved for CSS styling'
        ],
        correctAnswerIndex: 0,
        explanation: 'Using indices as keys can lead to component state bugs, incorrect animation glitches, and poor reconciliation performance when items are sorted, added, or deleted.',
        topicConcept: 'List Keys and Reconciliation'
      },
      {
        question: 'What is a key difference between useState and useRef?',
        options: [
          'Updating useRef does NOT trigger a component re-render, whereas useState does',
          'useRef cannot store mutable objects',
          'useState values are not preserved across renders',
          'useRef can only be called inside class components'
        ],
        correctAnswerIndex: 0,
        explanation: 'useRef returns a mutable ref object whose .current property persists across renders without triggering a re-render when mutated.',
        topicConcept: 'State vs Ref'
      },
      {
        question: 'What does "lifting state up" mean in React application design?',
        options: [
          'Moving shared state to the closest common ancestor of the components that need it',
          'Storing state in global localStorage automatically',
          'Moving all component state into the root window object',
          'Refactoring state variables into CSS variables'
        ],
        correctAnswerIndex: 0,
        explanation: 'When two or more components need access to the same state, lifting state up to their nearest common parent allows state synchronization via props.',
        topicConcept: 'State Management Patterns'
      }
    ]
  },
  ai: {
    name: 'Artificial Intelligence & Machine Learning',
    questions: [
      {
        question: 'In Machine Learning, what is "Supervised Learning"?',
        options: [
          'Training a model on labeled input-output pairs',
          'Training without any target labels or guidance',
          'Agent taking actions in an environment to maximize rewards',
          'Human programmer manually writing all if-else rules'
        ],
        correctAnswerIndex: 0,
        explanation: 'Supervised learning involves feeding the algorithm labeled training data so it learns to map inputs to corresponding target outputs.',
        topicConcept: 'Supervised Learning'
      },
      {
        question: 'What mechanism in Transformers allows the model to weigh the importance of different words in a sequence?',
        options: ['Self-Attention Mechanism', 'Backpropagation', 'Max Pooling', 'Convolutional Kernel'],
        correctAnswerIndex: 0,
        explanation: 'Self-attention calculates attention weights between all token pairs in a sequence, allowing the model to capture contextual relationships regardless of distance.',
        topicConcept: 'Transformer Architecture & Attention'
      },
      {
        question: 'What problem occurs when a model performs exceptionally well on training data but poorly on unseen test data?',
        options: ['Overfitting', 'Underfitting', 'Gradient Vanishing', 'High Bias'],
        correctAnswerIndex: 0,
        explanation: 'Overfitting happens when a model learns noise and specific details of the training dataset rather than generalizable underlying patterns.',
        topicConcept: 'Generalization & Overfitting'
      },
      {
        question: 'What does "Temperature" control in Large Language Model (LLM) generation?',
        options: [
          'The randomness and creativity of the probability distribution over tokens',
          'The hardware temperature of the GPU cluster',
          'The maximum token length allowed in the response',
          'The speed of the network transmission'
        ],
        correctAnswerIndex: 0,
        explanation: 'Lower temperature makes LLM output more deterministic and conservative, while higher temperature flattens token probabilities for more creative variety.',
        topicConcept: 'LLM Hyperparameters'
      },
      {
        question: 'What does RAG stand for in modern AI system design?',
        options: [
          'Retrieval-Augmented Generation',
          'Recurrent Attention Gradient',
          'Recursive Algorithm Generator',
          'Randomized Adaptive Guidance'
        ],
        correctAnswerIndex: 0,
        explanation: 'Retrieval-Augmented Generation (RAG) fetches relevant external knowledge from a vector store or search engine and supplies it in the prompt for grounded answers.',
        topicConcept: 'RAG Architecture'
      }
    ]
  }
};

/**
 * Generates an educational quiz fallback if Gemini API is unavailable or unconfigured.
 */
export function generateFallbackQuiz(topic, difficulty = 'Medium') {
  const cleanTopic = (topic || 'General Science').trim();
  const lower = cleanTopic.toLowerCase();

  let rawQuestions = null;
  if (lower.includes('js') || lower.includes('javascript') || lower.includes('node') || lower.includes('web')) {
    rawQuestions = PRESET_TOPICS.javascript.questions;
  } else if (lower.includes('react') || lower.includes('frontend') || lower.includes('ui')) {
    rawQuestions = PRESET_TOPICS.react.questions;
  } else if (lower.includes('ai') || lower.includes('ml') || lower.includes('gemini') || lower.includes('data') || lower.includes('model')) {
    rawQuestions = PRESET_TOPICS.ai.questions;
  }

  if (rawQuestions) {
    const questions = rawQuestions.map((q, idx) => {
      const shuffled = shuffleOptionsAndFixIndex(q);
      return {
        id: idx + 1,
        question: shuffled.question,
        options: shuffled.options,
        correctAnswerIndex: shuffled.correctAnswerIndex,
        correctAnswer: shuffled.options[shuffled.correctAnswerIndex],
        explanation: shuffled.explanation,
        topicConcept: shuffled.topicConcept
      };
    });

    return {
      topic: cleanTopic,
      difficulty,
      isFallback: true,
      totalQuestions: 5,
      questions,
      generatedAt: new Date().toISOString()
    };
  }

  // Generic dynamic fallback for any other topic
  const genericBase = [
    {
      question: `What is a foundational principle of ${cleanTopic}?`,
      options: [
        `Core theoretical foundations and structural laws of ${cleanTopic}`,
        `Unrelated procedural syntax from arbitrary domains`,
        `Randomly fluctuating empirical constants`,
        `Outdated legacy protocols without modern application`
      ],
      correctAnswerIndex: 0,
      explanation: `Mastering ${cleanTopic} begins with understanding its core principles, foundational axioms, and primary objective models.`,
      topicConcept: `${cleanTopic} Fundamentals`
    },
    {
      question: `Which methodology is considered a best practice when analyzing or working in ${cleanTopic}?`,
      options: [
        `Systematic evaluation, verification, and empirical testing`,
        `Guesswork without documenting hypotheses or results`,
        `Skipping foundational prerequisites entirely`,
        `Relying on deprecated assumptions without validation`
      ],
      correctAnswerIndex: 0,
      explanation: `Rigorous analysis and systematic validation are essential to achieving consistent and reliable outcomes in ${cleanTopic}.`,
      topicConcept: `${cleanTopic} Methodology`
    },
    {
      question: `What is a common pitfall or challenge faced by learners studying ${cleanTopic}?`,
      options: [
        `Overlooking prerequisite fundamentals before tackling advanced concepts`,
        `Taking structured notes and solving sample problems`,
        `Reviewing explanatory feedback for mistaken assumptions`,
        `Testing hypotheses against verifiable benchmarks`
      ],
      correctAnswerIndex: 0,
      explanation: `Learners often struggle when jumping into complex applications without solidifying core conceptual definitions in ${cleanTopic}.`,
      topicConcept: `${cleanTopic} Problem Solving`
    },
    {
      question: `At a ${difficulty} difficulty level, how are real-world applications of ${cleanTopic} evaluated?`,
      options: [
        `By assessing accuracy, efficiency, trade-offs, and scalability`,
        `By ignoring constraints and operational context`,
        `Purely by random sampling without performance metrics`,
        `Through aesthetic appearance alone`
      ],
      correctAnswerIndex: 0,
      explanation: `At a ${difficulty} level, practical applications demand balancing constraints, trade-offs, and measurable criteria.`,
      topicConcept: `${cleanTopic} Real-World Application`
    },
    {
      question: `What is the most effective strategy to retain mastery over ${cleanTopic}?`,
      options: [
        `Active recall, spaced repetition, and practical problem-solving exercises`,
        `Passive rereading without testing knowledge retention`,
        `Cramming the night before an assessment and never reviewing`,
        `Avoiding diagnostic quizzes and practice questions`
      ],
      correctAnswerIndex: 0,
      explanation: `Educational research shows active recall testing and spaced practice lead to the highest long-term retention of subject matter.`,
      topicConcept: `${cleanTopic} Knowledge Retention`
    }
  ];

  const genericQuestions = genericBase.map((q, idx) => {
    const shuffled = shuffleOptionsAndFixIndex(q);
    return {
      id: idx + 1,
      question: shuffled.question,
      options: shuffled.options,
      correctAnswerIndex: shuffled.correctAnswerIndex,
      correctAnswer: shuffled.options[shuffled.correctAnswerIndex],
      explanation: shuffled.explanation,
      topicConcept: shuffled.topicConcept
    };
  });

  return {
    topic: cleanTopic,
    difficulty,
    isFallback: true,
    totalQuestions: 5,
    questions: genericQuestions,
    generatedAt: new Date().toISOString()
  };
}

/**
 * Generates structured revision feedback if AI call is unavailable
 */
export function generateFallbackRevision({ topic, score, totalQuestions, incorrectAnswers = [] }) {
  const percentage = Math.round((score / totalQuestions) * 100);

  let summary = '';
  if (score === totalQuestions) {
    summary = `Outstanding score! You achieved 100% (${score}/${totalQuestions}) in ${topic}. You demonstrate strong conceptual mastery across all tested areas.`;
  } else if (score >= 3) {
    summary = `Great job! You scored ${score}/${totalQuestions} (${percentage}%) in ${topic}. You have a solid grasp of the core concepts with just a few specific areas to review.`;
  } else {
    summary = `Good effort! You scored ${score}/${totalQuestions} (${percentage}%) in ${topic}. Reviewing the targeted concepts below will significantly boost your retention and confidence.`;
  }

  const keyMisconceptions = incorrectAnswers.map(item => ({
    concept: item.topicConcept || topic,
    questionSummary: item.question,
    yourAnswer: item.selectedAnswer,
    correctAnswer: item.correctAnswer,
    explanation: item.explanation,
    advice: `Focus on why "${item.correctAnswer}" applies here. Notice how the explanation clarifies the mechanism.`
  }));

  const revisionPlan = incorrectAnswers.length > 0
    ? incorrectAnswers.map((item, idx) => `Step ${idx + 1}: Study "${item.topicConcept || topic}" — review the distinction between your selected answer and the verified solution.`)
    : [
        `Step 1: Explore advanced topics and edge cases in ${topic} to deepen your knowledge.`,
        `Step 2: Try generating a "Hard" difficulty quiz to test complex scenarios.`,
        `Step 3: Teach or explain these concepts to a classmate or write a mini study summary.`
      ];

  const recommendedResources = [
    `Official documentation and authoritative guides for ${topic}`,
    `Flashcard review focusing on: ${incorrectAnswers.map(a => a.topicConcept).filter(Boolean).join(', ') || topic}`,
    `Practice problems highlighting foundational definitions and edge cases`
  ];

  return {
    summary,
    score,
    totalQuestions,
    percentage,
    isFallback: true,
    keyMisconceptions,
    revisionPlan,
    recommendedResources,
    generatedAt: new Date().toISOString()
  };
}
