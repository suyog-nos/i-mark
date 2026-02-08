const Article = require('../models/Article');
const NotificationService = require('./notificationService');

const startScheduler = (io) => {
    console.log('Article publication scheduler started...');

    // Run every minute
    setInterval(async () => {
        try {
            const now = new Date();

            // Find articles that are scheduled and the publish time has passed
            const articlesToPublish = await Article.find({
                status: 'scheduled',
                scheduledPublish: { $lte: now }
            }).populate('author', 'name profile.picture');

            if (articlesToPublish.length > 0) {
                console.log(`Scheduler: Publishing ${articlesToPublish.length} scheduled articles...`);

                for (const article of articlesToPublish) {
                    article.status = 'published';
                    article.createdAt = now; // Update the published date to now
                    await article.save();

                    // Emit socket event for real-time update
                    if (io) {
                        io.emit('article_published', article);
                    }

                    // Notify subscribers
                    await NotificationService.notifySubscribersNewArticle(article);

                    // Notify author
                    await NotificationService.createNotification({
                        recipient: article.author._id,
                        type: 'article_published',
                        title: 'Scheduled Article Published',
                        message: `Your scheduled article "${article.title}" has been successfully published.`,
                        translations: {
                            en: {
                                title: 'Scheduled Article Published',
                                message: `Your scheduled article "${article.title}" has been successfully published.`
                            },
                            np: {
                                title: 'अनुसूचित लेख प्रकाशित',
                                message: `तपाईंको अनुसूचित लेख "${article.title}" सफलतापूर्वक प्रकाशित भएको छ।`
                            }
                        },
                        relatedArticle: article._id
                    });
                }
            }
        } catch (error) {
            console.error('Scheduler Error:', error);
        }
    }, 60000); // Check every 60 seconds
};

module.exports = startScheduler;
