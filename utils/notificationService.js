const Notification = require('../models/Notification');
const User = require('../models/User');

class NotificationService {
  // Create a new notification
  static async createNotification({
    recipient,
    sender = null,
    type,
    title,
    message,
    translations = {},
    relatedArticle = null,
    relatedUser = null
  }) {
    try {
      const notification = new Notification({
        recipient,
        sender,
        type,
        title,
        message,
        translations,
        relatedArticle,
        relatedUser
      });

      await notification.save();
      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // Notify subscribers when a new article is published
  static async notifySubscribersNewArticle(article) {
    try {
      const author = await User.findById(article.author);
      if (!author) return;

      // Find all users subscribed to this author
      const subscribers = await User.find({
        subscriptions: article.author,
        status: 'active'
      });

      const notifications = subscribers.map(subscriber => ({
        recipient: subscriber._id,
        sender: article.author,
        type: 'new_article',
        title: `New article from ${author.name}`,
        message: `${author.name} published a new article: "${article.title}"`,
        translations: {
          en: {
            title: `New article from ${author.name}`,
            message: `${author.name} published a new article: "${article.title}"`
          },
          np: {
            title: `${author.name} बाट नयाँ लेख`,
            message: `${author.name} ले नयाँ लेख प्रकाशित गर्नुभयो: "${article.title}"`
          }
        },
        relatedArticle: article._id,
        relatedUser: article.author
      }));

      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }

      return notifications.length;
    } catch (error) {
      console.error('Error notifying subscribers:', error);
      throw error;
    }
  }

  // Notify author when article is approved
  static async notifyArticleApproved(article) {
    try {
      await this.createNotification({
        recipient: article.author,
        type: 'article_approved',
        title: 'Article Approved',
        message: `Your article "${article.title}" has been approved and published.`,
        translations: {
          en: {
            title: 'Article Approved',
            message: `Your article "${article.title}" has been approved and published.`
          },
          np: {
            title: 'लेख स्वीकृत',
            message: `तपाईंको लेख "${article.title}" स्वीकृत र प्रकाशित भएको छ।`
          }
        },
        relatedArticle: article._id
      });
    } catch (error) {
      console.error('Error notifying article approval:', error);
      throw error;
    }
  }

  // Notify author when article is rejected
  static async notifyArticleRejected(article, reason = '') {
    try {
      const message = reason 
        ? `Your article "${article.title}" was rejected. Reason: ${reason}`
        : `Your article "${article.title}" was rejected.`;

      await this.createNotification({
        recipient: article.author,
        type: 'article_rejected',
        title: 'Article Rejected',
        message,
        translations: {
          en: {
            title: 'Article Rejected',
            message
          },
          np: {
            title: 'लेख अस्वीकृत',
            message: reason 
              ? `तपाईंको लेख "${article.title}" अस्वीकृत भयो। कारण: ${reason}`
              : `तपाईंको लेख "${article.title}" अस्वीकृत भयो।`
          }
        },
        relatedArticle: article._id
      });
    } catch (error) {
      console.error('Error notifying article rejection:', error);
      throw error;
    }
  }

  // Notify author when someone comments on their article
  static async notifyNewComment(article, commenter, comment) {
    try {
      // Don't notify if the author commented on their own article
      if (article.author.toString() === commenter._id.toString()) {
        return;
      }

      await this.createNotification({
        recipient: article.author,
        sender: commenter._id,
        type: 'new_comment',
        title: 'New Comment',
        message: `${commenter.name} commented on your article "${article.title}"`,
        translations: {
          en: {
            title: 'New Comment',
            message: `${commenter.name} commented on your article "${article.title}"`
          },
          np: {
            title: 'नयाँ टिप्पणी',
            message: `${commenter.name} ले तपाईंको लेख "${article.title}" मा टिप्पणी गर्नुभयो`
          }
        },
        relatedArticle: article._id,
        relatedUser: commenter._id
      });
    } catch (error) {
      console.error('Error notifying new comment:', error);
      throw error;
    }
  }

  // Notify author when someone likes their article
  static async notifyNewLike(article, liker) {
    try {
      // Don't notify if the author liked their own article
      if (article.author.toString() === liker._id.toString()) {
        return;
      }

      await this.createNotification({
        recipient: article.author,
        sender: liker._id,
        type: 'new_like',
        title: 'Article Liked',
        message: `${liker.name} liked your article "${article.title}"`,
        translations: {
          en: {
            title: 'Article Liked',
            message: `${liker.name} liked your article "${article.title}"`
          },
          np: {
            title: 'लेख मनपर्यो',
            message: `${liker.name} ले तपाईंको लेख "${article.title}" लाई मनपर्यो`
          }
        },
        relatedArticle: article._id,
        relatedUser: liker._id
      });
    } catch (error) {
      console.error('Error notifying new like:', error);
      throw error;
    }
  }

  // Notify publisher when someone subscribes
  static async notifyNewSubscriber(publisher, subscriber) {
    try {
      await this.createNotification({
        recipient: publisher._id,
        sender: subscriber._id,
        type: 'new_subscriber',
        title: 'New Subscriber',
        message: `${subscriber.name} subscribed to your content`,
        translations: {
          en: {
            title: 'New Subscriber',
            message: `${subscriber.name} subscribed to your content`
          },
          np: {
            title: 'नयाँ सदस्य',
            message: `${subscriber.name} ले तपाईंको सामग्री सदस्यता लिनुभयो`
          }
        },
        relatedUser: subscriber._id
      });
    } catch (error) {
      console.error('Error notifying new subscriber:', error);
      throw error;
    }
  }

  // Send system announcement to all users or specific role
  static async sendSystemAnnouncement(title, message, translations = {}, targetRole = null) {
    try {
      const filter = { status: 'active' };
      if (targetRole) {
        filter.role = targetRole;
      }

      const users = await User.find(filter).select('_id');
      
      const notifications = users.map(user => ({
        recipient: user._id,
        type: 'system_announcement',
        title,
        message,
        translations
      }));

      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }

      return notifications.length;
    } catch (error) {
      console.error('Error sending system announcement:', error);
      throw error;
    }
  }

  // Clean up old notifications (older than 30 days)
  static async cleanupOldNotifications() {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const result = await Notification.deleteMany({
        createdAt: { $lt: thirtyDaysAgo },
        isRead: true
      });

      console.log(`Cleaned up ${result.deletedCount} old notifications`);
      return result.deletedCount;
    } catch (error) {
      console.error('Error cleaning up notifications:', error);
      throw error;
    }
  }
}

module.exports = NotificationService;
