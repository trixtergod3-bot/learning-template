import type { ContentBlock } from '@/engine/domain/content';

import type { AstrologyTopicId } from './astrologyQuestionBank';

export interface AstrologyLessonDefinition {
  readonly topicId: AstrologyTopicId;
  readonly title: string;
  readonly blocks: readonly ContentBlock[];
}

export const astrologyLessonDefinitions = [
  {
    topicId: 'elements',
    title: 'The four elemental families',
    blocks: [
      {
        kind: 'paragraph',
        text: 'The twelve signs are grouped into four elements. Each element contains three signs and describes a broad style of motivation and expression in astrological tradition.',
      },
      { kind: 'heading', level: 3, text: 'The four groups' },
      {
        kind: 'key-facts',
        facts: [
          { label: 'Fire', value: 'Aries, Leo, Sagittarius — action, vitality, inspiration' },
          { label: 'Earth', value: 'Taurus, Virgo, Capricorn — form, practicality, stability' },
          { label: 'Air', value: 'Gemini, Libra, Aquarius — ideas, language, connection' },
          { label: 'Water', value: 'Cancer, Scorpio, Pisces — emotion, intuition, depth' },
        ],
      },
      {
        kind: 'callout',
        tone: 'tip',
        content:
          'Memory pattern: the elements repeat Fire → Earth → Air → Water three times around the zodiac, beginning with Aries.',
      },
      {
        kind: 'worked-example',
        title: 'Classify Aquarius',
        steps: [
          'Locate Aquarius after Capricorn in the zodiac sequence.',
          'Capricorn is Earth; the repeating sequence makes the next element Air.',
          'Therefore Aquarius belongs to the Air family with Gemini and Libra.',
        ],
      },
    ],
  },
  {
    topicId: 'modalities',
    title: 'Cardinal, Fixed, and Mutable modes',
    blocks: [
      {
        kind: 'paragraph',
        text: 'A modality describes how a sign operates within a season. Cardinal signs begin, Fixed signs sustain, and Mutable signs transition. Every element has one sign of each modality.',
      },
      {
        kind: 'table',
        columns: ['Modality', 'Function', 'Signs'],
        rows: [
          ['Cardinal', 'Initiates a season', 'Aries, Cancer, Libra, Capricorn'],
          ['Fixed', 'Stabilizes the middle', 'Taurus, Leo, Scorpio, Aquarius'],
          ['Mutable', 'Adapts at the end', 'Gemini, Virgo, Sagittarius, Pisces'],
        ],
      },
      {
        kind: 'callout',
        tone: 'tip',
        content: 'The modalities repeat Cardinal → Fixed → Mutable four times around the zodiac.',
      },
      {
        kind: 'example',
        title: 'Combine element and modality',
        steps: [
          'Leo is a Fire sign.',
          'Leo sits in the middle of the northern summer season, so it is Fixed.',
          'Its compact classification is Fixed Fire.',
        ],
      },
    ],
  },
  {
    topicId: 'date-ranges',
    title: 'The tropical zodiac calendar',
    blocks: [
      {
        kind: 'paragraph',
        text: 'The commonly taught tropical zodiac begins with Aries near the March equinox. The dates below are conventional study ranges; exact transitions can vary slightly by year, time, and source.',
      },
      {
        kind: 'table',
        columns: ['Sign', 'Common range', 'Sign', 'Common range'],
        rows: [
          ['Aries', 'Mar 21–Apr 19', 'Libra', 'Sep 23–Oct 22'],
          ['Taurus', 'Apr 20–May 20', 'Scorpio', 'Oct 23–Nov 21'],
          ['Gemini', 'May 21–Jun 20', 'Sagittarius', 'Nov 22–Dec 21'],
          ['Cancer', 'Jun 21–Jul 22', 'Capricorn', 'Dec 22–Jan 19'],
          ['Leo', 'Jul 23–Aug 22', 'Aquarius', 'Jan 20–Feb 18'],
          ['Virgo', 'Aug 23–Sep 22', 'Pisces', 'Feb 19–Mar 20'],
        ],
      },
      {
        kind: 'callout',
        tone: 'info',
        content:
          'This course teaches the tropical zodiac. It does not calculate a natal chart or replace the exact astronomical timestamp used by chart software.',
      },
      {
        kind: 'worked-example',
        title: 'Reason from the seasonal anchors',
        steps: [
          'Aries begins near the March equinox.',
          'Cancer begins near the June solstice, Libra near the September equinox, and Capricorn near the December solstice.',
          'The other signs fill the two positions between each of these four Cardinal anchors.',
        ],
      },
    ],
  },
  {
    topicId: 'body-parts',
    title: 'Traditional body correspondences',
    blocks: [
      {
        kind: 'paragraph',
        text: 'Traditional medical astrology maps the signs from head to feet in zodiac order. These are historical and symbolic correspondences, not medical diagnoses or health advice.',
      },
      {
        kind: 'table',
        columns: ['Sign', 'Traditional correspondence', 'Sign', 'Traditional correspondence'],
        rows: [
          ['Aries', 'Head and face', 'Libra', 'Kidneys and lower back'],
          ['Taurus', 'Throat and neck', 'Scorpio', 'Reproductive and elimination systems'],
          ['Gemini', 'Lungs, arms, and hands', 'Sagittarius', 'Hips and thighs'],
          ['Cancer', 'Chest and stomach', 'Capricorn', 'Knees and skeletal structure'],
          ['Leo', 'Heart, spine, and upper back', 'Aquarius', 'Ankles and circulation'],
          ['Virgo', 'Intestines and digestion', 'Pisces', 'Feet'],
        ],
      },
      {
        kind: 'callout',
        tone: 'warning',
        content:
          'Use this material only to learn an astrological tradition. For symptoms, diagnosis, or treatment, consult a qualified healthcare professional.',
      },
      {
        kind: 'callout',
        tone: 'tip',
        content: 'Memory pattern: move downward through the body as you move from Aries to Pisces.',
      },
    ],
  },
  {
    topicId: 'traits',
    title: 'Sign archetypes at a glance',
    blocks: [
      {
        kind: 'paragraph',
        text: 'Sign traits are compact archetypal keywords, not fixed descriptions of a person. Use them as recognition cues and combine them later with elements, modalities, and the rest of a chart.',
      },
      {
        kind: 'table',
        columns: ['Sign', 'Recognition cues', 'Sign', 'Recognition cues'],
        rows: [
          ['Aries', 'Bold, direct, pioneering', 'Libra', 'Diplomatic, relational, balanced'],
          ['Taurus', 'Steady, sensual, reliable', 'Scorpio', 'Intense, private, transformative'],
          [
            'Gemini',
            'Curious, verbal, versatile',
            'Sagittarius',
            'Adventurous, philosophical, expansive',
          ],
          [
            'Cancer',
            'Nurturing, protective, sensitive',
            'Capricorn',
            'Disciplined, ambitious, structured',
          ],
          ['Leo', 'Creative, warm, expressive', 'Aquarius', 'Innovative, independent, collective'],
          [
            'Virgo',
            'Analytical, practical, precise',
            'Pisces',
            'Imaginative, intuitive, compassionate',
          ],
        ],
      },
      {
        kind: 'worked-example',
        title: 'Build a richer cue',
        steps: [
          'Start with Virgo’s analytical and precise keywords.',
          'Add Earth for practicality and Mutable for adaptation.',
          'The combined cue is practical analysis applied flexibly to improve a system.',
        ],
      },
      {
        kind: 'callout',
        tone: 'info',
        content:
          'A full chart contains many placements and relationships. Avoid reducing a person to a single Sun-sign keyword.',
      },
    ],
  },
  {
    topicId: 'planetary-rulers',
    title: 'Traditional planetary rulers',
    blocks: [
      {
        kind: 'paragraph',
        text: 'Rulership links each sign to a planet whose symbolism is used to interpret it. This foundation teaches the traditional seven-planet system and notes the common modern co-rulers.',
      },
      {
        kind: 'table',
        columns: ['Planet', 'Traditional sign or signs', 'Core cue'],
        rows: [
          ['Sun', 'Leo', 'Identity and vitality'],
          ['Moon', 'Cancer', 'Emotion and memory'],
          ['Mercury', 'Gemini and Virgo', 'Thought and communication'],
          ['Venus', 'Taurus and Libra', 'Value and relationship'],
          ['Mars', 'Aries and Scorpio', 'Action and desire'],
          ['Jupiter', 'Sagittarius and Pisces', 'Expansion and meaning'],
          ['Saturn', 'Capricorn and Aquarius', 'Structure and responsibility'],
        ],
      },
      {
        kind: 'callout',
        tone: 'info',
        content:
          'Modern astrology commonly adds Uranus for Aquarius, Neptune for Pisces, and Pluto for Scorpio. Traditional rulership remains useful because it forms a complete, internally connected system.',
      },
      {
        kind: 'callout',
        tone: 'tip',
        content:
          'The lights rule one sign each. The other five traditional planets each rule a pair of signs arranged symmetrically around Cancer and Leo.',
      },
    ],
  },
  {
    topicId: 'polarity',
    title: 'Yin and Yang polarity',
    blocks: [
      {
        kind: 'paragraph',
        text: 'Polarity divides the zodiac into two alternating groups. In traditional terminology, Fire and Air are Yang or outward-oriented; Earth and Water are Yin or inward-oriented.',
      },
      {
        kind: 'key-facts',
        facts: [
          { label: 'Yang', value: 'Aries, Gemini, Leo, Libra, Sagittarius, Aquarius' },
          { label: 'Yin', value: 'Taurus, Cancer, Virgo, Scorpio, Capricorn, Pisces' },
        ],
      },
      {
        kind: 'callout',
        tone: 'info',
        content:
          'Polarity describes a symbolic direction of expression. It is not a statement about gender, identity, value, or personality quality.',
      },
      {
        kind: 'worked-example',
        title: 'Classify by element',
        steps: [
          'Identify Scorpio as a Water sign.',
          'Water belongs to the Yin grouping.',
          'Therefore Scorpio has Yin polarity.',
        ],
      },
    ],
  },
  {
    topicId: 'opposites',
    title: 'The six opposite pairs',
    blocks: [
      {
        kind: 'paragraph',
        text: 'Opposite signs sit six positions apart on the wheel. They share the same modality and compatible polarity, while expressing complementary ends of an axis.',
      },
      {
        kind: 'table',
        columns: ['Pair', 'Shared modality', 'Learning axis'],
        rows: [
          ['Aries ↔ Libra', 'Cardinal', 'Self and relationship'],
          ['Taurus ↔ Scorpio', 'Fixed', 'Possession and exchange'],
          ['Gemini ↔ Sagittarius', 'Mutable', 'Information and meaning'],
          ['Cancer ↔ Capricorn', 'Cardinal', 'Private roots and public duty'],
          ['Leo ↔ Aquarius', 'Fixed', 'Personal expression and collective ideals'],
          ['Virgo ↔ Pisces', 'Mutable', 'Analysis and synthesis'],
        ],
      },
      {
        kind: 'callout',
        tone: 'tip',
        content:
          'To find any opposite, count forward six signs. Doing it twice returns to the sign where you started.',
      },
      {
        kind: 'example',
        title: 'Find the opposite of Gemini',
        steps: [
          'Start at Gemini, the third sign.',
          'Move six signs forward around the wheel.',
          'You land on Sagittarius, so Gemini and Sagittarius form an axis.',
        ],
      },
    ],
  },
] as const satisfies readonly AstrologyLessonDefinition[];
