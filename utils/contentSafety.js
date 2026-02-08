const prohibitedWords = [
    'spam', 'scam', 'fake news', 'viagra', 'casino', 'betting', 'gamble',
    'hate', 'violence', 'terror', 'offensive_word1', 'offensive_word2'
];

const checkSafety = (content, title) => {
    const text = (title + ' ' + content).toLowerCase();
    const findings = [];

    // Check for prohibited words
    const foundWords = prohibitedWords.filter(word => text.includes(word));
    if (foundWords.length > 0) {
        findings.push(`Contains potential restricted keywords: ${foundWords.join(', ')}`);
    }

    // Check for excessive capitalization (potential clickbait/spam)
    const upperCaseChars = (title + content).replace(/[^A-Z]/g, '').length;
    const totalChars = (title + content).replace(/[^a-zA-Z]/g, '').length;
    if (totalChars > 50 && (upperCaseChars / totalChars) > 0.4) {
        findings.push('Excessive capitalization detected (Potential clickbait)');
    }

    // Check for many links (potential spam)
    const urlCount = (text.match(/http|https|www\./g) || []).length;
    if (urlCount > 5) {
        findings.push('High number of external links detected (Potential spam)');
    }

    return {
        isSafe: findings.length === 0,
        riskLevel: findings.length > 2 ? 'high' : (findings.length > 0 ? 'medium' : 'low'),
        reasons: findings
    };
};

module.exports = { checkSafety };
