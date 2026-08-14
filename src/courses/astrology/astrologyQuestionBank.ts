export const zodiacSigns = [
  'Aries',
  'Taurus',
  'Gemini',
  'Cancer',
  'Leo',
  'Virgo',
  'Libra',
  'Scorpio',
  'Sagittarius',
  'Capricorn',
  'Aquarius',
  'Pisces',
] as const;

export type ZodiacSign = (typeof zodiacSigns)[number];

export const astrologyTopicDefinitions = [
  {
    id: 'elements',
    title: 'Elements',
    summary: 'Recognize the Fire, Earth, Air, and Water families of the zodiac.',
    skillTitle: 'Identify zodiac elements',
    skillDescription: 'Classify zodiac signs by their traditional elemental family.',
  },
  {
    id: 'modalities',
    title: 'Modalities',
    summary: 'Distinguish the Cardinal, Fixed, and Mutable modes of expression.',
    skillTitle: 'Identify zodiac modalities',
    skillDescription: 'Classify zodiac signs by their Cardinal, Fixed, or Mutable modality.',
  },
  {
    id: 'date-ranges',
    title: 'Date Ranges',
    summary: 'Connect commonly used tropical zodiac dates with their signs.',
    skillTitle: 'Recall zodiac date ranges',
    skillDescription: 'Match common tropical zodiac date ranges to their signs.',
  },
  {
    id: 'body-parts',
    title: 'Body Parts',
    summary: 'Study the body correspondences used in traditional medical astrology.',
    skillTitle: 'Recall traditional body correspondences',
    skillDescription: 'Match signs with body correspondences found in astrological tradition.',
  },
  {
    id: 'traits',
    title: 'Traits',
    summary: 'Recognize the archetypal qualities traditionally associated with each sign.',
    skillTitle: 'Recognize zodiac archetypes',
    skillDescription: 'Identify signs from their commonly taught archetypal traits.',
  },
  {
    id: 'planetary-rulers',
    title: 'Planetary Rulers',
    summary: 'Connect signs with their traditional planetary rulers.',
    skillTitle: 'Recall planetary rulers',
    skillDescription: 'Match zodiac signs to their traditional planetary rulers.',
  },
  {
    id: 'polarity',
    title: 'Polarity',
    summary: 'Distinguish the Yin and Yang groupings used in astrology.',
    skillTitle: 'Classify zodiac polarity',
    skillDescription: 'Classify signs by the traditional Yin and Yang polarities.',
  },
  {
    id: 'opposites',
    title: 'Opposites',
    summary: 'Recall the six complementary sign pairs across the zodiac wheel.',
    skillTitle: 'Identify opposite signs',
    skillDescription: 'Match each zodiac sign with the sign opposite it on the wheel.',
  },
] as const;

export type AstrologyTopicId = (typeof astrologyTopicDefinitions)[number]['id'];

export interface AstrologyQuestionSeed {
  readonly id: string;
  readonly prompt: string;
  readonly topicId: AstrologyTopicId;
  readonly correctAnswers: readonly ZodiacSign[];
  readonly explanation: string;
}

