import targetMindUrl from "../assets/marker/target.mind?url";
import target1MindUrl from "../assets/marker/target1.mind?url";
import gokuModelUrl from "../assets/goku.glb?url";
import dragonModelUrl from "../assets/dragon.glb?url";
import twoModelUrl from "../assets/2.glb?url";

export const CATEGORIES = [
  { id: "all", label: "All Items", icon: "Sparkles" },
  { id: "flashcard", label: "Flashcards", icon: "Layers" },
  { id: "gamebox", label: "Game Boxes", icon: "Box" },
  { id: "physical_story", label: "Physical Storybooks", icon: "BookOpen" },
  { id: "digital_story", label: "Digital Stories", icon: "Smartphone" },
];

export const INITIAL_CATALOG = [
  {
    id: "goku-flashcard",
    title: "Goku (Super Saiyan)",
    category: "flashcard",
    tagline: "Legendary Warrior Flashcard",
    description: "Scan the card to summon Goku in full 3D with interactive battle voice lines and energy aura.",
    markerUrl: targetMindUrl,
    markerPreview: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80",
    model: {
      type: "glb",
      url: gokuModelUrl,
      targetHeight: 1.5,
      xOffset: 0,
      yOffset: 0,
      zOffset: 0,
      rotationSpeed: 0.3,
    },
    audio: {
      script: "I am Son Goku! Defender of Earth! Let us train together and break our limits!",
      pitch: 1.05,
      rate: 1.0,
      voiceName: "en-US",
    },
    quiz: {
      question: "What form gives Goku his golden aura and immense power?",
      options: ["Super Saiyan", "Ultra Speed", "Dragon Mode", "Shadow Form"],
      answer: 0,
    },
    printLayout: {
      cardType: "standard_flashcard",
      dimensions: "3.5 x 5 inches",
      instructions: "Print on heavy cardstock. Point AR camera at the card front.",
    },
  },
  {
    id: "dragon-flashcard",
    title: "Fire Dragon",
    category: "flashcard",
    tagline: "Mythical Creature Series",
    description: "Summon the legendary Fire Dragon hovering right above the physical card with fire roar audio.",
    markerUrl: target1MindUrl,
    markerPreview: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80",
    model: {
      type: "glb",
      url: dragonModelUrl,
      targetHeight: 1.6,
      xOffset: 0,
      yOffset: 0.1,
      zOffset: 0,
      rotationSpeed: 0.5,
    },
    audio: {
      script: "Roaaar! I am the Ancient Fire Dragon of the Northern Volcanoes! Beware my burning breath!",
      pitch: 0.7,
      rate: 0.9,
      voiceName: "en-US",
    },
    quiz: {
      question: "Where do Fire Dragons typically make their lairs?",
      options: ["Deep underwater", "Active Volcanoes & Caverns", "Snowy Tundra", "Cloud tops"],
      answer: 1,
    },
    printLayout: {
      cardType: "standard_flashcard",
      dimensions: "3.5 x 5 inches",
      instructions: "Print on matte paper for best AR tracking reflection.",
    },
  },
  {
    id: "cyber-arena-gamebox",
    title: "CyberQuest 3000",
    category: "gamebox",
    tagline: "Smart AR Board Game Packaging",
    description: "Scan the board game box lid to reveal an interactive 3D holographic battle arena and animated setup guide.",
    markerUrl: targetMindUrl,
    markerPreview: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80",
    model: {
      type: "procedural_arena",
      name: "Cyber Arena Hologram",
      targetHeight: 1.2,
      rotationSpeed: 0.8,
    },
    audio: {
      script: "Welcome to CyberQuest 3000! Place your game board on a flat table. Scan the side panels for player stats.",
      pitch: 1.2,
      rate: 1.05,
      voiceName: "en-US",
    },
    gameFeatures: [
      "Holographic 3D Unboxing Tutorial",
      "Interactive 3D Rulebook & Turn Indicator",
      "Side Panel Scanner for Secret Loot Cards",
    ],
    printLayout: {
      cardType: "game_box_lid",
      dimensions: "10 x 10 inches box top",
      instructions: "Print and glue to board game box cover.",
    },
  },
  {
    id: "enchanted-forest-story",
    title: "The Enchanted Forest",
    category: "physical_story",
    tagline: "Interactive Physical Storybook - Page 1",
    description: "Turn the physical book page and watch the forest diorama come alive with synchronized narrator voice and magical fairy lights.",
    markerUrl: target1MindUrl,
    markerPreview: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80",
    model: {
      type: "procedural_portal",
      name: "Enchanted Tree Portal",
      targetHeight: 1.4,
      rotationSpeed: 0.4,
    },
    audio: {
      script: "Once upon a time, deep inside the Enchanted Forest, the ancient guardian trees whispered secrets of a hidden realm...",
      pitch: 0.95,
      rate: 0.85,
      voiceName: "en-US",
    },
    pages: [
      { page: 1, title: "The Whispering Trees", text: "Oliver found an ancient glowing tree at the forest boundary." },
      { page: 2, title: "The Golden Dragon", text: "From the portal, a friendly baby dragon emerged." },
      { page: 3, title: "The Star Compass", text: "They embarked on a quest to restore the fallen star." },
    ],
    printLayout: {
      cardType: "storybook_page",
      dimensions: "8.5 x 11 inches (A4 Page)",
      instructions: "Print on standard A4 storybook paper. Marker auto-syncs with page audio.",
    },
  },
  {
    id: "solar-system-digital-story",
    title: "Cosmic Odyssey",
    category: "digital_story",
    tagline: "Digital AR Story Universe",
    description: "Scan your tablet or desktop screen to launch an interactive 3D solar system planet directly above your device.",
    markerUrl: targetMindUrl,
    markerPreview: "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=600&auto=format&fit=crop&q=80",
    model: {
      type: "procedural_solar",
      name: "Planet Jupiter & Rings",
      targetHeight: 1.5,
      rotationSpeed: 0.6,
    },
    audio: {
      script: "Behold Jupiter, the giant planet of our solar system! Its Great Red Spot is a storm bigger than Earth itself!",
      pitch: 1.0,
      rate: 0.95,
      voiceName: "en-US",
    },
    quiz: {
      question: "Which is the largest planet in our solar system?",
      options: ["Mars", "Jupiter", "Saturn", "Neptune"],
      answer: 1,
    },
    printLayout: {
      cardType: "digital_screen_marker",
      dimensions: "Responsive Screen Display",
      instructions: "Display on iPad or computer monitor and point phone camera.",
    },
  },
];
