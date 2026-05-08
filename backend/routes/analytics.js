const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Article = require('../models/Article');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

// Get Dashboard Analytics (Admin Only)
router.get('/dashboard', auth, authorize('admin'), async (req, res) => {
    try {
        const [
            totalUsers,
            totalArticles,
            pendingArticles,
            totalViews,
            userDistribution,
            topPublishers
        ] = await Promise.all([
            User.countDocuments(),
            Article.countDocuments({ status: 'published' }),
            Article.countDocuments({ status: 'pending' }),
            Article.aggregate([
                { $group: { _id: null, totalViews: { $sum: "$views" } } }
            ]),
            User.aggregate([
                { $group: { _id: "$role", count: { $sum: 1 } } }
            ]),
            Article.aggregate([
                { $match: { status: 'published' } },
                {
                    $group: {
                        _id: "$author",
                        totalViews: { $sum: "$views" },
                        articleCount: { $sum: 1 }
                    }
                },
                { $sort: { totalViews: -1 } },
                { $limit: 10 },
                {
                    $lookup: {
                        from: 'users',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'authorInfo'
                    }
                },
                { $unwind: "$authorInfo" },
                {
                    $project: {
                        name: "$authorInfo.name",
                        totalViews: 1,
                        articleCount: 1
                    }
                }
            ])
        ]);

        const views = totalViews.length > 0 ? totalViews[0].totalViews : 0;

        console.log('--- Analytics Debug ---');
        console.log('Users:', totalUsers);
        console.log('Articles:', totalArticles);
        console.log('Views:', views);
        console.log('Distribution:', userDistribution);
        console.log('-----------------------');

        res.json({
            totalUsers,
            totalArticles,
            pendingArticles,
            totalViews: views,
            userDistribution,
            topPublishers
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Category Distribution (Admin Only)
router.get('/categories', auth, authorize('admin'), async (req, res) => {
    try {
        const distribution = await Article.aggregate([
            { $match: { status: 'published' } },
            { $group: { _id: "$category", count: { $sum: 1 } } }
        ]);

        res.json(distribution);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Most Read Articles (Admin Only)
router.get('/most-read', auth, authorize('admin'), async (req, res) => {
    try {
        const articles = await Article.find({ status: 'published' })
            .sort({ views: -1 })
            .limit(5)
            .select('title views');

        res.json(articles);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Publisher Analytics (Publisher or Admin only)
router.get('/publisher', auth, authorize('publisher', 'admin'), async (req, res) => {
    try {
        let authorId = req.user._id;

        // Allow admins to view any publisher's analytics by ID
        if (req.query.id && req.user.role === 'admin') {
            authorId = req.query.id;
        }

        const [
            totalArticles,
            articleStats,
            statusDistribution,
            topArticles,
            trends
        ] = await Promise.all([
            Article.countDocuments({ author: authorId }),
            Article.aggregate([
                { $match: { author: new mongoose.Types.ObjectId(authorId) } },
                {
                    $group: {
                        _id: null,
                        totalViews: { $sum: "$views" },
                        totalLikes: { $sum: { $size: { $ifNull: ["$likes", []] } } },
                        totalShares: { $sum: "$shares" },
                        totalComments: { $sum: { $size: { $ifNull: ["$comments", []] } } }
                    }
                }
            ]),
            Article.aggregate([
                { $match: { author: new mongoose.Types.ObjectId(authorId) } },
                { $group: { _id: "$status", count: { $sum: 1 } } }
            ]),
            Article.find({ author: authorId })
                .sort({ views: -1 })
                .limit(5)
                .select('title views likes shares createdAt'),
            Article.aggregate([
                { $match: { author: new mongoose.Types.ObjectId(authorId) } },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } },
                { $limit: 30 }
            ])
        ]);

        const stats = articleStats.length > 0 ? articleStats[0] : {
            totalViews: 0,
            totalLikes: 0,
            totalShares: 0,
            totalComments: 0
        };

        res.json({
            totalArticles,
            ...stats,
            statusDistribution,
            topArticles,
            trends
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Visitor Trends (Admin Only)
router.get('/trends', auth, authorize('admin'), async (req, res) => {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const trends = await Article.aggregate([
            { $match: { status: 'published', createdAt: { $gte: sevenDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json(trends);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
