/**
 * Email Service (Mock Implementation)
 * In a production environment, this would use nodemailer or an external API like SendGrid/Mailgun.
 */

class EmailService {
    static async sendEmail({ to, subject, body, html }) {
        // Implementation placeholder
        console.log('--- EMAIL SIMULATION ---');
        console.log(`To: ${to}`);
        console.log(`Subject: ${subject}`);
        console.log(`Body: ${body || 'See HTML content'}`);
        console.log('------------------------');

        // Return true to simulate success
        return true;
    }

    static async notifyModerationAction(user, article, status, reason = '') {
        const subject = `Article Status Update: ${article.title}`;
        const message = status === 'published'
            ? `Congratulations! Your article "${article.title}" has been approved and published.`
            : `Your article "${article.title}" was ${status}. ${reason ? `Reason: ${reason}` : ''}`;

        return this.sendEmail({
            to: user.email,
            subject,
            body: message
        });
    }

    static async notifyNewSubscriber(publisher, subscriber) {
        return this.sendEmail({
            to: publisher.email,
            subject: 'New Subscriber!',
            body: `${subscriber.name} has subscribed to your news feed.`
        });
    }
}

module.exports = EmailService;
