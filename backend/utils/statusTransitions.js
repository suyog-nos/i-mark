/**
 * Article Status Transition Validation
 * 
 * Enforces valid status transitions based on user role
 */

// Define valid status transitions
const STATUS_TRANSITIONS = {
    // From draft
    draft: ['draft', 'pending'],

    // From pending (only admin can approve/reject)
    pending: ['pending', 'published', 'rejected', 'flagged'],

    // From published (only admin can unpublish)
    published: ['published', 'flagged', 'draft'],

    // From rejected (can edit and resubmit)
    rejected: ['rejected', 'draft', 'pending'],

    // From flagged (admin can fix or reject)
    flagged: ['flagged', 'pending', 'published', 'rejected', 'draft'],

    // From scheduled
    scheduled: ['scheduled', 'draft', 'pending']
};

/**
 * Validate if a status transition is allowed
 * @param {string} currentStatus - Current article status
 * @param {string} newStatus - Desired new status
 * @param {string} userRole - User's role (reader/publisher/admin)
 * @returns {Object} { valid: boolean, error: string }
 */
const validateStatusTransition = (currentStatus, newStatus, userRole) => {
    // If no status change, always valid
    if (currentStatus === newStatus) {
        return { valid: true };
    }

    // Check if transition is in allowed list
    const allowedTransitions = STATUS_TRANSITIONS[currentStatus];
    if (!allowedTransitions || !allowedTransitions.includes(newStatus)) {
        return {
            valid: false,
            error: `Invalid status transition: ${currentStatus} → ${newStatus}`
        };
    }

    // Role-specific restrictions
    if (userRole === 'publisher') {
        // Publishers cannot directly publish
        if (newStatus === 'published') {
            return {
                valid: false,
                error: 'Publishers cannot directly publish articles. Submit for review (pending) instead.'
            };
        }

        // Publishers cannot reject or flag
        if (newStatus === 'rejected' || newStatus === 'flagged') {
            return {
                valid: false,
                error: 'Only admins can reject or flag articles'
            };
        }

        // Publishers can only move to draft or pending
        if (!['draft', 'pending'].includes(newStatus)) {
            return {
                valid: false,
                error: `Publishers can only set status to 'draft' or 'pending'`
            };
        }
    }

    // Admin has full control, no restrictions
    return { valid: true };
};

/**
 * Get safe status for article creation
 * @param {string} requestedStatus - Status requested by user
 * @param {string} userRole - User's role
 * @returns {string} Safe status to use
 */
const getSafeCreateStatus = (requestedStatus, userRole) => {
    if (userRole === 'admin') {
        // Admins can create with any valid status except published
        // (published should go through approval flow)
        const validStatuses = ['draft', 'pending', 'scheduled'];
        return validStatuses.includes(requestedStatus) ? requestedStatus : 'draft';
    }

    // Publishers can only create draft or pending
    if (requestedStatus === 'pending') {
        return 'pending'; // Allow direct submission for review
    }

    // Default to draft for publishers
    return 'draft';
};

module.exports = {
    validateStatusTransition,
    getSafeCreateStatus,
    STATUS_TRANSITIONS
};
