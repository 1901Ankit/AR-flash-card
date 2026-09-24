import targetMindUrl from "../assets/marker/target.mind?url";
import target1MindUrl from "../assets/marker/target1.mind?url";
import gokuModelUrl from "../assets/goku.glb?url";
import dragonModelUrl from "../assets/dragon.glb?url";
import twoModelUrl from "../assets/2.glb?url";
import solarModelUrl from "../assets/solar.glb?url";
import jiraiyaVideoUrl from "../assets/jiraiya.mp4?url";
import gokuMarkerImg from "../assets/goku.png";
import dragonMarkerImg from "../assets/dragon.jpg";

// TODO: compile the Jiraiya card image into src/assets/marker/targetJiraiya.mind
// (https://hiukim.github.io/mind-ar-js-doc/tools/compile) then swap this for:
//   import targetJiraiyaMindUrl from "../assets/marker/targetJiraiya.mind?url";
const targetJiraiyaMindUrl = target1MindUrl; // placeholder — reuses existing marker

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
    markerPreview: gokuMarkerImg,
    model: {
      type: "glb",
      url: gokuModelUrl,
      targetHeight: 1.1,
      xOffset: 0,
      yOffset: 0,
      zOffset: 0,
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
    markerPreview: dragonMarkerImg,
    model: {
      type: "glb",
      url: dragonModelUrl,
      targetHeight: 1.15,
      xOffset: 0,
      yOffset: 0.05,
      zOffset: 0,
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
      targetHeight: 0.95,
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
    description: "Flip the physical storybook page to watch the magical ancient portal glow with gentle fairy chimes.",
    markerUrl: target1MindUrl,
    markerPreview: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80",
    model: {
      type: "procedural_portal",
      name: "Forest Portal",
      targetHeight: 0.95,
    },
    audio: {
      script: "Deep within the emerald woods, little Maya discovered the Whispering Portal. Step through if you dare!",
      pitch: 1.15,
      rate: 0.95,
      voiceName: "en-US",
    },
    pages: [
      {
        page: 1,
        title: "The Discovery",
        text: "Maya brushed aside the glowing moss to reveal ancient runes inscribed upon the stones.",
      },
      {
        page: 2,
        title: "The Portal Awakes",
        text: "With a hum of starlight, the doorway shimmered into life before her eyes.",
      },
    ],
    printLayout: {
      cardType: "storybook_page",
      dimensions: "8.5 x 11 inches storybook page",
      instructions: "Print on double-sided storybook paper.",
    },
  },
  {
    id: "two-gamebox",
    title: "TWO: Card Duelist",
    category: "gamebox",
    tagline: "Next-Gen Card Game Packaging",
    description: "Point your phone at the TWO game deck box to unlock 3D card battle preview.",
    markerUrl: targetMindUrl,
    markerPreview: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80",
    model: {
      type: "glb",
      url: twoModelUrl,
      targetHeight: 1.1,
      xOffset: 0,
      yOffset: 0,
      zOffset: 0,
    },
    audio: {
      script: "Prepare for combat! Shuffle your 50-card deck and draw 5 cards to begin your turn.",
      pitch: 1.0,
      rate: 1.0,
      voiceName: "en-US",
    },
    printLayout: {
      cardType: "deck_box",
      dimensions: "4 x 6 inches tuck box",
      instructions: "Fold and assemble standard tuck box.",
    },
  },
  {
    id: "solar-system-saturn",
    title: "Saturn & Ring System",
    category: "digital_story",
    tagline: "Interactive Space Encyclopedia",
    description: "Learn planetary science in AR. Watch Saturn's icy rings orbit in real-time right in your room.",
    markerUrl: target1MindUrl,
    markerPreview: "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=600&auto=format&fit=crop&q=80",
    model: {
      type: "procedural_solar",
      name: "Saturn & Ring System",
      targetHeight: 0.95,
    },
  },
  {
    id: "solar-system-digital-story",
    title: "Cosmic Odyssey",
    category: "digital_story",
    tagline: "Digital AR Story Universe",
    description: "Scan your tablet or desktop screen to launch an interactive 3D solar system planet directly above your device.",
    markerUrl: targetMindUrl,
    markerPreview: gokuMarkerImg,
    model: {
      type: "glb",
      url: solarModelUrl,
      targetHeight: 1.05,
    },
    // Content map: which content renders on which MindAR target index.
    // Add a video card later by compiling a 2nd image into the .mind file and
    // uncommenting the video entry below.
    targets: [
      { targetIndex: 0, type: "model" }, // solar.glb on the current card
      // { targetIndex: 1, type: "video", src: "/card-video.mp4", aspect: 1.5, loop: true },
    ],
    audio: {
      script: "Welcome to the solar system! Tap any planet to hear its story.",
      pitch: 1.0,
      rate: 0.95,
      voiceName: "en-US",
    },
    hotspots: {
      sun: {
        title: "The Sun",
        type: "Star (G-type)",
        distance: "0 AU — center of the solar system",
        size: "1.39 million km diameter",
        facts: [
          "One million Earths could fit inside the Sun",
          "Its core reaches 15 million °C",
          "Sunlight takes 8 minutes to reach Earth",
        ],
        script: "This is the Sun, a giant star at the center of our solar system. It gives us light and warmth, and it is so big that one million Earths could fit inside it!",
      },
      mercury: {
        title: "Mercury",
        type: "Rocky planet",
        distance: "0.39 AU · 58 million km",
        size: "4,879 km diameter",
        facts: [
          "Fastest planet — orbits the Sun in just 88 days",
          "Has almost no atmosphere",
          "Temperatures swing from -180°C to 430°C",
        ],
        script: "Mercury is the smallest planet and the closest to the Sun, 58 million kilometers away. It zooms around the Sun in just 88 days, faster than any other planet!",
      },
      venus: {
        title: "Venus",
        type: "Rocky planet",
        distance: "0.72 AU · 108 million km",
        size: "12,104 km diameter",
        facts: [
          "Hottest planet at 465°C — hotter than Mercury",
          "Spins backwards compared to most planets",
          "A day on Venus is longer than its year",
        ],
        script: "Venus is the hottest planet in our solar system. Thick clouds trap heat like a giant blanket, making it even hotter than Mercury!",
      },
      earth: {
        title: "Earth",
        type: "Rocky planet",
        distance: "1 AU · 150 million km",
        size: "12,742 km diameter",
        facts: [
          "The only known planet with life",
          "71% of the surface is covered by oceans",
          "Has one natural satellite — the Moon",
        ],
        script: "Earth is our home planet! It is the only planet we know with oceans of liquid water, breathable air, and living things.",
      },
      mars: {
        title: "Mars",
        type: "Rocky planet",
        distance: "1.52 AU · 228 million km",
        size: "6,779 km diameter",
        facts: [
          "Home to Olympus Mons, the tallest volcano — 3× Mount Everest",
          "Looks red because of iron-rich dust",
          "Has two tiny moons, Phobos and Deimos",
        ],
        script: "Mars is called the Red Planet because of its rusty red dust. It has the tallest volcano in the solar system, Olympus Mons, almost three times taller than Mount Everest!",
      },
      jupiter: {
        title: "Jupiter",
        type: "Gas giant",
        distance: "5.2 AU · 778 million km",
        size: "139,820 km diameter",
        facts: [
          "The largest planet — 1,300 Earths could fit inside",
          "The Great Red Spot is a storm bigger than Earth",
          "Has at least 95 known moons",
        ],
        script: "Jupiter is the giant of our solar system! Its Great Red Spot is a storm bigger than the whole Earth that has been raging for hundreds of years.",
      },
      saturn: {
        title: "Saturn",
        type: "Gas giant",
        distance: "9.6 AU · 1.4 billion km",
        size: "116,460 km diameter",
        facts: [
          "Its rings are made of billions of ice and rock pieces",
          "So light it could float in a giant ocean",
          "Has 146 known moons — the most of any planet",
        ],
        script: "Saturn is famous for its beautiful rings, made of billions of pieces of ice and rock. It is so light it could float in a giant bathtub of water!",
      },
      uranus: {
        title: "Uranus",
        type: "Ice giant",
        distance: "19.2 AU · 2.9 billion km",
        size: "50,724 km diameter",
        facts: [
          "Spins on its side, tilted 98 degrees",
          "Coldest planetary atmosphere at -224°C",
          "Looks blue-green because of methane gas",
        ],
        script: "Uranus is an ice giant that spins on its side like a rolling ball. It is freezing cold and looks blue-green because of methane gas in its air.",
      },
      neptune: {
        title: "Neptune",
        type: "Ice giant",
        distance: "30.1 AU · 4.5 billion km",
        size: "49,244 km diameter",
        facts: [
          "Farthest planet from the Sun",
          "Fastest winds in the solar system — 2,100 km/h",
          "First planet found by math before being seen",
        ],
        script: "Neptune is the farthest planet from the Sun. It has the fastest winds in the solar system, blowing faster than the speed of sound!",
      },
      moon: {
        title: "The Moon",
        type: "Natural satellite",
        distance: "384,400 km from Earth",
        size: "3,474 km diameter",
        facts: [
          "Its gravity pulls our oceans, creating tides",
          "The same side always faces Earth",
          "Only world beyond Earth visited by humans",
        ],
        script: "The Moon is Earth's best friend in space. It orbits around us and its gravity pulls our oceans, creating the tides.",
      },
      pluto: {
        title: "Pluto",
        type: "Dwarf planet",
        distance: "39.5 AU · 5.9 billion km",
        size: "2,377 km diameter",
        facts: [
          "Smaller than Earth's Moon",
          "Has a giant heart-shaped glacier",
          "Lives in the icy Kuiper Belt with 5 moons",
        ],
        script: "Pluto is a tiny dwarf planet far away in the icy Kuiper Belt. It is so small that even our Moon is bigger than Pluto!",
      },
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
  {
    id: "jiraiya-story",
    title: "Jiraiya — The Toad Sage",
    category: "digital_story",
    tagline: "Legendary Sannin Video Card",
    description: "Scan the Jiraiya card to play his story directly on the card surface.",
    markerUrl: targetMindUrl,
    markerPreview: gokuMarkerImg, 
    video: {
      type: "video",
      src: jiraiyaVideoUrl,
      fit: "contain", // fits within card boundaries without overflow or distortion
      aspect: 0.714, // standard trading card aspect ratio (2.5 / 3.5 inches)
      scale: 1.0,
      loop: true,
      autoplay: true, // muted autoplay on target-found (gesture rules apply)
    },
  },
];

/**
 * Fuzzy-match a GLB node/mesh name to a hotspot key.
 * e.g. "Planet_Mars_01" -> "mars"
 */
export function matchHotspotKey(nodeName = "", hotspots = {}) {
  const normalized = nodeName.toLowerCase().replace(/[^a-z]/g, "");
  if (!normalized) return null;
  return (
    Object.keys(hotspots).find((key) => normalized.includes(key)) || null
  );
}
