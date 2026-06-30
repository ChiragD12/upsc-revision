/**
 * Processes a raw text string and converts it into a structured data object
 * that can be passed to importStructuredData.
 * @param {string} text - The raw text to import.
 * @param {object} metadata - An object containing subject and topic. e.g., { subject: 'History', topic: 'Modern India' }
 * @returns {Array} An array containing a single normalized dataset item, or an empty array if processing fails.
 */
function importText(text, metadata = {}) {
    if (typeof text !== 'string' || !text.trim()) {
        console.error("Import failed: Input text is empty or invalid.");
        return [];
    }
    if (!metadata.subject || !metadata.topic) {
        console.error("Import failed: Metadata with subject and topic is required for text import.");
        return [];
    }

    const lines = text.trim().split('\n');
    const title = lines[0]; // Use the first line as the title
    const content = lines.join('\n');

    const structuredItem = {
        title: title,
        content: content,
        subject: metadata.subject,
        topic: metadata.topic,
        keywords: metadata.keywords || [],
        related: metadata.related || []
    };

    return importStructuredData([structuredItem]);
}

/**
 * Processes an array of structured data, validates it, and normalizes it
 * into the application's dataset format.
 * @param {Array<object>} data - An array of raw data objects.
 * @returns {Array<object>} An array of valid, normalized dataset items.
 */
function importStructuredData(data) {
    if (!Array.isArray(data)) {
        console.error("Import failed: Data must be an array.");
        return [];
    }

    return data
        .map((item, index) => {
            if (!validateDatasetItem(item)) {
                console.warn(`Skipping malformed item at index ${index}.`);
                return null;
            }
            return normalizeDatasetItem(item, index);
        })
        .filter(Boolean); // Filter out any null (skipped) items
}

/**
 * Validates that a raw item has the minimum required fields.
 * @param {object} item - The raw data object.
 * @returns {boolean} True if valid, false otherwise.
 */
function validateDatasetItem(item) {
    return item && item.title && item.content && item.subject && item.topic;
}

/**
 * Converts a single raw data item into the universal dataset schema.
 * @param {object} rawItem - The validated raw data object.
 * @param {number} index - The index for generating a unique ID.
 * @returns {object} A normalized dataset item.
 */
function normalizeDatasetItem(rawItem, index) {
    return {
        id: `imported-${Date.now()}-${index}`,
        subject: rawItem.subject,
        topic: rawItem.topic,
        title: rawItem.title,
        description: rawItem.content.substring(0, 100) + '...',
        explanation: rawItem.content,
        keywords: Array.isArray(rawItem.keywords) ? rawItem.keywords : [],
        related: Array.isArray(rawItem.related) ? rawItem.related : [],
        facts: [{ statement: rawItem.title, answer: rawItem.content }],
        questionTypes: ["mcq", "reverseMcq"]
    };
}

/**
 * A placeholder for future AI-powered fact extraction from text.
 * Currently returns a single basic fact.
 * @param {string} text - The content to be analyzed.
 * @returns {Array<object>} An array of fact objects.
 */
function splitIntoFacts(text) {
    // This will be replaced with more sophisticated AI/NLP logic later.
    const sentences = text.split('. ').filter(s => s.length > 10);
    if (sentences.length > 1) {
        return [{ statement: sentences[0], answer: sentences.slice(1).join('. ') }];
    }
    return [{ statement: "Main idea", answer: text }];
}