// All content here comes from the owner's CV. Nothing is invented:
// no metrics, links, dates or achievements beyond what the CV states.

export const profile = {
  name: 'Maooz Gul',
  first: 'Maooz',
  last: 'Gul',
  roles: ['AI Engineer', 'Developer', 'Creative Builder'],
  tagline: 'Building intelligent systems and immersive digital experiences.',
  about:
    'Computer Science graduate with a strong interest in Artificial Intelligence, Cybersecurity and Web Development. During my degree I worked on academic and research projects involving AI-based intrusion detection, IoT, databases and web applications.',
  aim: 'Passionate about developing practical technology solutions, and aiming to go further through advanced research in AI and cybersecurity.',
  passions: [
    'Artificial Intelligence',
    'Machine Learning & Data Mining',
    'Cybersecurity',
    'Web Development',
    'Creative digital experiences',
  ],
  email: 'maoozgul20@gmail.com',
  github: 'https://github.com/maoozgul20',
  githubLabel: 'github.com/maoozgul20',
  location: 'Peshawar, Pakistan',
  cv: '/Maooz_Gul_CV.pdf',
}

export const education = {
  degree: 'Bachelors in Computer Science',
  school: 'Qurtuba University of Science & IT',
  place: 'Peshawar, Pakistan',
  period: 'Sep 2022 – Nov 2026',
  coursework: [
    'Computer Programming',
    'Data Structures',
    'Algorithms',
    'Database Management Systems',
    'Software Engineering',
    'Operating Systems',
    'Computer Networks',
    'Web Development',
  ],
}

export const experience = [
  {
    role: 'Graphic Designer',
    org: 'Travel Agency',
    place: 'Peshawar, Pakistan',
    period: 'Aug 2024 – Jan 2025',
    text: 'Designed promotional and social media visuals for a travel agency.',
  },
  {
    role: 'ISPR Internship',
    org: 'ISPR, Pakistan Army',
    place: 'Peshawar, Pakistan',
    period: 'Jun 2024 – Aug 2024',
    text: 'Internship experience developing professional discipline, teamwork and practical workplace skills.',
  },
]

export const research = [
  { title: 'Artificial Intelligence', text: 'Machine Learning · Deep Learning' },
  { title: 'Cybersecurity', text: 'Intrusion Detection Systems · Anomaly Detection' },
  { title: 'Medical Image Analysis', text: 'Computer Vision for healthcare imaging' },
  { title: 'Data Mining', text: 'Finding structure and signal in data' },
]

export const projects = [
  {
    id: 'dentora',
    index: '01',
    title: 'Dentora',
    subtitle: 'Mobile-Integrated Dental X-ray Detection',
    world: 'AI medical laboratory',
    status: 'Final Year Project',
    accent: '#00E5FF',
    description:
      'An Android app where a YOLO11s model detects nine findings in dental panoramic X-rays and shows them on the phone.',
    tags: ['YOLOv11', 'Android', 'Computer Vision'],
    overview:
      'Dentora brings dental X-ray screening to a phone. A YOLO11s object-detection model reads a panoramic X-ray and marks what it finds directly on the image, inside an app built around the people who use it.',
    features: [
      'Detects nine findings in dental panoramic X-rays, including caries, apical periodontitis, implants and missing teeth',
      'Detections are drawn on the X-ray and shown on the phone',
      'Separate patient, dentist and admin roles',
      'Model trained on the OralXrays-9 dataset',
    ],
    architecture: ['Panoramic X-ray', 'YOLO11s detector', 'Nine finding classes', 'Android app', 'Patient · Dentist · Admin'],
    facts: [
      { value: '9', label: 'findings detected' },
      { value: 'YOLO11s', label: 'detection model' },
      { value: '3', label: 'user roles' },
    ],
  },
  {
    id: 'notegpt',
    index: '02',
    title: 'NoteGPT',
    subtitle: 'RAG Chat over Course Notes',
    world: 'Floating archive of notes',
    status: 'Academic Project',
    accent: '#7CF5FF',
    description:
      'A Retrieval-Augmented Generation website that answers questions from 13 sets of AI course notes and shows the exact passages it used.',
    tags: ['React', 'FastAPI', 'Groq', 'Vercel'],
    overview:
      'NoteGPT answers questions from AI course notes rather than from guesswork. Every answer is grounded in retrieved passages, the passages are shown next to it, and weak matches are flagged instead of being papered over.',
    features: [
      'Answers from 13 sets of AI course notes, split into 1,342 chunks',
      'MiniLM embeddings with hybrid vector + TF-IDF search',
      'Shows the exact passages used for each answer',
      'Flags weak matches instead of guessing',
    ],
    architecture: ['13 note sets', '1,342 chunks', 'MiniLM embeddings', 'Hybrid vector + TF-IDF search', 'Groq LLM answer + passages'],
    facts: [
      { value: '13', label: 'sets of course notes' },
      { value: '1,342', label: 'indexed chunks' },
      { value: '12', label: 'automated tests passing' },
    ],
  },
  {
    id: 'health',
    index: '03',
    title: 'Ask the Health Library',
    subtitle: 'Medical RAG',
    world: 'Holographic health library',
    status: 'Academic Project',
    accent: '#00BFA6',
    description:
      'A RAG system that answers health questions only from 13 NIH patient guides, with numbered citations and a coverage check.',
    tags: ['Next.js', 'Groq', 'Vercel', 'RAG'],
    overview:
      'Health answers should come from somewhere you can check. Ask the Health Library answers only from NIH patient guides, cites each passage by number, and tells you when the library does not cover the question.',
    features: [
      'Answers only from 13 NIH patient guides (4,541 passages)',
      'Numbered citations on every answer',
      'Coverage check for questions the library cannot answer',
      'Option to compare against the model without the library',
    ],
    architecture: ['13 NIH patient guides', '4,541 passages', 'Retrieval', 'Coverage check', 'Cited answer (Groq)'],
    facts: [
      { value: '13', label: 'NIH patient guides' },
      { value: '4,541', label: 'passages' },
      { value: '[1] [2]', label: 'numbered citations' },
    ],
  },
  {
    id: 'odyssey',
    index: '04',
    title: 'ODYSSEY',
    subtitle: 'Space RAG over NASA Data',
    world: 'Deep-space observatory',
    status: 'Academic Project',
    accent: '#FFB86B',
    description:
      'A space-mission website with five kinds of RAG over real NASA data: Apollo 13 transcripts, Mars images and about 6,000 exoplanets.',
    tags: ['Next.js', 'FastAPI', 'Supabase pgvector', 'Groq'],
    overview:
      'ODYSSEY explores real NASA data through retrieval. Five kinds of RAG sit behind one space-mission site, from mission transcripts to image search to a catalogue of exoplanets.',
    features: [
      'Five kinds of RAG over real NASA data',
      'Apollo 13 transcripts, Mars images (CLIP) and about 6,000 exoplanets',
      'Hybrid search with reranking',
      'Measured on a 25-question evaluation',
    ],
    architecture: ['NASA data', 'Supabase pgvector', 'Hybrid search', 'Reranking', 'Groq LLM answer'],
    facts: [
      { value: '8% → 32%', label: 'Hit@1 with hybrid search + reranking' },
      { value: '~6,000', label: 'exoplanets' },
      { value: '5', label: 'kinds of RAG' },
    ],
  },
]