export const astrologyQuestionBank = [
  {
    id: 'water-signs',
    prompt: 'Which signs are Water signs?',
    topicId: 'elements',
    correctAnswers: ['Cancer', 'Scorpio', 'Pisces'],
    explanation:
      'Cancer, Scorpio, and Pisces are the Water signs. Water symbolizes emotion, intuition, sensitivity, and depth in astrological tradition.',
  },
  {
    id: 'fire-signs',
    prompt: 'Which signs are Fire signs?',
    topicId: 'elements',
    correctAnswers: ['Aries', 'Leo', 'Sagittarius'],
    explanation:
      'Aries, Leo, and Sagittarius are the Fire signs. Fire symbolizes passion, energy, action, enthusiasm, and courage.',
  },
  {
    id: 'earth-signs',
    prompt: 'Which signs are Earth signs?',
    topicId: 'elements',
    correctAnswers: ['Taurus', 'Virgo', 'Capricorn'],
    explanation:
      'Taurus, Virgo, and Capricorn are the Earth signs. Earth symbolizes stability, practicality, reliability, and tangible results.',
  },
  {
    id: 'air-signs',
    prompt: 'Which signs are Air signs?',
    topicId: 'elements',
    correctAnswers: ['Gemini', 'Libra', 'Aquarius'],
    explanation:
      'Gemini, Libra, and Aquarius are the Air signs. Air symbolizes intellect, communication, ideas, and social connection.',
  },
  {
    id: 'cardinal-signs',
    prompt: 'Which signs are Cardinal signs?',
    topicId: 'modalities',
    correctAnswers: ['Aries', 'Cancer', 'Libra', 'Capricorn'],
    explanation:
      'Aries, Cancer, Libra, and Capricorn are Cardinal signs. They begin the four seasons and are traditionally associated with initiative and leadership.',
  },
  {
    id: 'fixed-signs',
    prompt: 'Which signs are Fixed signs?',
    topicId: 'modalities',
    correctAnswers: ['Taurus', 'Leo', 'Scorpio', 'Aquarius'],
    explanation:
      'Taurus, Leo, Scorpio, and Aquarius are Fixed signs. They occupy the middle of each season and are associated with stability and determination.',
  },
  {
    id: 'mutable-signs',
    prompt: 'Which signs are Mutable signs?',
    topicId: 'modalities',
    correctAnswers: ['Gemini', 'Virgo', 'Sagittarius', 'Pisces'],
    explanation:
      'Gemini, Virgo, Sagittarius, and Pisces are Mutable signs. They close each season and are associated with flexibility, transition, and adaptation.',
  },
  {
    id: 'march-21',
    prompt: 'Which sign commonly starts on March 21?',
    topicId: 'date-ranges',
    correctAnswers: ['Aries'],
    explanation:
      'Aries commonly begins on March 21 near the March equinox and opens the tropical zodiac cycle.',
  },
  {
    id: 'july-23-august-22',
    prompt: 'Which sign commonly covers July 23 to August 22?',
    topicId: 'date-ranges',
    correctAnswers: ['Leo'],
    explanation: 'Leo commonly covers July 23 to August 22 and is the fifth sign of the zodiac.',
  },
  {
    id: 'september-23-october-22',
    prompt: 'Which sign commonly covers September 23 to October 22?',
    topicId: 'date-ranges',
    correctAnswers: ['Libra'],
    explanation:
      'Libra commonly covers September 23 to October 22 and begins near the September equinox.',
  },
  {
    id: 'december-22-january-19',
    prompt: 'Which sign commonly covers December 22 to January 19?',
    topicId: 'date-ranges',
    correctAnswers: ['Capricorn'],
    explanation:
      'Capricorn commonly covers December 22 to January 19 and begins near the December solstice.',
  },
  {
    id: 'april-20-may-20',
    prompt: 'Which sign commonly covers April 20 to May 20?',
    topicId: 'date-ranges',
    correctAnswers: ['Taurus'],
    explanation: 'Taurus commonly covers April 20 to May 20 and follows Aries in the zodiac cycle.',
  },
  {
    id: 'october-23-november-21',
    prompt: 'Which sign commonly covers October 23 to November 21?',
    topicId: 'date-ranges',
    correctAnswers: ['Scorpio'],
    explanation: 'Scorpio commonly covers October 23 to November 21 and follows Libra.',
  },
  {
    id: 'february-19-march-20',
    prompt: 'Which sign commonly covers February 19 to March 20?',
    topicId: 'date-ranges',
    correctAnswers: ['Pisces'],
    explanation:
      'Pisces commonly covers February 19 to March 20 and closes the tropical zodiac cycle before Aries.',
  },
  {
    id: 'rules-heart',
    prompt: 'In traditional astrology, which sign is associated with the heart?',
    topicId: 'body-parts',
    correctAnswers: ['Leo'],
    explanation:
      'Traditional astrological correspondence associates Leo with the heart, spine, and upper back. This is a symbolic tradition, not medical guidance.',
  },
  {
    id: 'rules-head',
    prompt: 'In traditional astrology, which sign is associated with the head?',
    topicId: 'body-parts',
    correctAnswers: ['Aries'],
    explanation:
      'Traditional astrological correspondence associates Aries with the head and face. This is a symbolic tradition, not medical guidance.',
  },
  {
    id: 'rules-knees',
    prompt: 'In traditional astrology, which sign is associated with the knees?',
    topicId: 'body-parts',
    correctAnswers: ['Capricorn'],
    explanation:
      'Traditional astrological correspondence associates Capricorn with the knees and skeletal structure. This is a symbolic tradition, not medical guidance.',
  },
  {
    id: 'rules-stomach',
    prompt: 'In traditional astrology, which sign is associated with the stomach?',
    topicId: 'body-parts',
    correctAnswers: ['Cancer'],
    explanation:
      'Traditional astrological correspondence associates Cancer with the stomach and chest. This is a symbolic tradition, not medical guidance.',
  },
  {
    id: 'rules-feet',
    prompt: 'In traditional astrology, which sign is associated with the feet?',
    topicId: 'body-parts',
    correctAnswers: ['Pisces'],
    explanation:
      'Traditional astrological correspondence associates Pisces with the feet. This is a symbolic tradition, not medical guidance.',
  },
  {
    id: 'rules-throat',
    prompt: 'In traditional astrology, which sign is associated with the throat?',
    topicId: 'body-parts',
    correctAnswers: ['Taurus'],
    explanation:
      'Traditional astrological correspondence associates Taurus with the throat and neck. This is a symbolic tradition, not medical guidance.',
  },
  {
    id: 'rules-lungs',
    prompt: 'In traditional astrology, which sign is associated with the lungs and arms?',
    topicId: 'body-parts',
    correctAnswers: ['Gemini'],
    explanation:
      'Traditional astrological correspondence associates Gemini with the lungs, arms, and hands. This is a symbolic tradition, not medical guidance.',
  },
  {
    id: 'rules-intestines',
    prompt: 'In traditional astrology, which sign is associated with the intestines?',
    topicId: 'body-parts',
    correctAnswers: ['Virgo'],
    explanation:
      'Traditional astrological correspondence associates Virgo with the intestines and digestion. This is a symbolic tradition, not medical guidance.',
  },
  {
    id: 'rules-kidneys',
    prompt: 'In traditional astrology, which sign is associated with the kidneys?',
    topicId: 'body-parts',
    correctAnswers: ['Libra'],
    explanation:
      'Traditional astrological correspondence associates Libra with the kidneys and lower back. This is a symbolic tradition, not medical guidance.',
  },
  {
    id: 'rules-reproductive-organs',
    prompt: 'In traditional astrology, which sign is associated with the reproductive organs?',
    topicId: 'body-parts',
    correctAnswers: ['Scorpio'],
    explanation:
      'Traditional astrological correspondence associates Scorpio with the reproductive and elimination systems. This is a symbolic tradition, not medical guidance.',
  },
  {
    id: 'rules-thighs',
    prompt: 'In traditional astrology, which sign is associated with the thighs?',
    topicId: 'body-parts',
    correctAnswers: ['Sagittarius'],
    explanation:
      'Traditional astrological correspondence associates Sagittarius with the thighs and hips. This is a symbolic tradition, not medical guidance.',
  },
  {
    id: 'rules-ankles',
    prompt: 'In traditional astrology, which sign is associated with the ankles?',
    topicId: 'body-parts',
    correctAnswers: ['Aquarius'],
    explanation:
      'Traditional astrological correspondence associates Aquarius with the ankles and circulation. This is a symbolic tradition, not medical guidance.',
  },
  {
    id: 'trait-discipline',
    prompt: 'Which sign is traditionally associated with discipline and ambition?',
    topicId: 'traits',
    correctAnswers: ['Capricorn'],
    explanation:
      'Capricorn is commonly associated with discipline, ambition, persistence, structure, and long-term goals.',
  },
  {
    id: 'trait-nurturing',
    prompt: 'Which sign is traditionally associated with nurturing and emotional sensitivity?',
    topicId: 'traits',
    correctAnswers: ['Cancer'],
    explanation:
      'Cancer is commonly associated with nurturing, protectiveness, home, family, and emotional security.',
  },
  {
    id: 'trait-analytical',
    prompt: 'Which sign is traditionally associated with analysis and attention to detail?',
    topicId: 'traits',
    correctAnswers: ['Virgo'],
    explanation:
      'Virgo is commonly associated with analysis, organization, practicality, detail, and improving systems.',
  },
  {
    id: 'trait-adventurous',
    prompt: 'Which sign is traditionally associated with adventure and philosophy?',
    topicId: 'traits',
    correctAnswers: ['Sagittarius'],
    explanation:
      'Sagittarius is commonly associated with adventure, optimism, philosophy, travel, and the search for meaning.',
  },
  {
    id: 'trait-balance',
    prompt: 'Which sign is traditionally associated with balance and harmony?',
    topicId: 'traits',
    correctAnswers: ['Libra'],
    explanation:
      'Libra is commonly associated with balance, harmony, fairness, beauty, relationships, and diplomacy.',
  },
  {
    id: 'trait-intense',
    prompt: 'Which sign is traditionally associated with intensity and mystery?',
    topicId: 'traits',
    correctAnswers: ['Scorpio'],
    explanation:
      'Scorpio is commonly associated with intensity, depth, mystery, hidden truths, and transformation.',
  },
  {
    id: 'trait-innovative',
    prompt: 'Which sign is traditionally associated with innovation and humanitarianism?',
    topicId: 'traits',
    correctAnswers: ['Aquarius'],
    explanation:
      'Aquarius is commonly associated with innovation, independence, collective progress, and humanitarian ideals.',
  },
  {
    id: 'trait-dreamy',
    prompt: 'Which sign is traditionally associated with imagination and intuition?',
    topicId: 'traits',
    correctAnswers: ['Pisces'],
    explanation:
      'Pisces is commonly associated with imagination, intuition, compassion, spirituality, and empathy.',
  },
  {
    id: 'trait-bold',
    prompt: 'Which sign is traditionally associated with boldness and competition?',
    topicId: 'traits',
    correctAnswers: ['Aries'],
    explanation:
      'Aries is commonly associated with boldness, competition, courage, initiative, and a pioneering spirit.',
  },
  {
    id: 'trait-reliable',
    prompt: 'Which sign is traditionally associated with reliability and sensuality?',
    topicId: 'traits',
    correctAnswers: ['Taurus'],
    explanation:
      'Taurus is commonly associated with reliability, sensuality, determination, comfort, and material stability.',
  },
  {
    id: 'trait-curious',
    prompt: 'Which sign is traditionally associated with curiosity and communication?',
    topicId: 'traits',
    correctAnswers: ['Gemini'],
    explanation:
      'Gemini is commonly associated with curiosity, communication, versatility, social connection, and mental stimulation.',
  },
  {
    id: 'trait-confident',
    prompt: 'Which sign is traditionally associated with confidence and dramatic expression?',
    topicId: 'traits',
    correctAnswers: ['Leo'],
    explanation:
      'Leo is commonly associated with confidence, creativity, warmth, generosity, and dramatic self-expression.',
  },
  {
    id: 'ruler-mars',
    prompt: 'Which sign is traditionally ruled by Mars?',
    topicId: 'planetary-rulers',
    correctAnswers: ['Aries'],
    explanation:
      'Aries is traditionally ruled by Mars, a planet associated with action, drive, courage, and competition.',
  },
  {
    id: 'ruler-venus-taurus',
    prompt: 'Which Earth sign is traditionally ruled by Venus?',
    topicId: 'planetary-rulers',
    correctAnswers: ['Taurus'],
    explanation:
      'Taurus is the Earth sign ruled by Venus and expresses Venusian symbolism through beauty, comfort, and material pleasure.',
  },
  {
    id: 'ruler-mercury-gemini',
    prompt: 'Which Air sign is traditionally ruled by Mercury?',
    topicId: 'planetary-rulers',
    correctAnswers: ['Gemini'],
    explanation:
      'Gemini is the Air sign ruled by Mercury and expresses Mercurial symbolism through communication and curiosity.',
  },
  {
    id: 'ruler-moon',
    prompt: 'Which sign is traditionally ruled by the Moon?',
    topicId: 'planetary-rulers',
    correctAnswers: ['Cancer'],
    explanation:
      'Cancer is ruled by the Moon, traditionally associated with emotion, intuition, memory, and protection.',
  },
  {
    id: 'ruler-sun',
    prompt: 'Which sign is traditionally ruled by the Sun?',
    topicId: 'planetary-rulers',
    correctAnswers: ['Leo'],
    explanation:
      'Leo is ruled by the Sun, traditionally associated with vitality, identity, creativity, and radiance.',
  },
  {
    id: 'ruler-jupiter',
    prompt: 'Which Fire sign is traditionally ruled by Jupiter?',
    topicId: 'planetary-rulers',
    correctAnswers: ['Sagittarius'],
    explanation:
      'Sagittarius is the Fire sign ruled by Jupiter, traditionally associated with expansion, optimism, philosophy, and travel.',
  },
  {
    id: 'ruler-saturn',
    prompt: 'Which sign is most commonly taught as ruled by Saturn?',
    topicId: 'planetary-rulers',
    correctAnswers: ['Capricorn'],
    explanation:
      'Capricorn is ruled by Saturn, traditionally associated with discipline, structure, responsibility, and time. Traditional astrology also assigns Saturn to Aquarius.',
  },
  {
    id: 'masculine-signs',
    prompt: 'Which signs belong to the traditional Yang polarity?',
    topicId: 'polarity',
    correctAnswers: ['Aries', 'Gemini', 'Leo', 'Libra', 'Sagittarius', 'Aquarius'],
    explanation:
      'The Fire and Air signs—Aries, Gemini, Leo, Libra, Sagittarius, and Aquarius—form the traditional Yang polarity.',
  },
  {
    id: 'feminine-signs',
    prompt: 'Which signs belong to the traditional Yin polarity?',
    topicId: 'polarity',
    correctAnswers: ['Taurus', 'Cancer', 'Virgo', 'Scorpio', 'Capricorn', 'Pisces'],
    explanation:
      'The Earth and Water signs—Taurus, Cancer, Virgo, Scorpio, Capricorn, and Pisces—form the traditional Yin polarity.',
  },
  {
    id: 'opposite-aries',
    prompt: 'Which sign is opposite Aries on the zodiac wheel?',
    topicId: 'opposites',
    correctAnswers: ['Libra'],
    explanation:
      'Libra is opposite Aries. The pair contrasts individual action with partnership and cooperation.',
  },
  {
    id: 'opposite-taurus',
    prompt: 'Which sign is opposite Taurus on the zodiac wheel?',
    topicId: 'opposites',
    correctAnswers: ['Scorpio'],
    explanation:
      'Scorpio is opposite Taurus. The pair contrasts material stability with transformation and shared resources.',
  },
  {
    id: 'opposite-gemini',
    prompt: 'Which sign is opposite Gemini on the zodiac wheel?',
    topicId: 'opposites',
    correctAnswers: ['Sagittarius'],
    explanation:
      'Sagittarius is opposite Gemini. The pair contrasts gathering information with finding broad meaning.',
  },
  {
    id: 'opposite-cancer',
    prompt: 'Which sign is opposite Cancer on the zodiac wheel?',
    topicId: 'opposites',
    correctAnswers: ['Capricorn'],
    explanation:
      'Capricorn is opposite Cancer. The pair contrasts private emotional foundations with public responsibility.',
  },
  {
    id: 'opposite-leo',
    prompt: 'Which sign is opposite Leo on the zodiac wheel?',
    topicId: 'opposites',
    correctAnswers: ['Aquarius'],
    explanation:
      'Aquarius is opposite Leo. The pair contrasts personal creative expression with collective ideals.',
  },
  {
    id: 'opposite-virgo',
    prompt: 'Which sign is opposite Virgo on the zodiac wheel?',
    topicId: 'opposites',
    correctAnswers: ['Pisces'],
    explanation:
      'Pisces is opposite Virgo. The pair contrasts precise analysis with intuition and a holistic view.',
  },
] as const satisfies readonly AstrologyQuestionSeed[];
