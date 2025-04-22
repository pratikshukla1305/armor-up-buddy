
/**
 * Crime descriptions for AI analysis results
 */

export const crimeDescriptions = {
  "abuse": 
    "The detected video may involve abuse-related actions.\n" +
    "Abuse can be verbal, emotional, or physical.\n" +
    "It often includes intentional harm inflicted on a victim.\n" +
    "The victim may display distress or defensive behavior.\n" +
    "There might be aggressive body language or shouting.\n" +
    "Such scenes usually lack mutual consent or context of play.\n" +
    "These actions are violations of basic human rights.\n" +
    "It is important to report such behavior to authorities.\n" +
    "Detection helps in early intervention and protection.\n" +
    "Please verify with human oversight for further action.",
  
  "assault": 
    "Assault involves a physical attack or aggressive encounter.\n" +
    "This may include punching, kicking, or pushing actions.\n" +
    "The victim may be seen retreating or being overpowered.\n" +
    "There is usually a visible conflict or threat present.\n" +
    "Such behavior is dangerous and potentially life-threatening.\n" +
    "Immediate attention from security or authorities is critical.\n" +
    "Assault detection can help prevent further escalation.\n" +
    "The video may include violent gestures or weapons.\n" +
    "Please proceed with care while reviewing such footage.\n" +
    "Confirm with experts before initiating legal steps.",
  
  "arson": 
    "This video likely captures an incident of arson.\n" +
    "Arson is the criminal act of intentionally setting fire.\n" +
    "You may see flames, smoke, or ignition devices.\n" +
    "Often, it targets property like buildings or vehicles.\n" +
    "Arson can lead to massive destruction and danger to life.\n" +
    "There might be a rapid spread of fire visible.\n" +
    "Suspects may appear to flee the scene post-ignition.\n" +
    "These cases require immediate fire and law response.\n" +
    "Check for signs of accelerants or premeditated setup.\n" +
    "This detection must be validated with caution.",
  
  "arrest": 
    "The scene likely depicts a law enforcement arrest.\n" +
    "An arrest involves restraining a suspect or individual.\n" +
    "You may see officers using handcuffs or other tools.\n" +
    "The individual may be cooperating or resisting.\n" +
    "It could be in public or private settings.\n" +
    "Often, the suspect is guided or pushed into a vehicle.\n" +
    "The presence of uniforms or badges may be evident.\n" +
    "These scenarios may follow legal procedures.\n" +
    "Misidentification is possible — confirm context.\n" +
    "Verify with official reports before assuming guilt."
};

/**
 * Get description for a specific crime type
 * @param crimeType Type of crime
 * @returns Detailed description
 */
export const getCrimeDescriptionByType = (crimeType: string): string => {
  const normalizedType = crimeType.toLowerCase();
  return crimeDescriptions[normalizedType as keyof typeof crimeDescriptions] || 
    "No detailed description available for this crime type.";
};

export default { crimeDescriptions, getCrimeDescriptionByType };