export const skillGroups = [
  {
    name: 'AI & Machine Learning',
    color: '#00E5FF',
    skills: [
      { name: 'Machine Learning', note: 'Core technical skill and research direction, alongside deep learning.' },
      { name: 'Computer Vision', note: 'YOLO11s detection on dental panoramic X-rays in Dentora; CLIP image search in ODYSSEY.' },
      { name: 'RAG', note: 'Retrieval-Augmented Generation in NoteGPT, Ask the Health Library and ODYSSEY.' },
      { name: 'Hybrid Search', note: 'Vector + TF-IDF search with MiniLM embeddings (NoteGPT); hybrid search with reranking (ODYSSEY).' },
    ],
  },
  {
    name: 'Development',
    color: '#7CF5FF',
    skills: [
      { name: 'React', note: 'Front end of NoteGPT.' },
      { name: 'Next.js', note: 'Ask the Health Library and ODYSSEY.' },
      { name: 'FastAPI', note: 'Back end for NoteGPT and ODYSSEY.' },
      { name: 'Android', note: 'The Dentora mobile app.' },
      { name: 'HTML5 & CSS3', note: 'Web technologies listed on my CV.' },
      { name: 'pgvector', note: 'Supabase pgvector as the vector store in ODYSSEY.' },
    ],
  },
  {
    name: 'Cybersecurity',
    color: '#00BFA6',
    skills: [
      { name: 'Intrusion Detection', note: 'Academic and research work on AI-based intrusion detection.' },
      { name: 'Anomaly Detection', note: 'A research interest within cybersecurity.' },
    ],
  },
  {
    name: 'Creative',
    color: '#C9D6E8',
    skills: [
      { name: 'Graphic Design', note: 'Promotional and social media visuals as a Graphic Designer (Aug 2024 – Jan 2025).' },
      { name: 'Social Media', note: 'Social media and digital media marketing.' },
    ],
  },
]

export const allSkills = skillGroups.flatMap((g) => g.skills.map((s) => ({ ...s, group: g.name, color: g.color })))

// Sections in scroll order. Each one is a camera station in the 3D world.
export const sections = [
  { id: 'home', nav: 'Home' },
  { id: 'about', nav: 'About' },
  { id: 'projects', nav: 'Projects' }, // Dentora
  { id: 'project-notegpt' },
  { id: 'project-health' },
  { id: 'project-odyssey' },
  { id: 'skills', nav: 'Skills' },
  { id: 'experience', nav: 'Experience' },
  { id: 'research', nav: 'Research' },
  { id: 'contact', nav: 'Contact' },
]
export const navItems = sections.filter((s) => s.nav)
