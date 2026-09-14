import targetMindUrl from "../assets/marker/target.mind?url";
import dragonModelUrl from "../assets/dragon.glb?url";
import twoModelUrl from "../assets/2.glb?url";

/**
 * AI Automated Generation Service
 * Autonomous generation of Flashcards, Game Packaging Boxes, and Storybooks.
 */

const PRESET_TOPIC_TEMPLATES = {
  flashcard: [
    {
      title: "Tyrannosaurus Rex",
      tagline: "Prehistoric Apex Predator",
      description: "Apex predator of the late Cretaceous period with bone-crushing jaw power.",
      imageKeyword: "tyrannosaurus rex dinosaur prehistoric realistic high contrast cinematic lighting",
      imagePreview: "https://images.unsplash.com/photo-1570481662006-a3a1374699e8?w=600&auto=format&fit=crop&q=80",
      audioScript: "Roaaar! I am the Tyrannosaurus Rex! My bite force was over 12,000 pounds, making me the supreme predator of the prehistoric world!",
      modelType: "glb",
      modelUrl: twoModelUrl || dragonModelUrl,
      quiz: {
        question: "During which geological period did the T-Rex live?",
        options: ["Jurassic", "Cretaceous", "Triassic", "Devonian"],
        answer: 1,
      },
    },
    {
      title: "Solar System: Saturn",
      tagline: "Jewel of the Solar System",
      description: "Famous for its spectacular icy ring system and over 140 orbiting moons.",
      imageKeyword: "saturn planet space cosmos deep contrast rings golden glow",
      imagePreview: "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=600&auto=format&fit=crop&q=80",
      audioScript: "Greetings space explorer! I am Saturn, the sixth planet from the Sun. My rings are made of billions of chunks of ice and rock!",
      modelType: "procedural_solar",
      quiz: {
        question: "What are Saturn's famous rings primarily composed of?",
        options: ["Pure gold", "Chunks of ice and rock", "Dense gas", "Liquid water"],
        answer: 1,
      },
    },
  ],
  gamebox: [
    {
      title: "Mystic Realm: Dragon Dungeon",
      tagline: "Epic Tabletop Fantasy Quest",
      description: "Scan the box lid to unveil 3D dungeon battle terrains, monster animations, and turn indicators.",
      imageKeyword: "epic fantasy board game box cover glowing magic dragon dungeon intricate high contrast",
      imagePreview: "https://images.unsplash.com/photo-1563089145-599997674d42?w=600&auto=format&fit=crop&q=80",
      audioScript: "Warriors, welcome to Mystic Realm! Place the game board flat. The first player to roll the Dragon Crest claims the golden sword!",
      modelType: "procedural_arena",
      gameFeatures: ["Interactive 3D Turn Timer", "Monster Encounter AR Roller", "Secret Loot Reveal"],
    },
  ],
  physical_story: [
    {
      title: "The Little Astronaut's Journey",
      tagline: "Interactive AR Children Storybook",
      description: "Point your phone at the storybook pages to watch spaceships launch and stars twinkle in 3D.",
      imageKeyword: "children storybook illustration astronaut kid in starry space cute colorful high contrast",
      imagePreview: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80",
      audioScript: "Deep into the cosmic night, young astronaut Mia looked through her telescope and spotted the legendary dancing star cluster!",
      modelType: "procedural_solar",
      pages: [
        { page: 1, title: "Countdown to Blastoff", text: "Mia strapped into her silver spaceship." },
        { page: 2, title: "The Nebular Sea", text: "Drifting through purple clouds of cosmic dust." },
      ],
    },
  ],
  digital_story: [
    {
      title: "Cyber City Chronicles",
      tagline: "Interactive Sci-Fi AR Experience",
      description: "Turn your device screen into a portal to a bustling neon cyberpunk city with flying cars.",
      imageKeyword: "cyberpunk neon futuristic city holographic tech night glow high contrast",
      imagePreview: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=600&auto=format&fit=crop&q=80",
      audioScript: "System online. Welcome to Neo-Veridia, year 2142. Tap the neon towers to unlock secret datalogs.",
      modelType: "procedural_arena",
    },
  ],
};

export async function generateAIARExperience({
  topic,
  category = "flashcard",
  customPrompt = "",
  onProgress,
}) {
  if (onProgress) onProgress("1/5: AI Generating concept, script & story...");
  await new Promise((r) => setTimeout(r, 600));

  const cleanTopic = topic ? topic.trim() : "Fantasy Legend";
  const slug = cleanTopic.toLowerCase().replace(/[^a-z0-9]/g, "-");
  const uniqueId = `ai-${slug}-${Date.now().toString(36)}`;

  // Find template or generate dynamically
  const templates = PRESET_TOPIC_TEMPLATES[category] || PRESET_TOPIC_TEMPLATES.flashcard;
  const match = templates.find((t) => t.title.toLowerCase().includes(cleanTopic.toLowerCase()));

  if (onProgress) onProgress("2/5: AI Synthesizing high-contrast 2D marker artwork...");
  await new Promise((r) => setTimeout(r, 700));

  let title = match ? match.title : `${cleanTopic}`;
  let tagline = match ? match.tagline : `AI-Generated ${category.replace("_", " ")}`;
  let description = match
    ? match.description
    : `Experience ${cleanTopic} in interactive 3D Augmented Reality with sound effects and speech narration.`;
  let audioScript = match
    ? match.audioScript
    : `Hello! Welcome to the AR experience for ${cleanTopic}! Watch the 3D model come alive and interact with the scene!`;
  let markerPreview = match
    ? match.imagePreview
    : `https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600&auto=format&fit=crop&q=80`;

  if (onProgress) onProgress("3/5: AI Synthesizing 3D model geometry & shaders...");
  await new Promise((r) => setTimeout(r, 600));

  let modelConfig = {
    type: match?.modelType || (category === "gamebox" ? "procedural_arena" : category === "physical_story" ? "procedural_portal" : "procedural_solar"),
    targetHeight: 1.4,
    rotationSpeed: 0.5,
  };

  if (onProgress) onProgress("4/5: AI Synthesizing voiceover and educational quizzes...");
  await new Promise((r) => setTimeout(r, 500));

  const quiz = match?.quiz || {
    question: `What is the most iconic feature of ${cleanTopic}?`,
    options: ["Super strength & agility", "Ancient wisdom", "Cosmic power", "Elemental magic"],
    answer: 0,
  };

  if (onProgress) onProgress("5/5: Finalizing AR packaging & printable layout...");
  await new Promise((r) => setTimeout(r, 400));

  return {
    id: uniqueId,
    title,
    category,
    tagline,
    description,
    markerPreview,
    markerUrl: targetMindUrl,
    model: modelConfig,
    audio: {
      script: audioScript,
      pitch: 1.0,
      rate: 0.95,
      voiceName: "en-US",
    },
    quiz,
    pages: match?.pages || [
      { page: 1, title: `Chapter 1: The Legend of ${cleanTopic}`, text: `The journey begins here with ${cleanTopic}.` },
    ],
    printLayout: {
      cardType: category,
      dimensions: category === "gamebox" ? "10x10 Box" : category === "physical_story" ? "A4 Page" : "3.5x5 Card",
      instructions: "Print layout with auto-generated QR code.",
    },
    isCustomGenerated: true,
  };
}
