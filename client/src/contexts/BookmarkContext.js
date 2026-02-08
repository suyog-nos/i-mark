import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const BookmarkContext = createContext();

export const useBookmarks = () => {
    const context = useContext(BookmarkContext);
    if (!context) {
        throw new Error('useBookmarks must be used within a BookmarkProvider');
    }
    return context;
};

export const BookmarkProvider = ({ children }) => {
    const { isAuthenticated, token } = useAuth();
    const [bookmarks, setBookmarks] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchBookmarks = useCallback(async () => {
        if (!isAuthenticated || !token) return;

        setLoading(true);
        try {
            const response = await axios.get('/api/articles/my/bookmarks', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBookmarks(response.data || []);
        } catch (error) {
            console.error('Error fetching bookmarks:', error);
            setBookmarks([]);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, token]);

    useEffect(() => {
        fetchBookmarks();
    }, [fetchBookmarks]);

    const toggleBookmark = async (article) => {
        if (!isAuthenticated || !token) return;

        try {
            const response = await axios.post(`/api/articles/${article._id}/bookmark`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.isBookmarked) {
                setBookmarks(prev => [...prev, article]);
            } else {
                setBookmarks(prev => prev.filter(b => b._id !== article._id));
            }
            return response.data.isBookmarked;
        } catch (error) {
            console.error('Error toggling bookmark:', error);
            return false;
        }
    };

    const isBookmarked = (articleId) => {
        return bookmarks.some(b => b._id === articleId);
    };

    const value = {
        bookmarks,
        loading,
        fetchBookmarks,
        toggleBookmark,
        isBookmarked
    };

    return (
        <BookmarkContext.Provider value={value}>
            {children}
        </BookmarkContext.Provider>
    );
};
