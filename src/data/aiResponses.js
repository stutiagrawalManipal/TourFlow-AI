/**
 * TourFlow AI - Intelligent Tourist Companion Knowledge Base
 * Grounded mock responses for Indian monuments and tourist inquiries.
 */

export const SUGGESTED_QUESTIONS = [
  "Tell me the history of this place",
  "What should I see first?",
  "Why is this monument famous?",
  "How much time should I plan for?"
];

export const DESTINATION_KNOWLEDGE = {
  'taj-mahal': {
    history: `The Taj Mahal was commissioned in 1632 by the fifth Mughal Emperor, Shah Jahan, in memory of his beloved chief empress, Mumtaz Mahal. Over 20,000 stone carvers, calligraphers, and master masons worked under imperial architect Ustad Ahmad Lahori for 22 years until completion in 1653. The pure white Makrana marble was transported via elephant convoys from Rajasthan over 300 kilometres away.`,
    seeFirst: `Start with the Great Gate (Darwaza-i-Rauza) for your first iconic framed view of the mausoleum. Next, walk along the marble central watercourses of the Charbagh garden toward the plinth. Visit the interior octagonal cenotaph chamber before crowds peak, and conclude at the riverfront red sandstone terrace overlooking the Yamuna river.`,
    famousFor: `It is globally celebrated as the pinnacle of Mughal architectural symmetry, blending Persian, Timurid, and Indian styles. The ivory marble exhibits subtle optical illusions and shifts color throughout the day—from soft pink at dawn, brilliant white at midday, to golden bronze under moonlight. It is an enduring UNESCO World Heritage Site and one of the New Seven Wonders of the World.`,
    timeNeeded: `Plan for approximately 2.5 to 3 hours. This gives you ample time for security clearance, strolling through the 300-meter gardens, inspecting the Pietra Dura gemstone inlays inside the main dome, and capturing photography along the Yamuna viewpoint.`,
    tips: `Arrive right at dawn (gates open 30 minutes before sunrise) to experience the shortest queues and serene morning mist. Shoes must be covered with shoe slip-ons before climbing the marble plinth.`
  },
  'amer-fort': {
    history: `Amer Fort was originally founded in 967 CE by the Chanda clan of Meenas and later developed into a formidable citadel by Raja Man Singh I starting in 1592. As the trusted general of Emperor Akbar, Man Singh incorporated both Rajput valor and Mughal imperial aesthetics into this hilltop palace.`,
    seeFirst: `Head directly through the Sun Gate (Suraj Pol) into Jaleb Chowk. From there, ascend the grand staircase to the Sheesh Mahal (Palace of Mirrors)—its thousands of convex mirrors reflect candlelight into starry constellations. Next explore the Sukh Niwas cooling chamber and the subterranean secret tunnel leading to Jaigarh Fort.`,
    famousFor: `Amer Fort is celebrated for its harmonious fusion of Hindu and Rajput art: expansive courtyards, marble lattice windows (jharokhas), painted fresco archways, and the legendary mirror mosaic hall where a single flickering flame could illuminate the entire royal bedchamber.`,
    timeNeeded: `Allow 2.5 to 3.5 hours. The fortress complex is expansive with multiple levels, palace quarters, garden terraces, and steep cobbled pathways overlooking Maota Lake.`,
    tips: `Wear comfortable walking shoes with good grip. Consider booking an early morning slot (08:30 AM) to beat the midday desert heat, or attend the illuminated evening sound-and-light presentation.`
  },
  'gateway-of-india': {
    history: `Designed by architect George Wittet and completed in 1924, the Gateway of India was built to commemorate the 1911 royal landing of King George V and Queen Mary. Fittingly, it also served as the ceremonial departure portal through which the First Battalion of the Somerset Light Infantry—the final British troops—marched out on 28 February 1948, marking the end of colonial rule.`,
    seeFirst: `Begin at the open plaza facing Mumbai Harbor. Stand directly under the 26-meter yellow basalt archway to admire its Indo-Saracenic vaulted ceiling and lattice screens. Afterwards, stroll along the promenade toward the historic Taj Mahal Palace Hotel facade.`,
    famousFor: `It is Mumbai's defining waterfront landmark, symbolizing the city's cosmopolitan maritime heritage, dynamic street culture, and serving as the primary embarkation point for ferries to the ancient 5th-century Elephanta Caves.`,
    timeNeeded: `1 to 1.5 hours is ideal for viewing the arch, taking waterfront photos, and enjoying the sea breeze. If you plan to board the Elephanta Island ferry, add another 4 hours.`,
    tips: `Sunset between 05:30 PM and 07:00 PM is magical, but crowd levels reach their peak. Use TourFlow AI's digital pass to plan queue-free entry during security intervals.`
  },
  'charminar': {
    history: `Charminar was built in 1591 by Muhammad Quli Qutb Shah, the fifth ruler of the Qutb Shahi dynasty, upon relocating his capital from Golconda to Hyderabad. Tradition states it was erected to mark the miraculous cessation of a devastating cholera epidemic that had swept the kingdom.`,
    seeFirst: `Start under the grand four-pointed central archway where the city's four cardinal arterial roads intersect. Climb the spiraling stairs (if open to visitors) to the first-floor balcony for a panoramic view of the bustling Laad Bazaar and Mecca Masjid.`,
    famousFor: `It is world-renowned for its architectural signature: four soaring minarets reaching 48.7 metres with intricately carved double balconies, delicate stucco floral arabesques, and housing Hyderabad's oldest surviving high-altitude mosque on its upper floor.`,
    timeNeeded: `Allocate 1.5 to 2 hours. This leaves time to tour the monument and explore the adjacent historical bazaars for authentic Hyderabadi pearls and attar perfumes.`,
    tips: `Evening visits provide stunning illumination of the stucco work. Combine your visit with a stop at Nimrah Cafe for traditional Irani chai and Osmania biscuits right across the plaza.`
  },
  'konark-sun-temple': {
    history: `Constructed around 1250 CE by King Narasimhadeva I of the Eastern Ganga dynasty, the Konark Sun Temple was designed as a monumental cosmic chariot for the Hindu solar deity Surya. European mariners called it the 'Black Pagoda' because its towering dark stone sikhara once acted as a vital coastal navigational beacon.`,
    seeFirst: `Examine the 24 gigantic carved stone wheels that line the base of the chariot platform. Next, admire the seven galloping stone horses, and then step into the Nata Mandir (Hall of Dance) with its high-relief sculptures of celestial musicians and dancers.`,
    famousFor: `It is revered for its extraordinary mathematical and astronomical precision. The spokes of the chariot wheels cast shadows that function as accurate sundials, indicating time down to the minute. The erotic, spiritual, and courtly Kalinga stone carvings are unmatched in detail.`,
    timeNeeded: `Plan for 2 to 2.5 hours. The archaeological park is spacious, tranquil, and packed with intricate relief panels that reward close inspection.`,
    tips: `Visit at early morning sunrise (around 06:30 AM). The first rays of daylight illuminate the entrance sculptures exactly as medieval temple architects originally designed.`
  },
  'hampi': {
    history: `Between 1336 and 1565 CE, Hampi was the thriving metropolis and capital of the Vijayanagara Empire—at its peak, the second-largest city in the medieval world after Beijing. Global traders exchanged Persian pearls, diamonds from Golconda, and Arabian thoroughbred horses in its sprawling stone arcades.`,
    seeFirst: `Start at the Sacred Centre: Virupaksha Temple, an active place of worship since the 7th century. From there, take a battery-operated cart to the Vittala Temple complex to see the iconic Stone Chariot and touch the melodic granite musical pillars.`,
    famousFor: `Hampi is famous for its otherworldly surreal landscape of giant weathered boulders juxtaposed with over 1,600 royal palaces, military stables, stone aqueducts, and Dravidian temples spread along the banks of the sacred Tungabhadra River.`,
    timeNeeded: `Hampi is massive; plan a minimum of 4 to 6 hours (or a full day). Renting a local bicycle or e-rickshaw is recommended to travel between the Sacred Centre and Royal Enclosure.`,
    tips: `Hike up Matanga Hill for sunrise or sunset for an awe-inspiring 360-degree panorama of the boulder valley. Stay well hydrated, as daytime temperatures can be high.`
  },
  'qutub-minar': {
    history: `Initiated in 1199 CE by Qutb-ud-din Aibak to mark the establishment of the Delhi Sultanate, the tower was expanded to five storeys by Shams-ud-din Iltutmish and later repaired by Firoz Shah Tughlaq. The surrounding complex contains antiquities spanning over 1,500 years of Delhi's turbulent history.`,
    seeFirst: `Gaze up at the 72.5-meter fluted minaret to observe the progression from red sandstone to white marble tiers. Then visit the 4th-century Gupta-period Iron Pillar standing in the courtyard of Quwwat-ul-Islam Mosque, renowned for its rust-defying metallurgy.`,
    famousFor: `It is the tallest brick minaret in the world and an extraordinary testament to early Indo-Islamic engineering, marked by projecting balconies supported by intricate stalactite honeycomb brackets (muqarnas).`,
    timeNeeded: `1.5 to 2 hours is sufficient to leisurely explore the minaret base, Alai Darwaza gateway, Iltutmish's intricately carved sandstone tomb, and the unfinished colossal Alai Minar.`,
    tips: `Visit in the late afternoon (around 04:30 PM). The evening lighting turns on at dusk, casting a dramatic amber glow across the ancient masonry.`
  },
  'meenakshi-temple': {
    history: `Madurai is one of the world's oldest continuously inhabited cities. The Meenakshi Sundareswarar temple was originally established over two millennia ago and was rebuilt to its present colossal scale during the 16th–17th centuries under the visionary Nayak rulers, particularly King Thirumalai Nayak.`,
    seeFirst: `Pass through the soaring Southern Gopuram and proceed to the Golden Lotus Tank (Porthamarai Kulam). Next, enter the famous Thousand Pillar Hall (Aayiram Kaal Mandapam) to view the 985 exquisitely carved monolithic pillars depicting deities and mythical beasts.`,
    famousFor: `Renowned for its 14 monumental gateway towers (gopurams), encrusted with thousands of vividly painted stucco figures of gods, goddesses, demons, and celestial beings. It is a living spiritual epicentre with thousands of worshippers gathering daily.`,
    timeNeeded: `Allow 2.5 to 3 hours. Security checks are thorough, and proper respectful dress (covered shoulders and legs) is mandatory. Electronic devices may need to be deposited in lockers.`,
    tips: `Don't miss the nightly ceremony at approximately 09:00 PM, when the deity Sundareswarar is carried in a brass palanquin to Goddess Meenakshi's shrine amidst traditional nadaswaram music and incense.`
  }
};

