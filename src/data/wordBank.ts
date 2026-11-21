export type WordCategory = 'noun' | 'verb' | 'adjective' | 'adverb' | 'chunk';

export interface WordEntry {
  id: string;
  rawLabel: string;      // As listed in NEW WORDS (e.g., "brand (n)", "launch (v)")
  testDisplay: string;   // Formatted for test display (e.g., "brand", "to launch")
  category: WordCategory;
  definition: string;
  hebrew: string;        // Hebrew translation shown after finishing the test
}

export const WORD_BANK: WordEntry[] = [
  // Column 1
  {
    id: 'absorb',
    rawLabel: 'absorb',
    testDisplay: 'to absorb',
    category: 'verb',
    definition: 'take in liquid, gas, or information',
    hebrew: 'לספוג / לקלוט'
  },
  {
    id: 'access',
    rawLabel: 'access (v)',
    testDisplay: 'to access',
    category: 'verb',
    definition: 'be able to enter, reach, or use something',
    hebrew: 'לגשת ל- / להשיג גישה'
  },
  {
    id: 'appeal',
    rawLabel: 'appeal (n)',
    testDisplay: 'appeal',
    category: 'noun',
    definition: 'a quality that makes people like something',
    hebrew: 'משיכה / קסם / פנייה'
  },
  {
    id: 'artificially',
    rawLabel: 'artificially',
    testDisplay: 'artificially',
    category: 'adverb',
    definition: 'not naturally, made by human skill',
    hebrew: 'באופן מלאכותי'
  },
  {
    id: 'aspire',
    rawLabel: 'aspire',
    testDisplay: 'to aspire',
    category: 'verb',
    definition: 'strongly want to achieve something great',
    hebrew: 'לשאוף'
  },
  {
    id: 'atmosphere',
    rawLabel: 'atmosphere',
    testDisplay: 'atmosphere',
    category: 'noun',
    definition: 'the feeling or mood of a place, or gases around Earth',
    hebrew: 'אווירה / אטמוספירה'
  },
  {
    id: 'attraction',
    rawLabel: 'attraction',
    testDisplay: 'attraction',
    category: 'noun',
    definition: 'an interesting place or thing that people want to visit',
    hebrew: 'אטרקציה / מוקד משיכה'
  },
  {
    id: 'automatically',
    rawLabel: 'automatically',
    testDisplay: 'automatically',
    category: 'adverb',
    definition: 'by itself, without direct human control',
    hebrew: 'באופן אוטומטי'
  },
  {
    id: 'avoid',
    rawLabel: 'avoid',
    testDisplay: 'to avoid',
    category: 'verb',
    definition: 'stop oneself from doing something',
    hebrew: 'להימנע מ-'
  },
  {
    id: 'believe_it_or_not',
    rawLabel: 'believe it or not',
    testDisplay: 'believe it or not',
    category: 'chunk',
    definition: 'surprisingly, even though it sounds unlikely',
    hebrew: 'תאמינו או לא'
  },
  {
    id: 'brand',
    rawLabel: 'brand (n)',
    testDisplay: 'brand',
    category: 'noun',
    definition: 'a type of product made by a specific company',
    hebrew: 'מותג'
  },
  {
    id: 'cashier',
    rawLabel: 'cashier',
    testDisplay: 'cashier',
    category: 'noun',
    definition: 'a person whose job is to receive and pay out money in a store',
    hebrew: 'קופאי / קופאית'
  },
  {
    id: 'check_in',
    rawLabel: 'check in',
    testDisplay: 'check in',
    category: 'chunk',
    definition: 'register upon arriving at a hotel or airport',
    hebrew: 'לבצע רישום כניסה (צ׳ק-אין)'
  },
  {
    id: 'controversial',
    rawLabel: 'controversial',
    testDisplay: 'controversial',
    category: 'adjective',
    definition: 'causing a lot of public disagreement or argument',
    hebrew: 'שנוי במחלוקת'
  },
  {
    id: 'counteract',
    rawLabel: 'counteract',
    testDisplay: 'to counteract',
    category: 'verb',
    definition: 'act against something in order to reduce its bad effect',
    hebrew: 'לנטרל / לפעול נגד'
  },
  {
    id: 'critic',
    rawLabel: 'critic',
    testDisplay: 'critic',
    category: 'noun',
    definition: 'someone who judges or expresses disapproval of something',
    hebrew: 'מבקר'
  },
  {
    id: 'currently',
    rawLabel: 'currently',
    testDisplay: 'currently',
    category: 'adverb',
    definition: 'now, in the present',
    hebrew: 'כעת / נכון לעכשיו'
  },
  {
    id: 'cyberbullying',
    rawLabel: 'cyberbullying (n)',
    testDisplay: 'cyberbullying',
    category: 'noun',
    definition: 'using the internet to harm or frighten another person',
    hebrew: 'בריונות ברשת'
  },
  {
    id: 'determine',
    rawLabel: 'determine',
    testDisplay: 'to determine',
    category: 'verb',
    definition: 'discover the facts closely or officially decide something',
    hebrew: 'לקבוע / להחליט'
  },
  {
    id: 'developed',
    rawLabel: 'developed (adj)',
    testDisplay: 'developed',
    category: 'adjective',
    definition: 'advanced, having modern industry and a strong economy',
    hebrew: 'מפותח'
  },
  {
    id: 'disaster',
    rawLabel: 'disaster',
    testDisplay: 'disaster',
    category: 'noun',
    definition: 'a sudden event that causes great damage or suffering',
    hebrew: 'אסון'
  },
  {
    id: 'download',
    rawLabel: 'download',
    testDisplay: 'to download',
    category: 'verb',
    definition: 'copy data or a file from the internet to a computer',
    hebrew: 'להוריד (מהאינטרנט)'
  },
  {
    id: 'efficient',
    rawLabel: 'efficient',
    testDisplay: 'efficient',
    category: 'adjective',
    definition: 'working well and quickly without wasting time or energy',
    hebrew: 'יעיל'
  },
  {
    id: 'elderly',
    rawLabel: 'elderly',
    testDisplay: 'elderly',
    category: 'adjective',
    definition: 'old or aging',
    hebrew: 'קשיש / מבוגר'
  },
  {
    id: 'exchange',
    rawLabel: 'exchange',
    testDisplay: 'to exchange',
    category: 'verb',
    definition: 'give something and receive something else in return',
    hebrew: 'להחליף'
  },
  {
    id: 'expand',
    rawLabel: 'expand',
    testDisplay: 'to expand',
    category: 'verb',
    definition: 'become larger',
    hebrew: 'להתרחב / להרחיב'
  },
  {
    id: 'experiment',
    rawLabel: 'experiment (v)',
    testDisplay: 'to experiment',
    category: 'verb',
    definition: 'try out new ideas or methods to see what happens',
    hebrew: 'לערוך ניסוי / להתנסות'
  },
  {
    id: 'extreme',
    rawLabel: 'extreme',
    testDisplay: 'extreme',
    category: 'adjective',
    definition: 'very great in degree or intensity, far beyond normal',
    hebrew: 'קיצוני'
  },

  // Column 2
  {
    id: 'face',
    rawLabel: 'face (v)',
    testDisplay: 'to face',
    category: 'verb',
    definition: 'confront and deal with a difficult situation',
    hebrew: 'להתמודד עם / לעמוד בפני'
  },
  {
    id: 'fame',
    rawLabel: 'fame',
    testDisplay: 'fame',
    category: 'noun',
    definition: 'the state of being known by many people',
    hebrew: 'תהילה / פרסום'
  },
  {
    id: 'financially',
    rawLabel: 'financially',
    testDisplay: 'financially',
    category: 'adverb',
    definition: 'in a way that relates to money or finance',
    hebrew: 'מבחינה כלכלית / כספית'
  },
  {
    id: 'fingerprint',
    rawLabel: 'fingerprint',
    testDisplay: 'fingerprint',
    category: 'noun',
    definition: 'a mark left by the pattern of lines on the tip of a finger',
    hebrew: 'טביעת אצבע'
  },
  {
    id: 'fire',
    rawLabel: 'fire (v)',
    testDisplay: 'to fire',
    category: 'verb',
    definition: 'dismiss someone from a job',
    hebrew: 'לפטר'
  },
  {
    id: 'flood',
    rawLabel: 'flood (n)',
    testDisplay: 'flood',
    category: 'noun',
    definition: 'a large amount of water covering an area that is usually dry',
    hebrew: 'שיטפון / הצפה'
  },
  {
    id: 'for_the_moment',
    rawLabel: 'for the moment',
    testDisplay: 'for the moment',
    category: 'chunk',
    definition: 'for now, temporarily',
    hebrew: 'לעת עתה / כרגע'
  },
  {
    id: 'frustration',
    rawLabel: 'frustration',
    testDisplay: 'frustration',
    category: 'noun',
    definition: 'annoyance caused by being unable to achieve something',
    hebrew: 'תסכול'
  },
  {
    id: 'get_rid_of',
    rawLabel: 'get rid of',
    testDisplay: 'get rid of',
    category: 'chunk',
    definition: 'throw away or remove something unwanted',
    hebrew: 'להיפטר מ-'
  },
  {
    id: 'hardly',
    rawLabel: 'hardly',
    testDisplay: 'hardly',
    category: 'adverb',
    definition: 'barely, almost not at all',
    hebrew: 'בקושי / כמעט ולא'
  },
  {
    id: 'human_rights',
    rawLabel: 'human rights',
    testDisplay: 'human rights',
    category: 'chunk',
    definition: 'basic freedoms that every person in the world should have',
    hebrew: 'זכויות אדם'
  },
  {
    id: 'humanity',
    rawLabel: 'humanity',
    testDisplay: 'humanity',
    category: 'noun',
    definition: 'all human beings collectively; people in general',
    hebrew: 'אנושות'
  },
  {
    id: 'impact',
    rawLabel: 'impact (n)',
    testDisplay: 'impact',
    category: 'noun',
    definition: 'a strong effect or influence on someone or something',
    hebrew: 'השפעה / רושם'
  },
  {
    id: 'implication',
    rawLabel: 'implication',
    testDisplay: 'implication',
    category: 'noun',
    definition: 'a possible future effect or result of an action',
    hebrew: 'השלכה / משמעות'
  },
  {
    id: 'impressive',
    rawLabel: 'impressive',
    testDisplay: 'impressive',
    category: 'adjective',
    definition: 'causing admiration because of size, quality, or skill',
    hebrew: 'מרשים'
  },
  {
    id: 'in_place_of',
    rawLabel: 'in place of',
    testDisplay: 'in place of',
    category: 'chunk',
    definition: 'instead of someone or something else',
    hebrew: 'במקום (משהו אחר)'
  },
  {
    id: 'in_the_first_place',
    rawLabel: 'in the first place',
    testDisplay: 'in the first place',
    category: 'chunk',
    definition: 'at the beginning, or to start with',
    hebrew: 'מלכתחילה'
  },
  {
    id: 'in_the_long_run',
    rawLabel: 'in the long run',
    testDisplay: 'in the long run',
    category: 'chunk',
    definition: 'after a period of time, eventually',
    hebrew: 'בטווח הארוך / בסופו של דבר'
  },
  {
    id: 'in_the_meantime',
    rawLabel: 'in the meantime',
    testDisplay: 'in the meantime',
    category: 'chunk',
    definition: 'during the period of time between two events',
    hebrew: 'בינתיים'
  },
  {
    id: 'in_theory',
    rawLabel: 'in theory',
    testDisplay: 'in theory',
    category: 'chunk',
    definition: 'according to an idea that may not work in practice',
    hebrew: 'בתאוריה / להלכה'
  },
  {
    id: 'increasingly',
    rawLabel: 'increasingly',
    testDisplay: 'increasingly',
    category: 'adverb',
    definition: 'happening more and more',
    hebrew: 'במידה הולכת וגוברת'
  },
  {
    id: 'innovation',
    rawLabel: 'innovation',
    testDisplay: 'innovation',
    category: 'noun',
    definition: 'a new idea, method, or invention',
    hebrew: 'חדשנות / חידוש'
  },
  {
    id: 'instant',
    rawLabel: 'instant',
    testDisplay: 'instant',
    category: 'adjective',
    definition: 'immediate or direct',
    hebrew: 'מיידי'
  },
  {
    id: 'interact',
    rawLabel: 'interact',
    testDisplay: 'to interact',
    category: 'verb',
    definition: 'communicate or work together with others',
    hebrew: 'לתקשר / לקיים אינטראקציה'
  },
  {
    id: 'item',
    rawLabel: 'item',
    testDisplay: 'item',
    category: 'noun',
    definition: 'a thing or object',
    hebrew: 'פריט'
  },
  {
    id: 'keep_track_of',
    rawLabel: 'keep track of',
    testDisplay: 'keep track of',
    category: 'chunk',
    definition: 'stay informed about someone or something over time',
    hebrew: 'לעקוב אחר'
  },
  {
    id: 'launch',
    rawLabel: 'launch (v)',
    testDisplay: 'to launch',
    category: 'verb',
    definition: 'start or set in motion',
    hebrew: 'להשיק / לפתוח ב-'
  },
  {
    id: 'likely',
    rawLabel: 'likely',
    testDisplay: 'likely',
    category: 'adjective',
    definition: 'probable or expected to happen',
    hebrew: 'סביר / צפוי'
  },

  // Column 3
  {
    id: 'limited',
    rawLabel: 'limited (adj)',
    testDisplay: 'limited',
    category: 'adjective',
    definition: 'small in amount or number, restricted',
    hebrew: 'מוגבל / מצומצם'
  },
  {
    id: 'lower',
    rawLabel: 'lower (v)',
    testDisplay: 'to lower',
    category: 'verb',
    definition: 'reduce something in amount, degree, or strength',
    hebrew: 'להנמיך / להוריד / להפחית'
  },
  {
    id: 'make_sense',
    rawLabel: 'make sense',
    testDisplay: 'make sense',
    category: 'chunk',
    definition: 'be clear, logical, and easy to understand',
    hebrew: 'להיות הגיוני'
  },
  {
    id: 'marketing',
    rawLabel: 'marketing (n)',
    testDisplay: 'marketing',
    category: 'noun',
    definition: 'promoting and selling products',
    hebrew: 'שיווק'
  },
  {
    id: 'more_and_more',
    rawLabel: 'more and more',
    testDisplay: 'more and more',
    category: 'chunk',
    definition: 'in increasing quantities or amounts over time',
    hebrew: 'יותר ויותר'
  },
  {
    id: 'outcome',
    rawLabel: 'outcome',
    testDisplay: 'outcome',
    category: 'noun',
    definition: 'the final result or consequence of an action or event',
    hebrew: 'תוצאה'
  },
  {
    id: 'particular',
    rawLabel: 'particular',
    testDisplay: 'particular',
    category: 'adjective',
    definition: 'specific, special, or single and separate from others',
    hebrew: 'מסוים / ספציפי'
  },
  {
    id: 'personally',
    rawLabel: 'personally',
    testDisplay: 'personally',
    category: 'adverb',
    definition: 'from one\'s own individual point of view',
    hebrew: 'באופן אישי'
  },
  {
    id: 'planet',
    rawLabel: 'planet',
    testDisplay: 'planet',
    category: 'noun',
    definition: 'a large round object in space that moves around a star',
    hebrew: 'כוכב לכת'
  },
  {
    id: 'practically',
    rawLabel: 'practically',
    testDisplay: 'practically',
    category: 'adverb',
    definition: 'almost completely, or in a realistic and useful way',
    hebrew: 'כמעט / באופן מעשי'
  },
  {
    id: 'predict',
    rawLabel: 'predict',
    testDisplay: 'to predict',
    category: 'verb',
    definition: 'say what you think will happen in the future',
    hebrew: 'לחזות / לנבא'
  },
  {
    id: 'primarily',
    rawLabel: 'primarily',
    testDisplay: 'primarily',
    category: 'adverb',
    definition: 'mainly, for the most part',
    hebrew: 'בעיקר / בראש ובראשונה'
  },
  {
    id: 'priority',
    rawLabel: 'priority',
    testDisplay: 'priority',
    category: 'noun',
    definition: 'something that is treated as more important than other things',
    hebrew: 'עדיפות'
  },
  {
    id: 'private',
    rawLabel: 'private',
    testDisplay: 'private',
    category: 'adjective',
    definition: 'for the use of one person or group only, not public',
    hebrew: 'פרטי'
  },
  {
    id: 'process',
    rawLabel: 'process (v)',
    testDisplay: 'to process',
    category: 'verb',
    definition: 'treat or prepare materials or information through a series of steps',
    hebrew: 'לעבד'
  },
  {
    id: 'production',
    rawLabel: 'production',
    testDisplay: 'production',
    category: 'noun',
    definition: 'the act of making or manufacturing goods',
    hebrew: 'ייצור / הפקה'
  },
  {
    id: 'profession',
    rawLabel: 'profession',
    testDisplay: 'profession',
    category: 'noun',
    definition: 'a type of job that requires special education or training',
    hebrew: 'מקצוע'
  },
  {
    id: 'promising',
    rawLabel: 'promising (adj)',
    testDisplay: 'promising',
    category: 'adjective',
    definition: 'showing signs of future success',
    hebrew: 'מבטיח'
  },
  {
    id: 'promote',
    rawLabel: 'promote',
    testDisplay: 'to promote',
    category: 'verb',
    definition: 'encourage the popularity, sales, or development of something',
    hebrew: 'לקדם'
  },
  {
    id: 'pros_and_cons',
    rawLabel: 'pros and cons',
    testDisplay: 'pros and cons',
    category: 'chunk',
    definition: 'advantages and disadvantages',
    hebrew: 'יתרונות וחסרונות'
  },
  {
    id: 'protest',
    rawLabel: 'protest (v)',
    testDisplay: 'to protest',
    category: 'verb',
    definition: 'express strong objection to an action or policy',
    hebrew: 'למחות / להפגין'
  },
  {
    id: 'purchase',
    rawLabel: 'purchase (n)',
    testDisplay: 'purchase',
    category: 'noun',
    definition: 'something that you buy, or the act of buying',
    hebrew: 'רכישה / קנייה'
  },
  {
    id: 'recycle',
    rawLabel: 'recycle',
    testDisplay: 'to recycle',
    category: 'verb',
    definition: 'convert waste into reusable material',
    hebrew: 'למחזר'
  },
  {
    id: 'reflect',
    rawLabel: 'reflect',
    testDisplay: 'to reflect',
    category: 'verb',
    definition: 'show, express, or think deeply and carefully about something',
    hebrew: 'לשקף / להרהר'
  },
  {
    id: 'relate_to',
    rawLabel: 'relate to',
    testDisplay: 'relate to',
    category: 'chunk',
    definition: 'understand and feel sympathy for someone or something',
    hebrew: 'להזדהות עם / להתייחס ל-'
  },
  {
    id: 'representative',
    rawLabel: 'representative',
    testDisplay: 'representative',
    category: 'noun',
    definition: 'a person chosen to speak or act for a group',
    hebrew: 'נציג / נציגה'
  },
  {
    id: 'research',
    rawLabel: 'research (n)',
    testDisplay: 'research',
    category: 'noun',
    definition: 'careful study of a subject to discover new facts',
    hebrew: 'מחקר'
  },
  {
    id: 'reverse',
    rawLabel: 'reverse (v)',
    testDisplay: 'to reverse',
    category: 'verb',
    definition: 'change something to the opposite direction or state',
    hebrew: 'להפוך כיוון / לבטל'
  },

  // Column 4
  {
    id: 'review',
    rawLabel: 'review (v)',
    testDisplay: 'to review',
    category: 'verb',
    definition: 'examine or assess something carefully',
    hebrew: 'לסקור / לבחון מחדש'
  },
  {
    id: 'revolution',
    rawLabel: 'revolution',
    testDisplay: 'revolution',
    category: 'noun',
    definition: 'a huge, complete change in the way people live or work',
    hebrew: 'מהפכה'
  },
  {
    id: 'role',
    rawLabel: 'role',
    testDisplay: 'role',
    category: 'noun',
    definition: 'the function or part played by a person or thing',
    hebrew: 'תפקיד'
  },
  {
    id: 'run_out_of',
    rawLabel: 'run out of',
    testDisplay: 'run out of',
    category: 'chunk',
    definition: 'use up all of something so that none is left',
    hebrew: 'להיגמר / לאזול'
  },
  {
    id: 'rural',
    rawLabel: 'rural',
    testDisplay: 'rural',
    category: 'adjective',
    definition: 'in, relating to, or characteristic of the countryside',
    hebrew: 'כפרי'
  },
  {
    id: 'self_service',
    rawLabel: 'self-service',
    testDisplay: 'self-service',
    category: 'adjective',
    definition: 'where customers serve themselves and pay at a checkout',
    hebrew: 'שירות עצמי'
  },
  {
    id: 'set_an_example',
    rawLabel: 'set an example',
    testDisplay: 'set an example',
    category: 'chunk',
    definition: 'behave in a way that other people should copy',
    hebrew: 'לשמש דוגמה'
  },
  {
    id: 'significant',
    rawLabel: 'significant',
    testDisplay: 'significant',
    category: 'adjective',
    definition: 'important or large enough to be noticed',
    hebrew: 'משמעותי / חשוב'
  },
  {
    id: 'society',
    rawLabel: 'society',
    testDisplay: 'society',
    category: 'noun',
    definition: 'people living together in an organized community',
    hebrew: 'חברה'
  },
  {
    id: 'sponsor',
    rawLabel: 'sponsor (n)',
    testDisplay: 'sponsor',
    category: 'noun',
    definition: 'a person or company that pays for an event or activity',
    hebrew: 'נותן חסות (ספונסר)'
  },
  {
    id: 'spray',
    rawLabel: 'spray',
    testDisplay: 'to spray',
    category: 'verb',
    definition: 'send liquid through the air in tiny drops',
    hebrew: 'לרסס / להתיז'
  },
  {
    id: 'subscriber',
    rawLabel: 'subscriber',
    testDisplay: 'subscriber',
    category: 'noun',
    definition: 'someone who pays or signs up to receive a service or channel regularly',
    hebrew: 'מנוי / עוקב'
  },
  {
    id: 'surface',
    rawLabel: 'surface (n)',
    testDisplay: 'surface',
    category: 'noun',
    definition: 'the outside or top layer of something',
    hebrew: 'פני השטח / משטח'
  },
  {
    id: 'survey',
    rawLabel: 'survey (n)',
    testDisplay: 'survey',
    category: 'noun',
    definition: 'a set of questions asked to many people to find out their opinions',
    hebrew: 'סקר'
  },
  {
    id: 'take_action',
    rawLabel: 'take action',
    testDisplay: 'take action',
    category: 'chunk',
    definition: 'do something practical in order to deal with a problem',
    hebrew: 'לנקוט פעולה'
  },
  {
    id: 'take_over',
    rawLabel: 'take over',
    testDisplay: 'take over',
    category: 'chunk',
    definition: 'begin to have control of or responsibility for something',
    hebrew: 'להשתלט על / לתפוס פיקוד'
  },
  {
    id: 'take_seriously',
    rawLabel: 'take seriously',
    testDisplay: 'take seriously',
    category: 'chunk',
    definition: 'consider someone or something to be important and worth attention',
    hebrew: 'לקחת ברצינות'
  },
  {
    id: 'the_reality',
    rawLabel: 'the reality',
    testDisplay: 'the reality',
    category: 'chunk',
    definition: 'the true situation as it actually exists',
    hebrew: 'המציאות'
  },
  {
    id: 'theft',
    rawLabel: 'theft',
    testDisplay: 'theft',
    category: 'noun',
    definition: 'the action or crime of stealing',
    hebrew: 'גניבה'
  },
  {
    id: 'viewer',
    rawLabel: 'viewer',
    testDisplay: 'viewer',
    category: 'noun',
    definition: 'a person who watches something, especially television or videos',
    hebrew: 'צופה'
  },
  {
    id: 'virtually',
    rawLabel: 'virtually',
    testDisplay: 'virtually',
    category: 'adverb',
    definition: 'nearly, almost completely, or by means of a computer',
    hebrew: 'כמעט לחלוטין / באופן וירטואלי'
  },
  {
    id: 'warehouse',
    rawLabel: 'warehouse',
    testDisplay: 'warehouse',
    category: 'noun',
    definition: 'a large building where goods are stored',
    hebrew: 'מחסן'
  },
  {
    id: 'while',
    rawLabel: 'while',
    testDisplay: 'while',
    category: 'chunk',
    definition: 'during the time that, or at the same time as',
    hebrew: 'בזמן ש- / בעוד ש-'
  },
  {
    id: 'wise',
    rawLabel: 'wise',
    testDisplay: 'wise',
    category: 'adjective',
    definition: 'having experience, knowledge, and good judgment',
    hebrew: 'חכם / נבון'
  },
  {
    id: 'with_regard_to',
    rawLabel: 'with regard to',
    testDisplay: 'with regard to',
    category: 'chunk',
    definition: 'concerning or about a particular subject',
    hebrew: 'בנוגע ל- / ביחס ל-'
  },
  {
    id: 'you_never_know',
    rawLabel: 'you never know',
    testDisplay: 'you never know',
    category: 'chunk',
    definition: 'anything is possible in the future, so be prepared',
    hebrew: 'אי אפשר לדעת'
  }
];