/**
 * Generate a smart response based on destination and user prompt
 */
export function getAIResponse(destinationId, prompt) {
  const p = prompt.toLowerCase();
  const dest = DESTINATION_KNOWLEDGE[destinationId] || DESTINATION_KNOWLEDGE['taj-mahal'];

  if (p.includes('history') || p.includes('built') || p.includes('who') || p.includes('when')) {
    return dest.history;
  }
  if (p.includes('first') || p.includes('start') || p.includes('begin') || p.includes('itinerary')) {
    return dest.seeFirst;
  }
  if (p.includes('famous') || p.includes('why') || p.includes('special') || p.includes('importance')) {
    return dest.famousFor;
  }
  if (p.includes('time') || p.includes('hours') || p.includes('how long') || p.includes('duration')) {
    return `${dest.timeNeeded} ${dest.tips}`;
  }
  if (p.includes('crowd') || p.includes('queue') || p.includes('wait') || p.includes('line')) {
    return `Currently, TourFlow AI sensors indicate live crowd activity at this site. ${dest.tips} You can join the TourFlow digital FIFO queue directly from the destination page to bypass waiting queues!`;
  }
  if (p.includes('tip') || p.includes('photo') || p.includes('advice') || p.includes('wear')) {
    return dest.tips;
  }

  // General conversational answer fallback
  return `Regarding your question about this heritage landmark: ${dest.famousFor} For visiting tips: ${dest.tips}`;
}
